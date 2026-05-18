import type { Accent, SiteConfig } from "./types";

const taglinesByAccent: Record<Accent, string[]> = {
  matcha: [
    "Matcha lattes, whisked marble swirls.",
    "Ceremony-grade foam over cane-sweet milk.",
    "Uji matcha & QQ layers, same-day steeped.",
  ],
  earl: [
    "Earl-grey milk tea, silk cap optional.",
    "London fog boba cart next door vibes.",
    "Bergamot cream cap on cold pearl brews.",
  ],
  chai: [
    "Tiger stripes & spiced Thai pulls.",
    "Bold karak-style pulls, chewy pearls.",
    "Brown-sugar slabs, slow-glazed pearls.",
  ],
  jasmine: [
    "Clear floral teas · fruit burst cups.",
    "Jasmine QQ cups, lightness first.",
    "Botanical fruit teas shaken to order.",
  ],
};

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function suggestTagline(shopName: string, accent: Accent): string {
  const list = taglinesByAccent[accent];
  const i = hashString(shopName || "boba") % list.length;
  return list[i] ?? list[0]!;
}

export function buildWelcomeHeadline(config: Pick<SiteConfig, "shopName" | "city">): string {
  const name = config.shopName.trim() || "Your boba shop";
  const city = config.city.trim();
  if (city) {
    return `${name} — ${city}'s go-to pearl tea stop`;
  }
  return `${name} — boba steeped to order`;
}

export function menuIntroLine(accent: Accent): string {
  const map: Record<Accent, string> = {
    matcha:
      "Matcha caps, latte marbling, toppings from boba to cheese foam.",
    earl:
      "Foam-topped blacks & oolongs, sweetness dialed shot-by-shot.",
    chai:
      "Tiger sugar pulls, spiced milk reds, Okinawa swirl menu.",
    jasmine:
      "Fruit puree sparklers & jasmine coolers with chewy QQ mixes.",
  };
  return map[accent];
}
