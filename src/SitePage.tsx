import { TeaShopPreview } from "./TeaShopPreview";
import { decodeConfigFromHash, loadSiteConfig } from "./siteConfigStorage";
import type { SiteConfig } from "./types";

function resolveConfig(): SiteConfig | null {
  const fromHash = decodeConfigFromHash(window.location.hash);
  if (fromHash) return fromHash;
  return loadSiteConfig();
}

export default function SitePage() {
  const config = resolveConfig();

  if (!config) {
    return (
      <div className="site-missing">
        <h1>No site to show yet</h1>
        <p>
          Generate your boba shop website in the BobaBiz AI builder, then choose{" "}
          <strong>Open your website</strong> or <strong>Copy site link</strong>.
        </p>
        <a className="site-missing__link" href="/">
          Back to builder
        </a>
        <style>{`
          .site-missing {
            font-family: "Source Sans 3", system-ui, sans-serif;
            max-width: 28rem;
            margin: 4rem auto;
            padding: 0 1.25rem;
            color: #1c2420;
          }
          .site-missing h1 {
            font-family: "Fraunces", Georgia, serif;
            font-size: 1.5rem;
          }
          .site-missing__link {
            color: #3d5c48;
            font-weight: 600;
          }
        `}</style>
      </div>
    );
  }

  return <TeaShopPreview config={config} />;
}
