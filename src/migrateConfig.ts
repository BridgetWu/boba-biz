import { MENU_PRESETS } from "./menuPresets";
import { ACCENT_OPTIONS } from "./theme";
import type { AccentColor, SiteConfig, ThemeMode } from "./types";

const VALID_ACCENTS = new Set<AccentColor>(
  ACCENT_OPTIONS.map((a) => a.id),
);

const LEGACY_ACCENT_MAP: Record<
  string,
  { themeMode: ThemeMode; accentColor: AccentColor }
> = {
  matcha: { themeMode: "light", accentColor: "green" },
  taro: { themeMode: "light", accentColor: "purple" },
  brownSugar: { themeMode: "light", accentColor: "gold" },
  lychee: { themeMode: "light", accentColor: "pink" },
  earl: { themeMode: "light", accentColor: "blue" },
  chai: { themeMode: "light", accentColor: "orange" },
  jasmine: { themeMode: "light", accentColor: "teal" },
  midnight: { themeMode: "dark", accentColor: "gold" },
};

export function defaultSiteConfig(): SiteConfig {
  return {
    shopName: "",
    tagline: "",
    city: "",
    themeMode: "light",
    accentColor: "red",
    heroStyle: "split",
    menuItems: MENU_PRESETS.classic.map((item) => ({ ...item })),
    delivery: {
      pickup: true,
      delivery: true,
      deliveryNote:
        "Within 3 miles · waives with orders over $25 before 4pm.",
      shipping: false,
      hours: "Wed–Sun · 8:00a – 6:00p",
    },
    billing: "free",
  };
}

function isAccentColor(value: unknown): value is AccentColor {
  return typeof value === "string" && VALID_ACCENTS.has(value as AccentColor);
}

export function migrateSiteConfig(raw: unknown): SiteConfig {
  const base = defaultSiteConfig();
  if (!raw || typeof raw !== "object") return base;

  const r = raw as Record<string, unknown>;

  let themeMode: ThemeMode = r.themeMode === "dark" ? "dark" : "light";
  let accentColor: AccentColor = isAccentColor(r.accentColor)
    ? r.accentColor
    : "red";

  if (typeof r.accent === "string" && LEGACY_ACCENT_MAP[r.accent]) {
    themeMode = LEGACY_ACCENT_MAP[r.accent].themeMode;
    accentColor = LEGACY_ACCENT_MAP[r.accent].accentColor;
  }

  const delivery =
    r.delivery && typeof r.delivery === "object"
      ? { ...base.delivery, ...(r.delivery as object) }
      : base.delivery;

  return {
    shopName: typeof r.shopName === "string" ? r.shopName : base.shopName,
    tagline: typeof r.tagline === "string" ? r.tagline : base.tagline,
    city: typeof r.city === "string" ? r.city : base.city,
    themeMode,
    accentColor,
    heroStyle:
      r.heroStyle === "minimal" ||
      r.heroStyle === "feature" ||
      r.heroStyle === "split"
        ? r.heroStyle
        : base.heroStyle,
    menuItems: Array.isArray(r.menuItems) ? (r.menuItems as SiteConfig["menuItems"]) : base.menuItems,
    delivery,
    billing:
      r.billing === "free" ||
      r.billing === "monthly" ||
      r.billing === "yearly"
        ? r.billing
        : base.billing,
  };
}
