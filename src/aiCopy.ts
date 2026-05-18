import type { SiteConfig } from "./types";

const TAGLINES = [
  "Your neighborhood bubble tea, brewed bold.",
  "Pearls, foam, and flavor — your way.",
  "Fresh-steeped boba, made to order.",
  "America's bubble tea — your block, your cup.",
  "Tiger stripes, cheese foam, classic pearls.",
];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function suggestTagline(shopName: string): string {
  const i = hashString(shopName || "boba") % TAGLINES.length;
  return TAGLINES[i] ?? TAGLINES[0]!;
}

export function buildWelcomeHeadline(config: Pick<SiteConfig, "shopName" | "city">): string {
  const name = config.shopName.trim() || "Your boba shop";
  const city = config.city.trim();
  if (city) {
    return `${name} — ${city}'s go-to pearl tea stop`;
  }
  return `${name} — boba steeped to order`;
}

export function menuIntroLine(): string {
  return "Milk teas, fruit teas, QQ toppings — sweetness & ice your call.";
}
