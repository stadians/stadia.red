(async () => "plugin entry point")().then(async () => {
  await new Promise((resolve) => setTimeout(resolve, 10));
  try {
    console.clear();
    const spider = new Spider();
    window["spider"] = spider;
    console.debug("🕷️👀", "starting spider", spider);
    const data = await spider.load();
    console.debug("🕷️👀", "completed spider", spider, data);
    // spider.download();
  } catch (error) {
    console.error("🕷️👀", error);
  }
});

type ProtoData = any & Array<ProtoData | number | string | boolean | null>;

class Spider {
  private readonly start: () => void;
  private readonly done: Promise<unknown>;
  public constructor(
    private readonly products: Record<Product["sku"], Product> = {},
    private readonly spidered: Record<Product["sku"], true> = {}
  ) {
    let start: () => void;
    const started = new Promise((resolve) => (start = resolve));
    this.start = start;
    this.done = started
      .then(() => this.spider())
      .then(() => {
        Object.freeze(this.products);
        for (const product of Object.values(this.products)) {
          Object.freeze(product);
        }
      });
  }

  public async load() {
    this.start();
    await this.done;
    return this.products;
  }

  private async spider() {
    await this.loadProductList(3);
    await this.loadProductList(2001);
    await this.loadProductList(45);
    await this.loadProductDetails("be9526126d394061b0eef9b16352357e");

    while (
      Object.keys(this.products).length > Object.keys(this.spidered).length
    ) {
      for (const product of Object.values(this.products)) {
        if (this.spidered[product.sku] !== true) {
          console.debug("🕷️👀", "spidering ", product);
          await this.loadProductDetails(product.sku);
          this.spidered[product.sku] = true;
        }
      }
    }
  }

  public download() {
    const json = JSON.stringify(this.products, null, 2);
    // XXX: this blob is leaked
    const href = URL.createObjectURL(
      new Blob([json], {
        type: "application/json",
      })
    );
    const el = Object.assign(document.createElement("a"), {
      download: "stadia.observer.json",
      href,
    });
    document.body.appendChild(el);
    el.click();
    document.body.removeChild(el);
  }

  private async loadProductList(number: number): Promise<Array<Product>> {
    const page = await this.fetchPreloadData(`/store/list/${number}`);
    return page.products;
  }

  private async loadProductDetails(sku: string) {
    const page = await this.fetchPreloadData(`/store/details/sku/sku/${sku}`);
    return page;
  }

  private loadProductData(data: ProtoData): Product {
    let product;
    if (data[6] === 1) {
      product = new Game(data[4], data[0], "game", data[1], data[5], data[9]);
    } else if (data[6] === 2) {
      product = new AddOn(data[4], data[0], "addon", data[1]);
    } else if (data[6] === 3) {
      product = new Bundle(
        data[4],
        data[0],
        "bundle",
        data[1],
        data[14][0].map((x) => x[0])
      );
    } else {
      throw new Error(
        `unexpected product type id ${JSON.stringify(data[6], null, 4)}`
      );
    }

    return this.loadProduct(product);
  }

  private loadProduct(product: Product): Product {
    const existing = this.products[product.sku];
    if (existing) {
      if (JSON.stringify(existing) !== JSON.stringify(product)) {
        const error = new Error(`products had same sku but different values`);
        console.error("🕷️👀", error);
        console.error("🕷️👀", existing, product);
        throw error;
      }
      return existing;
    } else {
      this.products[product.sku] = product;
      return product;
    }
  }

