import type { LanguageCode, SiteConfig } from "./types";

const TAGLINES = [
  "Your neighborhood bubble tea, brewed bold.",
  "Pearls, foam, and flavor - your way.",
  "Fresh-steeped boba, made to order.",
  "America's bubble tea - your block, your cup.",
  "Tiger stripes, cheese foam, classic pearls.",
];

const HERO_VARIANTS = [
  "Freshly steeped tea, handcrafted boba, and flavor built your way.",
  "Your next favorite tea break starts here, brewed to order.",
  "Bold tea, chewy pearls, and crave-worthy sips on every visit.",
  "Hand-shaken classics and modern signatures made to match your mood.",
  "From first sip to last pearl, every cup is crafted with care.",
];

const PROMO_VARIANTS = [
  "Buy one drink, get 50% off a second every weekday 2-5pm.",
  "Free topping upgrade when you order two or more drinks online.",
  "Seasonal drink drop this week only - while supplies last.",
  "Student special: 10% off with valid ID all day Tuesday.",
  "Order ahead online and skip the line at pickup.",
];

const ITEM_DESCRIPTION_VARIANTS = [
  "House favorite with layered flavor, balanced sweetness, and a smooth finish.",
  "Brewed fresh and shaken to order for a bright, satisfying sip.",
  "A crowd-pleasing pick with signature texture and bold aroma.",
  "Crafted in small batches with premium ingredients and custom options.",
  "Comforting, refreshing, and easy to personalize just the way you like it.",
];

const variantCursor: Record<string, number> = {};

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function pickVariant(bucket: string, options: string[]): string {
  const last = variantCursor[bucket] ?? -1;
  let next = Math.floor(Math.random() * options.length);
  if (options.length > 1 && next === last) {
    next = (next + 1) % options.length;
  }
  variantCursor[bucket] = next;
  return options[next] ?? options[0]!;
}

export function suggestTagline(shopName: string): string {
  const i = hashString(shopName || "boba") % TAGLINES.length;
  return TAGLINES[i] ?? TAGLINES[0]!;
}

export function buildWelcomeHeadline(
  config: Pick<SiteConfig, "shopName" | "city">,
  language: LanguageCode = "en",
): string {
  const name = config.shopName.trim() || "Your boba shop";
  const city = config.city.trim();
  if (language === "zh-Hant") {
    if (city) return `${name} - ${city}的人氣手搖站`;
    return `${name} - 現泡手搖，客製剛剛好`;
  }
  if (city) {
    return `${name} - ${city}'s go-to pearl tea stop`;
  }
  return `${name} - boba steeped to order`;
}

export function menuIntroLine(): string {
  return "Milk teas, fruit teas, QQ toppings - sweetness and ice your call.";
}

export function generateHeroHeadline(): string {
  return pickVariant("hero", HERO_VARIANTS);
}

export function generatePromoMessage(): string {
  return pickVariant("promo", PROMO_VARIANTS);
}

export function generateItemDescription(itemId: string): string {
  return pickVariant(`item-${itemId}`, ITEM_DESCRIPTION_VARIANTS);
}
