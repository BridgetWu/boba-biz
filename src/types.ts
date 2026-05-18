/** Billing: free testing tier or paid hosted plans */
export type BillingPlan = "free" | "monthly" | "yearly";

export type Accent = "matcha" | "earl" | "chai" | "jasmine";

export type HeroStyle = "minimal" | "feature" | "split";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: string;
  category: "signature" | "house" | "seasonal";
}

export interface SiteConfig {
  shopName: string;
  tagline: string;
  city: string;
  accent: Accent;
  heroStyle: HeroStyle;
  menuItems: MenuItem[];
  delivery: {
    pickup: boolean;
    delivery: boolean;
    deliveryNote: string;
    shipping: boolean;
    hours: string;
  };
  billing: BillingPlan;
}
