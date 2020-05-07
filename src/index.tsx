import { render } from "./index/render.js";
import { spider } from "./index/spider.js";

document.title = "stadia.observer";
document.head.appendChild(
  Object.assign(document.createElement("link"), {
    rel: "icon",
    href: "/illufinch-violetsky-edited@2x.png",
  })
);

const Home = ({ games }: any) => (
  <main
    style={`
    font-size: 14px;
    max-width: 800px;
    margin: 8px 16px;

    background-image: url(/illufinch-violetsky-edited@2x.png);
    background-position: top 16px right 16px;
    background-repeat: no-repeat;
    background-size: 64px;
  `}
  >
    <h1>stadia.observer</h1>

    {window.chrome?.runtime?.id && (
      <button onclick={spider}>🕷️spider stadia</button>
    )}

    <section>
      {games.map((game) => (
        <Game {...game} />
      ))}
    </section>
  </main>
);

const Game = ({ name, description, type, sku, app, addons, bundles }) => (
  <section>
    <h2>
      {name} [
      {type === "game" ? (
        <span>
          <a href={`http://stadia.google.com/player/${app}`}>launch game</a> or
        </span>
      ) : (
        type
      )}{" "}
      <a href={`https://stadia.google.com/store/details/${app}/sku/${sku}`}>
        view in store
      </a>
      ]
    </h2>
    <p>{description}</p>
    {addons.map((addon) => (
      <section>
        <h3>
          <span style="font-weight: normal;">➕</span> {addon.name} [
          <a
            href={`https://stadia.google.com/store/details/${app}/sku/${addon.sku}`}
          >
            view in store
          </a>
          ]
        </h3>
        <p>{description}</p>
      </section>
    ))}
    {bundles.map((bundle) => (
      <section>
        <h3>
          <span style="font-weight: normal;">📦</span> {bundle.name} [
          <a
            href={`https://stadia.google.com/store/details/${app}/sku/${bundle.sku}`}
          >
            view in store
          </a>
          ]
        </h3>
        <p>{description}</p>
      </section>
    ))}
  </section>
);

(async () => {
  const skus = Object.values(await (await fetch("/skus.json")).json());
  const skusById = Object.fromEntries(skus.map((sku) => [sku.sku, sku]));
  const subscriptions = skus.filter((sku) => sku.type === "subscription");

  const games = skus
    .filter((sku) => sku.type === "game")
    .map((game) =>
      Object.assign(game, {
        skus: skus.filter((sku) => sku.app === game.app),
        addons: skus.filter(
          (sku) => sku.app === game.app && sku.type === "addon"
        ),
        bundles: skus.filter(
          (sku) => sku.app === game.app && sku.type === "bundle"
        ),
      })
    );

  document.body.appendChild(<Home games={games} />);
})();
