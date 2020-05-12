import * as models from "./data/models.js";

export const Home: JSX.FC<{ skus: Array<models.Sku> }> = ({ skus }) => (
  <main>
    <h1>stadia.observer</h1>

    <hr />

    <SkuList>
      {skus.map(sku => (
        <Sku {...sku} />
      ))}
    </SkuList>
  </main>
);

Home.style = {
  display: "block",
  fontSize: "14px",
  maxWidth: "800px",
  margin: "8px 16px",
  backgroundImage: "url(/illufinch-violetsky-edited@2x.png)",
  backgroundPosition: "top 16px right 16px",
  backgroundRepeat: "no-repeat",
  backgroundSize: "64px",
};

const SkuList: JSX.FC<{ children: JSX.Renderable }> = ({ children }) => (
  <section>{children}</section>
);

SkuList.style = {
  display: "grid",
  gridAutoFlow: "dense row",
  gridTemplateColumns: "auto 200px 100px",
  gridTemplateAreas: `
    "Title        Links        Prices       "
    "Description  Description  Description  "
  `,
};

const Sku: JSX.FC<models.Sku> = sku => (
  <section>
    <Title name={sku.name} />
    <Description body={sku.description} />
    <Links sku={sku} />
    <Prices sku={sku} />
  </section>
);

const Title: JSX.FC<{ name: string }> = ({ name }) => <h2>{name}</h2>;

Title.style = {
  display: "block",
  gridColumn: "Title",
  gridAutoRows: "auto",
};

const Description: JSX.FC<{ body: string }> = ({ body }) => <p>{body}</p>;

Description.style = {
  display: "block",
  gridColumn: "Description",
  gridAutoRows: "auto",
};

const Links: JSX.FC<{ sku: models.Sku }> = ({ sku: { type, app, sku } }) => (
  <div>
    {type === "game" ? (
      <span>
        <a href={`http://stadia.google.com/player/${app}`}>launch game</a> or{" "}
      </span>
    ) : null}
    <a href={`https://stadia.google.com/store/details/${app}/sku/${sku}`}>
      view in store
    </a>
  </div>
);

Links.style = {
  display: "block",
  gridColumn: "Links",
  gridAutoRows: "auto",
};

const Prices: JSX.FC<{ sku: models.Sku }> = ({ sku: { prices } }) => (
  <div>{models.Prices.prototype.render.call(prices)}</div>
);

Prices.style = {
  display: "block",
  gridColumn: "Prices",
  gridAutoRows: "auto",
};
