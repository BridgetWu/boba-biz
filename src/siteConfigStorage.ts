import type { SiteConfig } from "./types";

export const SITE_CONFIG_STORAGE_KEY = "bobabiz-generated-site";

export function saveSiteConfig(config: SiteConfig): void {
  localStorage.setItem(SITE_CONFIG_STORAGE_KEY, JSON.stringify(config));
}

export function loadSiteConfig(): SiteConfig | null {
  try {
    const raw = localStorage.getItem(SITE_CONFIG_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SiteConfig;
  } catch {
    return null;
  }
}

/** Shareable link: config embedded in the URL hash (works without localStorage). */
export function encodeConfigToHash(config: SiteConfig): string {
  const json = JSON.stringify(config);
  return `#cfg=${encodeURIComponent(btoa(unescape(encodeURIComponent(json))))}`;
}

export function decodeConfigFromHash(hash: string): SiteConfig | null {
  const match = /^#cfg=(.+)$/.exec(hash);
  if (!match?.[1]) return null;
  try {
    const json = decodeURIComponent(escape(atob(decodeURIComponent(match[1]))));
    return JSON.parse(json) as SiteConfig;
  } catch {
    return null;
  }
}

export function getPublishedSiteUrl(config: SiteConfig): string {
  const base = new URL(import.meta.env.BASE_URL, window.location.origin);
  const sitePath = base.pathname.endsWith("/")
    ? `${base.pathname}site.html`
    : `${base.pathname}/site.html`;
  const url = new URL(sitePath, window.location.origin);
  url.hash = encodeConfigToHash(config).slice(1);
  return url.toString();
}
