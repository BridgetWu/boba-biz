import type { CSSProperties } from "react";
import type { SiteConfig } from "./types";
import { menuIntroLine } from "./aiCopy";

const accentVars: Record<
  SiteConfig["accent"],
  { fg: string; soft: string; deep: string }
> = {
  matcha: { fg: "#2f4d38", soft: "#e8f0ea", deep: "#1e3224" },
  earl: { fg: "#2c3a4f", soft: "#e9edf5", deep: "#1c2433" },
  chai: { fg: "#6b3c2e", soft: "#f3e8e3", deep: "#3d241c" },
  jasmine: { fg: "#35524a", soft: "#e5f0ec", deep: "#243630" },
};

function categoryLabel(c: SiteConfig["menuItems"][0]["category"]): string {
  if (c === "signature") return "Milk teas & café drinks";
  if (c === "seasonal") return "Limited & seasonal";
  return "Fruit teas & coolers";
}

export function TeaShopPreview({ config }: { config: SiteConfig }) {
  const a = accentVars[config.accent];
  const shop = config.shopName.trim() || "Your boba shop";
  const city = config.city.trim();
  const tagline =
    config.tagline.trim() || "Bubble tea brewed fresh · toppings your way.";

  const grouped = (["signature", "house", "seasonal"] as const).map((key) => ({
    key,
    label: categoryLabel(key),
    items: config.menuItems.filter((m) => m.category === key),
  }));

  return (
    <div
      className="tsp"
      style={
        {
          "--tsp-fg": a.fg,
          "--tsp-soft": a.soft,
          "--tsp-deep": a.deep,
        } as CSSProperties
      }
    >
      <header className="tsp__nav">
        <div className="tsp__brand">
          <span className="tsp__logo" aria-hidden />
          <div>
            <div className="tsp__name">{shop}</div>
            {city ? <div className="tsp__city">{city}</div> : null}
          </div>
        </div>
        <nav className="tsp__links" aria-label="Primary">
          <a href="#home">Home</a>
          <a href="#menu">Menu</a>
          <a href="#delivery">Order</a>
        </nav>
      </header>

      <main>
        <section id="home" className={`tsp__hero tsp__hero--${config.heroStyle}`}>
          <div className="tsp__heroInner">
            <p className="tsp__kicker">Stir-fresh pearls · sweetness & ice your call</p>
            <h1 className="tsp__h1">{tagline}</h1>
            <p className="tsp__lead">
              Brew-to-order teas, chewy QQ, salted foams — order ahead for quicker pickup windows.
              {config.heroStyle === "feature"
                ? " Ask the bar for topping pairing cards on crowded nights."
                : ""}
            </p>
            <div className="tsp__ctaRow">
              <a className="tsp__btn tsp__btn--primary" href="#menu">
                View digital menu
              </a>
              <a className="tsp__btn tsp__btn--ghost" href="#delivery">
                Delivery & pickup
              </a>
            </div>
          </div>
          {config.heroStyle !== "minimal" ? (
            <aside className="tsp__heroAside" aria-label="Highlight">
              <div className="tsp__asideCard">
                <h2 className="tsp__h2">Today&apos;s feature</h2>
                <p className="tsp__asideText">
                  Rotation: brown-sugar latte flight or seasonal fruit puree cup — inquire at the counter.
                </p>
              </div>
            </aside>
          ) : null}
        </section>

        <section id="menu" className="tsp__section">
          <div className="tsp__sectionHead">
            <h2 className="tsp__sectionTitle">Digital menu</h2>
            <p className="tsp__sectionSub">{menuIntroLine(config.accent)}</p>
          </div>
          <div className="tsp__menuGrid">
            {grouped.map(
              (g) =>
                g.items.length > 0 && (
                  <div key={g.key} className="tsp__menuCol">
                    <h3 className="tsp__menuHeading">{g.label}</h3>
                    <ul className="tsp__menuList">
                      {g.items.map((item) => (
                        <li key={item.id} className="tsp__menuItem">
                          <div className="tsp__menuTop">
                            <span className="tsp__menuName">{item.name}</span>
                            <span className="tsp__menuPrice">{item.price}</span>
                          </div>
                          <p className="tsp__menuDesc">{item.description}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                ),
            )}
          </div>
        </section>

        <section id="delivery" className="tsp__section tsp__section--alt">
          <div className="tsp__sectionHead">
            <h2 className="tsp__sectionTitle">How to order</h2>
            <p className="tsp__sectionSub">
              Choose the paths that match how you serve guests today. Customers see live hours
              on this page.
            </p>
          </div>
          <div className="tsp__deliveryGrid">
            <div className="tsp__card">
              <h3 className="tsp__cardTitle">Café hours</h3>
              <p className="tsp__cardBody">{config.delivery.hours}</p>
            </div>
            <div className="tsp__card">
              <h3 className="tsp__cardTitle">Service options</h3>
              <ul className="tsp__opts">
                <li data-on={config.delivery.pickup}>Counter pickup</li>
                <li data-on={config.delivery.delivery}>Local delivery</li>
                <li data-on={config.delivery.shipping}>Nationwide shipping</li>
              </ul>
              {config.delivery.delivery && config.delivery.deliveryNote ? (
                <p className="tsp__cardNote">{config.delivery.deliveryNote}</p>
              ) : null}
            </div>
            <div className="tsp__card">
              <h3 className="tsp__cardTitle">Custom sweetness & toppings?</h3>
              <p className="tsp__cardBody">
                This preview is static — your live BobaBiz AI site can add loyalty,
                preorder slots, & delivery routing.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="tsp__foot">
        <div>
          © {new Date().getFullYear()} {shop}
          {city ? ` · ${city}` : ""}
        </div>
        <div className="tsp__footMeta">
          {config.billing === "free"
            ? "BobaBiz AI · free testing preview"
            : `BobaBiz AI · preview (${config.billing === "monthly" ? "monthly paid" : "yearly paid"} plan)`}
        </div>
      </footer>

      <style>{`
        .tsp {
          font-family: "Source Sans 3", system-ui, sans-serif;
          color: var(--tsp-deep);
          background: #fffdf8;
          min-height: 100%;
        }
        .tsp__nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid #e2ded3;
          position: sticky;
          top: 0;
          background: rgba(255, 253, 248, 0.94);
          backdrop-filter: blur(6px);
          z-index: 2;
        }
        .tsp__brand {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }
        .tsp__logo {
          width: 2.25rem;
          height: 2.25rem;
          border-radius: 999px;
          background: var(--tsp-soft);
          border: 1px solid #d8d3c6;
          display: inline-block;
        }
        .tsp__name {
          font-family: "Fraunces", Georgia, serif;
          font-weight: 600;
          font-size: 1.05rem;
        }
        .tsp__city {
          font-size: 0.85rem;
          color: #5c665e;
        }
        .tsp__links {
          display: flex;
          gap: 1rem;
          font-size: 0.9rem;
        }
        .tsp__links a {
          color: inherit;
          text-decoration: none;
          border-bottom: 1px solid transparent;
        }
        .tsp__links a:hover {
          border-color: var(--tsp-fg);
        }
        .tsp__hero {
          display: grid;
          gap: 1.5rem;
          padding: 2.25rem 1.25rem 2rem;
          border-bottom: 1px solid #e2ded3;
        }
        .tsp__hero--split {
          grid-template-columns: 1.1fr 0.9fr;
        }
        .tsp__hero--feature {
          background: linear-gradient(120deg, var(--tsp-soft), #fffdf8 55%);
        }
        @media (max-width: 720px) {
          .tsp__hero--split {
            grid-template-columns: 1fr;
          }
          .tsp__links {
            display: none;
          }
        }
        .tsp__heroInner {
          max-width: 38rem;
        }
        .tsp__kicker {
          text-transform: uppercase;
          letter-spacing: 0.12em;
          font-size: 0.72rem;
          color: var(--tsp-fg);
          margin: 0 0 0.5rem;
        }
        .tsp__h1 {
          font-family: "Fraunces", Georgia, serif;
          font-size: clamp(1.75rem, 4vw, 2.35rem);
          margin: 0 0 0.75rem;
          color: var(--tsp-deep);
        }
        .tsp__lead {
          margin: 0 0 1.25rem;
          color: #3b4540;
          font-size: 1.02rem;
        }
        .tsp__ctaRow {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        .tsp__btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.65rem 1rem;
          border-radius: 999px;
          border: 1px solid var(--tsp-fg);
          text-decoration: none;
          font-weight: 600;
          font-size: 0.92rem;
        }
        .tsp__btn--primary {
          background: var(--tsp-fg);
          color: #fffdf8;
        }
        .tsp__btn--ghost {
          background: transparent;
          color: var(--tsp-deep);
        }
        .tsp__heroAside {
          align-self: start;
        }
        .tsp__asideCard {
          border: 1px solid #e2ded3;
          border-radius: 0.75rem;
          padding: 1rem 1.1rem;
          background: #fff;
        }
        .tsp__h2 {
          font-family: "Fraunces", Georgia, serif;
          font-size: 1.15rem;
          margin: 0 0 0.35rem;
        }
        .tsp__asideText {
          margin: 0;
          color: #3b4540;
          font-size: 0.95rem;
        }
        .tsp__section {
          padding: 2rem 1.25rem;
        }
        .tsp__section--alt {
          background: #f7f4ec;
          border-top: 1px solid #e2ded3;
        }
        .tsp__sectionHead {
          max-width: 36rem;
          margin-bottom: 1.5rem;
        }
        .tsp__sectionTitle {
          font-family: "Fraunces", Georgia, serif;
          font-size: 1.5rem;
          margin: 0 0 0.35rem;
        }
        .tsp__sectionSub {
          margin: 0;
          color: #3b4540;
        }
        .tsp__menuGrid {
          display: grid;
          gap: 1.5rem;
        }
        @media (min-width: 720px) {
          .tsp__menuGrid {
            grid-template-columns: repeat(3, 1fr);
            gap: 1.25rem;
          }
        }
        .tsp__menuHeading {
          font-family: "Fraunces", Georgia, serif;
          font-size: 1.05rem;
          margin: 0 0 0.75rem;
          color: var(--tsp-fg);
        }
        .tsp__menuList {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .tsp__menuTop {
          display: flex;
          justify-content: space-between;
          gap: 0.75rem;
          font-weight: 600;
        }
        .tsp__menuName {
          font-family: "Fraunces", Georgia, serif;
        }
        .tsp__menuPrice {
          color: var(--tsp-fg);
          white-space: nowrap;
        }
        .tsp__menuDesc {
          margin: 0.25rem 0 0;
          color: #4a5550;
          font-size: 0.92rem;
        }
        .tsp__deliveryGrid {
          display: grid;
          gap: 1rem;
        }
        @media (min-width: 900px) {
          .tsp__deliveryGrid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        .tsp__card {
          background: #fff;
          border: 1px solid #e2ded3;
          border-radius: 0.75rem;
          padding: 1rem 1.1rem;
        }
        .tsp__cardTitle {
          font-family: "Fraunces", Georgia, serif;
          font-size: 1.05rem;
          margin: 0 0 0.5rem;
        }
        .tsp__cardBody {
          margin: 0;
          color: #3b4540;
          font-size: 0.95rem;
        }
        .tsp__opts {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          font-size: 0.95rem;
        }
        .tsp__opts li {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .tsp__opts li::before {
          content: "";
          width: 0.55rem;
          height: 0.55rem;
          border-radius: 999px;
          background: #c8c2b4;
        }
        .tsp__opts li[data-on="true"]::before {
          background: var(--tsp-fg);
        }
        .tsp__cardNote {
          margin: 0.75rem 0 0;
          font-size: 0.9rem;
          color: #3b4540;
        }
        .tsp__foot {
          padding: 1.25rem;
          border-top: 1px solid #e2ded3;
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          justify-content: space-between;
          font-size: 0.85rem;
          color: #5c665e;
        }
        .tsp__footMeta {
          opacity: 0.85;
        }
      `}</style>
    </div>
  );
}