  async fetchPreloadData(url: string) {
    await new Promise((resolve) =>
      setTimeout(resolve, Math.random() * 3500 + 1500)
    );
    const response = await fetch(url);
    const html = await response.text();
    const document = new DOMParser().parseFromString(html, "text/html");
    const scripts = Array.from(document.scripts);
    const contents = scripts.map((s) => s.textContent.trim()).filter(Boolean);

    const dataServiceRequestsPattern = /^var *AF_initDataKeys[^]*?var *AF_dataServiceRequests *= *({[^]*}); *?var /;

    const dataServiceRequests = contents
      .map((s) => s.match(dataServiceRequestsPattern))
      .filter(Boolean)
      .map((matches) =>
        JSON.parse(
          matches[1]
            .replace(/{id:/g, '{"id":')
            .replace(/,request:/g, ',"request":')
            .replace(/'/g, '"')
        )
      )
      .map((requests) =>
        Object.fromEntries(
          Object.entries(requests).map(([key, value]: any) => [key, value])
        )
      )[0];

    const dataCallbackPattern = /^ *AF_initDataCallback *\( *{ *key *: *'([^]*?)' *,[^]*?data: *function *\( *\){ *return *([^]*)\s*}\s*}\s*\)\s*;?\s*$/;
    const dataServiceLoads = contents
      .map((s) => s.match(dataCallbackPattern))
      .filter(Boolean)
      .map((matches) => JSON.parse(matches[2]));

    const dataServiceRpcPrefixes = Object.values(dataServiceRequests).map(
      (x: any) => {
        const pieces = [x.id, ...x.request];
        const aliases = [];
        aliases.push(
          `${pieces[0]}_${pieces.filter((x) => x != null).length - 1}s${
            pieces.filter(Boolean).length - 1
          }t${pieces.length - 1}a`
        );
        while (pieces.length) {
          aliases.push(pieces.join("_"));
          pieces.pop();
        }
        return aliases;
      }
    );

    const preload = Object.values(dataServiceLoads);
    const rpc = {};
    const alias = {};

    const loaders = {
      WwD3rb: (products: ProtoData) => {
        products = products[2].map((p) => this.loadProductData(p[9]));
        return { products };
      },
      Qc7K6_24r: (product: ProtoData) => {
        const game =
          product[18]?.[0]?.[9] && this.loadProductData(product[18][0][9]);
        const addons = (product[19] as any)?.map((x) =>
          this.loadProductData(x[9])
        );
        product = product[16] && this.loadProductData(product[16]);

        return { product: { product, game, addons } };
      },
    };

    for (const [i, data] of Object.entries(preload)) {
      for (const prefix of dataServiceRpcPrefixes[i]) {
        for (const suffix of ["", "_" + Object.keys(data).length + "r"]) {
          rpc[prefix + suffix] = data;
          const loader = loaders[prefix + suffix];
          if (loader) {
            Object.assign(alias, loader(data));
          }
        }
      }
    }

    const data = Object.assign(
      Object.create({
        preload,
        rpc,
      }),
      alias
    );

    console.debug("🕷️👀", url, data);

    return data;
  }
}

class Product {
  constructor(
    readonly appId = "a4c5eb3f4e614b7fadbba64cba68f849rcp1",
    readonly sku = "71e7c4fc5ca24f0f8301da6d042bf18e",
    readonly productType: "game" | "addon" | "bundle" = "game",
    readonly name = "PLAYERUNKNOWN'S BATTLEGROUNDS"
  ) {}
}

class Game extends Product {
  constructor(
    readonly appId = "a4c5eb3f4e614b7fadbba64cba68f849rcp1",
    readonly sku = "71e7c4fc5ca24f0f8301da6d042bf18e",
    readonly productType = "game" as const,
    readonly name = "PLAYERUNKNOWN'S BATTLEGROUNDS",
    readonly somename = "PUBGBATTLEGROUNDS01",
    readonly description = ""
  ) {
    super(appId, sku, productType, name);
  }
}

class Bundle extends Product {
  constructor(
    readonly appId = "a4c5eb3f4e614b7fadbba64cba68f849rcp1",
    readonly sku = "71e7c4fc5ca24f0f8301da6d042bf18e",
    readonly productType = "bundle" as const,
    readonly name = "PLAYERUNKNOWN'S BATTLEGROUNDS",
    readonly bundleSkus = new Array<string>()
  ) {
    super(appId, sku, productType, name);
  }
}

class AddOn extends Product {
  constructor(
    readonly appId = "a4c5eb3f4e614b7fadbba64cba68f849rcp1",
    readonly sku = "71e7c4fc5ca24f0f8301da6d042bf18e",
    readonly productType = "addon" as const,
    readonly name = "PLAYERUNKNOWN'S BATTLEGROUNDS"
  ) {
    super(appId, sku, productType, name);
  }
}
