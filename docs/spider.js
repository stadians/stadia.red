import * as records from "./records.js";
import { Game, AddOn, Bundle, Subscription, DataStore } from "./data.js";
export const spider = async () => {
  const storage = await DataStore.open();
  const spider = new Spider();
  console.debug("starting spider", spider);
  const data = await spider.load();
  console.debug("completed spider", spider, data);
  await storage.save();
  spider.download();
};
class Spider {
  constructor(skus = {}, spidered = {}) {
    this.skus = skus;
    this.spidered = spidered;
    let start;
    const started = new Promise((resolve) => (start = resolve));
    this.start = start;
    this.done = started
      .then(() => this.spider())
      .then(() => {
        Object.freeze(this.skus);
        for (const sku of Object.values(this.skus)) {
          Object.freeze(sku);
        }
      });
  }
  async load() {
    this.start();
    await this.done;
    return this.output();
  }
  async spider() {
    {
      await this.loadSkuDetails("59c8314ac82a456ba61d08988b15b550");
      await this.loadSkuDetails("b171fc78d4e1496d9536d585257a771e");
      await this.loadSkuDetails("4950959380034dcda0aecf98f675e11f");
      await this.loadSkuDetails("2e07db5d338d40cb9eac9deae4154f11");
      await this.loadSkuList(3);
      await this.loadSkuList(2001);
      await this.loadSkuList(45);
      await this.loadSkuList(6);
      throw "TODO: remove me";
    }
    await this.loadSkuList(3);
    while (Object.keys(this.skus).length > Object.keys(this.spidered).length) {
      for (const sku of Object.values(this.skus)) {
        if (this.spidered[sku.sku] !== true) {
          console.debug("spidering ", sku);
          await this.loadSkuDetails(sku.sku);
          this.spidered[sku.sku] = true;
        }
      }
    }
  }
  output() {
    return records.sorted(
      Object.fromEntries(
        Object.values(this.skus)
          .map((sku) => records.sorted(sku))
          .map((sku) => [sku.localKey, sku])
      )
    );
  }
  download() {
    const output = this.output();
    const json = JSON.stringify(output, null, 2);
    // XXX: this blob is leaked
    const href = URL.createObjectURL(
      new Blob([json], {
        type: "application/json",
      })
    );
    const el = Object.assign(document.createElement("a"), {
      download: "skus.json",
      href,
    });
    document.body.appendChild(el);
    el.click();
    document.body.removeChild(el);
  }
  async loadSkuList(number) {
    await this.fetchPreloadData(`store/list/${number}`);
  }
  async loadSkuDetails(sku) {
    await this.fetchPreloadData(`store/details/_/sku/${sku}`);
  }
  loadSkuData(data, pricing) {
    const typeId = data[6];
    console.log({ pricing });
    // pricing should include normal price, pro price,
    // current sale prices for each, the start and end dates of each sale
    let sku;
    if (typeId === 1) {
      sku = new Game(data[4], data[0], "game", data[1], data[5], data[9]);
    } else if (typeId === 2) {
      sku = new AddOn(data[4], data[0], "addon", data[1], data[5], data[9]);
    } else if (typeId === 3) {
      sku = new Bundle(
        data[4],
        data[0],
        "bundle",
        data[1],
        data[5],
        data[9],
        data[14][0].map((x) => x[0])
      );
    } else if (typeId === 5) {
      sku = new Subscription(
        data[4],
        data[0],
        "subscription",
        data[1],
        data[5],
        data[9],
        data[14][0].map((x) => x[0])
      );
    } else {
      throw new Error(
        `unexpected sku type id ${JSON.stringify(typeId, null, 4)}`
      );
    }
    return this.loadSku(sku);
  }
  loadSku(sku) {
    const existing = this.skus[sku.sku];
    if (existing) {
      const existingJson = JSON.stringify(existing);
      const newJson = JSON.stringify(sku);
      if (existingJson !== newJson) {
        console.warn(`skus had same ids but different properties.`);
        Object.assign(existing, sku);
      }
      return existing;
    } else {
      this.skus[sku.sku] = sku;
      return sku;
    }
  }
  async fetchPreloadData(path) {
    await new Promise((resolve) =>
      setTimeout(resolve, Math.random() * 1000 + 2000)
    );
    const response = await fetch("https://stadia.google.com/" + path, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36",
      },
    });
    const html = await response.text();
    const document = new DOMParser().parseFromString(html, "text/html");
    const scripts = Array.from(document.scripts);
    const contents = scripts.map((s) => s.textContent?.trim()).filter(Boolean);
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
          Object.entries(requests).map(([key, value]) => [key, value])
        )
      )[0];
    const dataCallbackPattern = /^ *AF_initDataCallback *\( *{ *key *: *'ds:([0-9]+?)' *,[^]*?data: *function *\( *\){ *return *([^]*)\s*}\s*}\s*\)\s*;?\s*$/;
    const dataServiceLoads = [];
    for (const matches of contents
      .map((s) => s.match(dataCallbackPattern))
      .filter(Boolean)) {
      dataServiceLoads[matches[1]] = JSON.parse(matches[2]);
    }
    6;
    const dataServiceRpcPrefixes = Object.values(dataServiceRequests).map(
      (x) => {
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
    const loaded = {};
    const loaders = {
      WwD3rb: (data) => {
        const skus = data[2].map((p) => this.loadSkuData(p[9]));
        return { skus };
      },
      FWhQV_24r: (data) => {
        const gameData = data[18]?.[0]?.[9];
        const gamePricingData = data[18]?.[0]?.[15]?.[0];
        const game = gameData && this.loadSkuData(gameData, gamePricingData);
        const addons = data[19]?.map((x) => this.loadSkuData(x[9]));
        const skuData = data[16];
        const skuPricingData = data[21]?.[0];
        const sku = skuData && this.loadSkuData(skuData, skuPricingData);
        return { sku, game, addons };
      },
      SYcsTd: (data) => {
        const subscriptionDatas = data[2]?.map((x) => x[9]) ?? [];
        const subscriptions = subscriptionDatas.map((s) => this.loadSkuData(s));
        if (subscriptions?.length) return { subscriptions };
        else return {};
      },
      ZAm7W: (data) => {
        const bundles = data[1].map((x) => this.loadSkuData(x[9]));
        return { bundles };
      },
    };
    for (const [i, data] of Object.entries(preload)) {
      for (const prefix of dataServiceRpcPrefixes[i]) {
        for (const suffix of ["", "_" + Object.keys(data).length + "r"]) {
          rpc[prefix + suffix] = data;
          const loader = loaders[prefix + suffix];
          if (loader) {
            Object.assign(loaded, loader(data));
          }
        }
      }
    }
    const data = Object.assign(
      Object.create({
        preload,
        rpc,
      }),
      loaded
    );
    console.debug(path, data);
    return data;
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3BpZGVyLmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlcyI6WyJzcGlkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxLQUFLLE9BQU8sTUFBTSxjQUFjLENBQUM7QUFDeEMsT0FBTyxFQUFPLElBQUksRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLFlBQVksRUFBRSxTQUFTLEVBQUUsTUFBTSxXQUFXLENBQUM7QUFFOUUsTUFBTSxDQUFDLE1BQU0sTUFBTSxHQUFHLEtBQUssSUFBSSxFQUFFO0lBQy9CLE1BQU0sT0FBTyxHQUFHLE1BQU0sU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ3ZDLE1BQU0sTUFBTSxHQUFHLElBQUksTUFBTSxFQUFFLENBQUM7SUFDNUIsT0FBTyxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUN6QyxNQUFNLElBQUksR0FBRyxNQUFNLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNqQyxPQUFPLENBQUMsS0FBSyxDQUFDLGtCQUFrQixFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNoRCxNQUFNLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNyQixNQUFNLENBQUMsUUFBUSxFQUFFLENBQUM7QUFDcEIsQ0FBQyxDQUFDO0FBSUYsTUFBTSxNQUFNO0lBR1YsWUFDbUIsT0FBZ0MsRUFBRSxFQUNsQyxXQUFxQyxFQUFFO1FBRHZDLFNBQUksR0FBSixJQUFJLENBQThCO1FBQ2xDLGFBQVEsR0FBUixRQUFRLENBQStCO1FBRXhELElBQUksS0FBaUIsQ0FBQztRQUN0QixNQUFNLE9BQU8sR0FBRyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUM1RCxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNuQixJQUFJLENBQUMsSUFBSSxHQUFHLE9BQU87YUFDaEIs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QUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNyRTthQUFNLElBQUksTUFBTSxLQUFLLENBQUMsRUFBRTtZQUN2QixHQUFHLEdBQUcsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUN2RTthQUFNLElBQUksTUFBTSxLQUFLLENBQUMsRUFBRTtZQUN2QixHQUFHLEdBQUcsSUFBSSxNQUFNLENBQ2QsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUNQLElBQUksQ0FBQyxDQUFDLENBQUMsRUFDUCxRQUFRLEVBQ1IsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUNQLElBQUksQ0FBQyxDQUFDLENBQUMsRUFDUCxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQ1AsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQU0sRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQ2xDLENBQUM7U0FDSDthQUFNLElBQUksTUFBTSxLQUFLLENBQUMsRUFBRTtZQUN2QixHQUFHLEdBQUcsSUFBSSxZQUFZLENBQ3BCLElBQUksQ0FBQyxDQUFDLENBQUMsRUFDUCxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQ1AsY0FBYyxFQUNkLElBQUksQ0FBQyxDQUFDLENBQUMsRUFDUCxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQ1AsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUNQLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFNLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUNsQyxDQUFDO1NBQ0g7YUFBTTtZQUNMLE1BQU0sSUFBSSxLQUFLLENBQ2IsMEJBQTBCLElB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LEtBQUssTUFBTSxNQUFNLElBQUksQ0FBQyxFQUFFLEVBQUUsR0FBRyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQyxFQUFFO29CQUMvRCxHQUFHLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQztvQkFDNUIsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsQ0FBQztvQkFDeEMsSUFBSSxNQUFNLEVBQUU7d0JBQ1YsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7cUJBQ3JDO2lCQUNGO2FBQ0Y7U0FDRjtRQUVELE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQ3hCLE1BQU0sQ0FBQyxNQUFNLENBQUM7WUFDWixPQUFPO1lBQ1AsR0FBRztTQUNKLENBQUMsRUFDRixNQUFNLENBQ1AsQ0FBQztRQUVGLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRTFCLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgcmVjb3JkcyBmcm9tIFwiLi9yZWNvcmRzLmpzXCI7XG5pbXBvcnQgeyBTa3UsIEdhbWUsIEFkZE9uLCBCdW5kbGUsIFN1YnNjcmlwdGlvbiwgRGF0YVN0b3JlIH0gZnJvbSBcIi4vZGF0YS5qc1wiO1xuXG5leHBvcnQgY29uc3Qgc3BpZGVyID0gYXN5bmMgKCkgPT4ge1xuICBjb25zdCBzdG9yYWdlID0gYXdhaXQgRGF0YVN0b3JlLm9wZW4oKTtcbiAgY29uc3Qgc3BpZGVyID0gbmV3IFNwaWRlcigpO1xuICBjb25zb2xlLmRlYnVnKFwic3RhcnRpbmcgc3BpZGVyXCIsIHNwaWRlcik7XG4gIGNvbnN0IGRhdGEgPSBhd2FpdCBzcGlkZXIubG9hZCgpO1xuICBjb25zb2xlLmRlYnVnKFwiY29tcGxldGVkIHNwaWRlclwiLCBzcGlkZXIsIGRhdGEpO1xuICBhd2FpdCBzdG9yYWdlLnNhdmUoKTtcbiAgc3BpZGVyLmRvd25sb2FkKCk7XG59O1xuXG50eXBlIFByb3RvRGF0YSA9IGFueSAmIEFycmF5PFByb3RvRGF0YSB8IG51bWJlciB8IHN0cmluZyB8IGJvb2xlYW4gfCBudWxsPjtcblxuY2xhc3MgU3BpZGVyIHtcbiAgcHJpdmF0ZSByZWFkb25seSBzdGFydDogKCkgPT4gdm9pZDtcbiAgcHJpdmF0ZSByZWFkb25seSBkb25lOiBQcm9taXNlPHVua25vd24+O1xuICBwdWJsaWMgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSByZWFkb25seSBza3VzOiBSZWNvcmQ8U2t1W1wic2t1XCJdLCBTa3U+ID0ge30sXG4gICAgcHJpdmF0ZSByZWFkb25seSBzcGlkZXJlZDogUmVjb3JkPFNrdVtcInNrdVwiXSwgdHJ1ZT4gPSB7fVxuICApIHtcbiAgICBsZXQgc3RhcnQ6ICgpID0+IHZvaWQ7XG4gICAgY29uc3Qgc3RhcnRlZCA9IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiAoc3RhcnQgPSByZXNvbHZlKSk7XG4gICAgdGhpcy5zdGFydCA9IHN0YXJ0O1xuICAgIHRoaXMuZG9uZSA9IHN0YXJ0ZWRcbiAgICAgIC50aGVuKCgpID0+IHRoaXMuc3BpZGVyKCkpXG4gICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgIE9iamVjdC5mcmVlemUodGhpcy5za3VzKTtcbiAgICAgICAgZm9yIChjb25zdCBza3Ugb2YgT2JqZWN0LnZhbHVlcyh0aGlzLnNrdXMpKSB7XG4gICAgICAgICAgT2JqZWN0LmZyZWV6ZShza3UpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBsb2FkKCkge1xuICAgIHRoaXMuc3RhcnQoKTtcbiAgICBhd2FpdCB0aGlzLmRvbmU7XG4gICAgcmV0dXJuIHRoaXMub3V0cHV0KCk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIHNwaWRlcigpIHtcbiAgICB7XG4gICAgICBhd2FpdCB0aGlzLmxvYWRTa3VEZXRhaWxzKFwiNTljODMxNGFjODJhNDU2YmE2MWQwODk4OGIxNWI1NTBcIik7XG4gICAgICBhd2FpdCB0aGlzLmxvYWRTa3VEZXRhaWxzKFwiYjE3MWZjNzhkNGUxNDk2ZDk1MzZkNTg1MjU3YTc3MWVcIik7XG4gICAgICBhd2FpdCB0aGlzLmxvYWRTa3VEZXRhaWxzKFwiNDk1MDk1OTM4MDAzNGRjZGEwYWVjZjk4ZjY3NWUxMWZcIik7XG4gICAgICBhd2FpdCB0aGlzLmxvYWRTa3VEZXRhaWxzKFwiMmUwN2RiNWQzMzhkNDBjYjllYWM5ZGVhZTQxNTRmMTFcIik7XG4gICAgICBhd2FpdCB0aGlzLmxvYWRTa3VMaXN0KDMpO1xuICAgICAgYXdhaXQgdGhpcy5sb2FkU2t1TGlzdCgyMDAxKTtcbiAgICAgIGF3YWl0IHRoaXMubG9hZFNrdUxpc3QoNDUpO1xuICAgICAgYXdhaXQgdGhpcy5sb2FkU2t1TGlzdCg2KTtcbiAgICAgIHRocm93IFwiVE9ETzogcmVtb3ZlIG1lXCI7XG4gICAgfVxuXG4gICAgYXdhaXQgdGhpcy5sb2FkU2t1TGlzdCgzKTtcblxuICAgIHdoaWxlIChPYmplY3Qua2V5cyh0aGlzLnNrdXMpLmxlbmd0aCA+IE9iamVjdC5rZXlzKHRoaXMuc3BpZGVyZWQpLmxlbmd0aCkge1xuICAgICAgZm9yIChjb25zdCBza3Ugb2YgT2JqZWN0LnZhbHVlcyh0aGlzLnNrdXMpKSB7XG4gICAgICAgIGlmICh0aGlzLnNwaWRlcmVkW3NrdS5za3VdICE9PSB0cnVlKSB7XG4gICAgICAgICAgY29uc29sZS5kZWJ1ZyhcInNwaWRlcmluZyBcIiwgc2t1KTtcbiAgICAgICAgICBhd2FpdCB0aGlzLmxvYWRTa3VEZXRhaWxzKHNrdS5za3UpO1xuICAgICAgICAgIHRoaXMuc3BpZGVyZWRbc2t1LnNrdV0gPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHVibGljIG91dHB1dCgpIHtcbiAgICByZXR1cm4gcmVjb3Jkcy5zb3J0ZWQoXG4gICAgICBPYmplY3QuZnJvbUVudHJpZXMoXG4gICAgICAgIE9iamVjdC52YWx1ZXModGhpcy5za3VzKVxuICAgICAgICAgIC5tYXAoKHNrdSkgPT4gcmVjb3Jkcy5zb3J0ZWQoc2t1KSlcbiAgICAgICAgICAubWFwKChza3UpID0+IFtza3UubG9jYWxLZXksIHNrdV0pXG4gICAgICApXG4gICAgKTtcbiAgfVxuXG4gIHB1YmxpYyBkb3dubG9hZCgpIHtcbiAgICBjb25zdCBvdXRwdXQgPSB0aGlzLm91dHB1dCgpO1xuICAgIGNvbnN0IGpzb24gPSBKU09OLnN0cmluZ2lmeShvdXRwdXQsIG51bGwsIDIpO1xuICAgIC8vIFhYWDogdGhpcyBibG9iIGlzIGxlYWtlZFxuICAgIGNvbnN0IGhyZWYgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKFxuICAgICAgbmV3IEJsb2IoW2pzb25dLCB7XG4gICAgICAgIHR5cGU6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgfSlcbiAgICApO1xuICAgIGNvbnN0IGVsID0gT2JqZWN0LmFzc2lnbihkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYVwiKSwge1xuICAgICAgZG93bmxvYWQ6IFwic2t1cy5qc29uXCIsXG4gICAgICBocmVmLFxuICAgIH0pO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZWwpO1xuICAgIGVsLmNsaWNrKCk7XG4gICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChlbCk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGxvYWRTa3VMaXN0KG51bWJlcjogbnVtYmVyKSB7XG4gICAgYXdhaXQgdGhpcy5mZXRjaFByZWxvYWREYXRhKGBzdG9yZS9saXN0LyR7bnVtYmVyfWApO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBsb2FkU2t1RGV0YWlscyhza3U6IHN0cmluZykge1xuICAgIGF3YWl0IHRoaXMuZmV0Y2hQcmVsb2FkRGF0YShgc3RvcmUvZGV0YWlscy9fL3NrdS8ke3NrdX1gKTtcbiAgfVxuXG4gIHByaXZhdGUgbG9hZFNrdURhdGEoZGF0YTogUHJvdG9EYXRhLCBwcmljaW5nOiBQcm90b0RhdGEpOiBTa3Uge1xuICAgIGNvbnN0IHR5cGVJZCA9IGRhdGFbNl07XG5cbiAgICBjb25zb2xlLmxvZyh7IHByaWNpbmcgfSk7XG4gICAgLy8gcHJpY2luZyBzaG91bGQgaW5jbHVkZSBub3JtYWwgcHJpY2UsIHBybyBwcmljZSxcbiAgICAvLyBjdXJyZW50IHNhbGUgcHJpY2VzIGZvciBlYWNoLCB0aGUgc3RhcnQgYW5kIGVuZCBkYXRlcyBvZiBlYWNoIHNhbGVcblxuICAgIGxldCBza3U7XG4gICAgaWYgKHR5cGVJZCA9PT0gMSkge1xuICAgICAgc2t1ID0gbmV3IEdhbWUoZGF0YVs0XSwgZGF0YVswXSwgXCJnYW1lXCIsIGRhdGFbMV0sIGRhdGFbNV0sIGRhdGFbOV0pO1xuICAgIH0gZWxzZSBpZiAodHlwZUlkID09PSAyKSB7XG4gICAgICBza3UgPSBuZXcgQWRkT24oZGF0YVs0XSwgZGF0YVswXSwgXCJhZGRvblwiLCBkYXRhWzFdLCBkYXRhWzVdLCBkYXRhWzldKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVJZCA9PT0gMykge1xuICAgICAgc2t1ID0gbmV3IEJ1bmRsZShcbiAgICAgICAgZGF0YVs0XSxcbiAgICAgICAgZGF0YVswXSxcbiAgICAgICAgXCJidW5kbGVcIixcbiAgICAgICAgZGF0YVsxXSxcbiAgICAgICAgZGF0YVs1XSxcbiAgICAgICAgZGF0YVs5XSxcbiAgICAgICAgZGF0YVsxNF1bMF0ubWFwKCh4OiBhbnkpID0+IHhbMF0pXG4gICAgICApO1xuICAgIH0gZWxzZSBpZiAodHlwZUlkID09PSA1KSB7XG4gICAgICBza3UgPSBuZXcgU3Vic2NyaXB0aW9uKFxuICAgICAgICBkYXRhWzRdLFxuICAgICAgICBkYXRhWzBdLFxuICAgICAgICBcInN1YnNjcmlwdGlvblwiLFxuICAgICAgICBkYXRhWzFdLFxuICAgICAgICBkYXRhWzVdLFxuICAgICAgICBkYXRhWzldLFxuICAgICAgICBkYXRhWzE0XVswXS5tYXAoKHg6IGFueSkgPT4geFswXSlcbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYHVuZXhwZWN0ZWQgc2t1IHR5cGUgaWQgJHtKU09OLnN0cmluZ2lmeSh0eXBlSWQsIG51bGwsIDQpfWBcbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMubG9hZFNrdShza3UpO1xuICB9XG5cbiAgcHJpdmF0ZSBsb2FkU2t1KHNrdTogU2t1KTogU2t1IHtcbiAgICBjb25zdCBleGlzdGluZyA9IHRoaXMuc2t1c1tza3Uuc2t1XTtcbiAgICBpZiAoZXhpc3RpbmcpIHtcbiAgICAgIGNvbnN0IGV4aXN0aW5nSnNvbiA9IEpTT04uc3RyaW5naWZ5KGV4aXN0aW5nKTtcbiAgICAgIGNvbnN0IG5ld0pzb24gPSBKU09OLnN0cmluZ2lmeShza3UpO1xuICAgICAgaWYgKGV4aXN0aW5nSnNvbiAhPT0gbmV3SnNvbikge1xuICAgICAgICBjb25zb2xlLndhcm4oYHNrdXMgaGFkIHNhbWUgaWRzIGJ1dCBkaWZmZXJlbnQgcHJvcGVydGllcy5gKTtcbiAgICAgICAgT2JqZWN0LmFzc2lnbihleGlzdGluZywgc2t1KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBleGlzdGluZztcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5za3VzW3NrdS5za3VdID0gc2t1O1xuICAgICAgcmV0dXJuIHNrdTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBmZXRjaFByZWxvYWREYXRhKHBhdGg6IHN0cmluZykge1xuICAgIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PlxuICAgICAgc2V0VGltZW91dChyZXNvbHZlLCBNYXRoLnJhbmRvbSgpICogMV8wMDAgKyAyXzAwMClcbiAgICApO1xuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goXCJodHRwczovL3N0YWRpYS5nb29nbGUuY29tL1wiICsgcGF0aCwge1xuICAgICAgaGVhZGVyczoge1xuICAgICAgICBcIlVzZXItQWdlbnRcIjpcbiAgICAgICAgICBcIk1vemlsbGEvNS4wIChXaW5kb3dzIE5UIDEwLjA7IFdpbjY0OyB4NjQpIEFwcGxlV2ViS2l0LzUzNy4zNiAoS0hUTUwsIGxpa2UgR2Vja28pIENocm9tZS84MS4wLjQwNDQuMTM4IFNhZmFyaS81MzcuMzZcIixcbiAgICAgIH0sXG4gICAgfSk7XG4gICAgY29uc3QgaHRtbCA9IGF3YWl0IHJlc3BvbnNlLnRleHQoKTtcbiAgICBjb25zdCBkb2N1bWVudCA9IG5ldyBET01QYXJzZXIoKS5wYXJzZUZyb21TdHJpbmcoaHRtbCwgXCJ0ZXh0L2h0bWxcIik7XG4gICAgY29uc3Qgc2NyaXB0cyA9IEFycmF5LmZyb20oZG9jdW1lbnQuc2NyaXB0cyk7XG4gICAgY29uc3QgY29udGVudHMgPSBzY3JpcHRzLm1hcCgocykgPT4gcy50ZXh0Q29udGVudD8udHJpbSgpKS5maWx0ZXIoQm9vbGVhbik7XG5cbiAgICBjb25zdCBkYXRhU2VydmljZVJlcXVlc3RzUGF0dGVybiA9IC9edmFyICpBRl9pbml0RGF0YUtleXNbXl0qP3ZhciAqQUZfZGF0YVNlcnZpY2VSZXF1ZXN0cyAqPSAqKHtbXl0qfSk7ICo/dmFyIC87XG5cbiAgICBjb25zdCBkYXRhU2VydmljZVJlcXVlc3RzID0gY29udGVudHNcbiAgICAgIC5tYXAoKHMpID0+IHMubWF0Y2goZGF0YVNlcnZpY2VSZXF1ZXN0c1BhdHRlcm4pKVxuICAgICAgLmZpbHRlcihCb29sZWFuKVxuICAgICAgLm1hcCgobWF0Y2hlcykgPT5cbiAgICAgICAgSlNPTi5wYXJzZShcbiAgICAgICAgICBtYXRjaGVzWzFdXG4gICAgICAgICAgICAucmVwbGFjZSgve2lkOi9nLCAne1wiaWRcIjonKVxuICAgICAgICAgICAgLnJlcGxhY2UoLyxyZXF1ZXN0Oi9nLCAnLFwicmVxdWVzdFwiOicpXG4gICAgICAgICAgICAucmVwbGFjZSgvJy9nLCAnXCInKVxuICAgICAgICApXG4gICAgICApXG4gICAgICAubWFwKChyZXF1ZXN0cykgPT5cbiAgICAgICAgT2JqZWN0LmZyb21FbnRyaWVzKFxuICAgICAgICAgIE9iamVjdC5lbnRyaWVzKHJlcXVlc3RzKS5tYXAoKFtrZXksIHZhbHVlXTogYW55KSA9PiBba2V5LCB2YWx1ZV0pXG4gICAgICAgIClcbiAgICAgIClbMF07XG5cbiAgICBjb25zdCBkYXRhQ2FsbGJhY2tQYXR0ZXJuID0gL14gKkFGX2luaXREYXRhQ2FsbGJhY2sgKlxcKCAqeyAqa2V5ICo6IConZHM6KFswLTldKz8pJyAqLFteXSo/ZGF0YTogKmZ1bmN0aW9uICpcXCggKlxcKXsgKnJldHVybiAqKFteXSopXFxzKn1cXHMqfVxccypcXClcXHMqOz9cXHMqJC87XG4gICAgY29uc3QgZGF0YVNlcnZpY2VMb2FkczogQXJyYXk8YW55PiA9IFtdO1xuICAgIGZvciAoY29uc3QgbWF0Y2hlcyBvZiBjb250ZW50c1xuICAgICAgLm1hcCgocykgPT4gcy5tYXRjaChkYXRhQ2FsbGJhY2tQYXR0ZXJuKSlcbiAgICAgIC5maWx0ZXIoQm9vbGVhbikpIHtcbiAgICAgIGRhdGFTZXJ2aWNlTG9hZHNbbWF0Y2hlc1sxXV0gPSBKU09OLnBhcnNlKG1hdGNoZXNbMl0pO1xuICAgIH1cbiAgICA2O1xuICAgIGNvbnN0IGRhdGFTZXJ2aWNlUnBjUHJlZml4ZXMgPSBPYmplY3QudmFsdWVzKGRhdGFTZXJ2aWNlUmVxdWVzdHMpLm1hcChcbiAgICAgICh4OiBhbnkpID0+IHtcbiAgICAgICAgY29uc3QgcGllY2VzID0gW3guaWQsIC4uLngucmVxdWVzdF07XG4gICAgICAgIGNvbnN0IGFsaWFzZXMgPSBbXTtcbiAgICAgICAgYWxpYXNlcy5wdXNoKFxuICAgICAgICAgIGAke3BpZWNlc1swXX1fJHtwaWVjZXMuZmlsdGVyKCh4OiBhbnkpID0+IHggIT0gbnVsbCkubGVuZ3RoIC0gMX1zJHtcbiAgICAgICAgICAgIHBpZWNlcy5maWx0ZXIoQm9vbGVhbikubGVuZ3RoIC0gMVxuICAgICAgICAgIH10JHtwaWVjZXMubGVuZ3RoIC0gMX1hYFxuICAgICAgICApO1xuICAgICAgICB3aGlsZSAocGllY2VzLmxlbmd0aCkge1xuICAgICAgICAgIGFsaWFzZXMucHVzaChwaWVjZXMuam9pbihcIl9cIikpO1xuICAgICAgICAgIHBpZWNlcy5wb3AoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYWxpYXNlcztcbiAgICAgIH1cbiAgICApO1xuXG4gICAgY29uc3QgcHJlbG9hZCA9IE9iamVjdC52YWx1ZXMoZGF0YVNlcnZpY2VMb2Fkcyk7XG4gICAgY29uc3QgcnBjOiBhbnkgPSB7fTtcbiAgICBjb25zdCBsb2FkZWQgPSB7fTtcblxuICAgIGNvbnN0IGxvYWRlcnM6IGFueSA9IHtcbiAgICAgIFd3RDNyYjogKGRhdGE6IFByb3RvRGF0YSkgPT4ge1xuICAgICAgICBjb25zdCBza3VzID0gZGF0YVsyXS5tYXAoKHA6IGFueSkgPT4gdGhpcy5sb2FkU2t1RGF0YShwWzldKSk7XG4gICAgICAgIHJldHVybiB7IHNrdXMgfTtcbiAgICAgIH0sXG5cbiAgICAgIEZXaFFWXzI0cjogKGRhdGE6IFByb3RvRGF0YSkgPT4ge1xuICAgICAgICBjb25zdCBnYW1lRGF0YSA9IGRhdGFbMThdPy5bMF0/Lls5XTtcbiAgICAgICAgY29uc3QgZ2FtZVByaWNpbmdEYXRhID0gZGF0YVsxOF0/LlswXT8uWzE1XT8uWzBdO1xuICAgICAgICBjb25zdCBnYW1lID0gZ2FtZURhdGEgJiYgdGhpcy5sb2FkU2t1RGF0YShnYW1lRGF0YSwgZ2FtZVByaWNpbmdEYXRhKTtcblxuICAgICAgICBjb25zdCBhZGRvbnMgPSAoZGF0YVsxOV0gYXMgYW55KT8ubWFwKCh4OiBhbnkpID0+XG4gICAgICAgICAgdGhpcy5sb2FkU2t1RGF0YSh4WzldKVxuICAgICAgICApO1xuXG4gICAgICAgIGNvbnN0IHNrdURhdGEgPSBkYXRhWzE2XTtcbiAgICAgICAgY29uc3Qgc2t1UHJpY2luZ0RhdGEgPSBkYXRhWzIxXT8uWzBdO1xuICAgICAgICBjb25zdCBza3UgPSBza3VEYXRhICYmIHRoaXMubG9hZFNrdURhdGEoc2t1RGF0YSwgc2t1UHJpY2luZ0RhdGEpO1xuXG4gICAgICAgIHJldHVybiB7IHNrdSwgZ2FtZSwgYWRkb25zIH07XG4gICAgICB9LFxuXG4gICAgICBTWWNzVGQ6IChkYXRhOiBQcm90b0RhdGEpID0+IHtcbiAgICAgICAgY29uc3Qgc3Vic2NyaXB0aW9uRGF0YXMgPSBkYXRhWzJdPy5tYXAoKHg6IGFueSkgPT4geFs5XSkgPz8gW107XG4gICAgICAgIGNvbnN0IHN1YnNjcmlwdGlvbnMgPSBzdWJzY3JpcHRpb25EYXRhcy5tYXAoKHMpID0+IHRoaXMubG9hZFNrdURhdGEocykpO1xuICAgICAgICBpZiAoc3Vic2NyaXB0aW9ucz8ubGVuZ3RoKSByZXR1cm4geyBzdWJzY3JpcHRpb25zIH07XG4gICAgICAgIGVsc2UgcmV0dXJuIHt9O1xuICAgICAgfSxcblxuICAgICAgWkFtN1c6IChkYXRhOiBQcm90b0RhdGEpID0+IHtcbiAgICAgICAgY29uc3QgYnVuZGxlcyA9IGRhdGFbMV0ubWFwKCh4OiBhbnkpID0+IHRoaXMubG9hZFNrdURhdGEoeFs5XSkpO1xuICAgICAgICByZXR1cm4geyBidW5kbGVzIH07XG4gICAgICB9LFxuICAgIH07XG5cbiAgICBmb3IgKGNvbnN0IFtpLCBkYXRhXSBvZiBPYmplY3QuZW50cmllcyhwcmVsb2FkKSkge1xuICAgICAgZm9yIChjb25zdCBwcmVmaXggb2YgZGF0YVNlcnZpY2VScGNQcmVmaXhlc1tpXSkge1xuICAgICAgICBmb3IgKGNvbnN0IHN1ZmZpeCBvZiBbXCJcIiwgXCJfXCIgKyBPYmplY3Qua2V5cyhkYXRhKS5sZW5ndGggKyBcInJcIl0pIHtcbiAgICAgICAgICBycGNbcHJlZml4ICsgc3VmZml4XSA9IGRhdGE7XG4gICAgICAgICAgY29uc3QgbG9hZGVyID0gbG9hZGVyc1twcmVmaXggKyBzdWZmaXhdO1xuICAgICAgICAgIGlmIChsb2FkZXIpIHtcbiAgICAgICAgICAgIE9iamVjdC5hc3NpZ24obG9hZGVkLCBsb2FkZXIoZGF0YSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGRhdGEgPSBPYmplY3QuYXNzaWduKFxuICAgICAgT2JqZWN0LmNyZWF0ZSh7XG4gICAgICAgIHByZWxvYWQsXG4gICAgICAgIHJwYyxcbiAgICAgIH0pLFxuICAgICAgbG9hZGVkXG4gICAgKTtcblxuICAgIGNvbnNvbGUuZGVidWcocGF0aCwgZGF0YSk7XG5cbiAgICByZXR1cm4gZGF0YTtcbiAgfVxufVxuIl19
