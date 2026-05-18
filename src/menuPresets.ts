import type { MenuItem } from "./types";

/** Curated presets for Asian boba / bubble-tea shops — milk teas, fruit teas, QQ toppings, bites */
export const MENU_PRESETS: Record<string, MenuItem[]> = {
  classic: [
    {
      id: "c1",
      name: "Classic Pearl Black Milk Tea",
      description:
        "Ceylon & Assam brew, cane sugar ice level · boba simmered honey syrup.",
      price: "$5.75",
      category: "signature",
    },
    {
      id: "c2",
      name: "Okinawa Roast Milk Tea",
      description:
        "Roasted Okinawa brown sugar swirl, oat or whole milk, hot or cold.",
      price: "$6.25",
      category: "signature",
    },
    {
      id: "c3",
      name: "Winter Melon Lemonade QQ",
      description:
        "Light winter-melon tea, calamansi, basil seed & coconut jelly.",
      price: "$5.95",
      category: "house",
    },
    {
      id: "c4",
      name: "Taiwanese Popcorn Chicken",
      description:
        "Shatter-crisp marinade, plum powder shaker, pickled radish bites.",
      price: "$8.95",
      category: "seasonal",
    },
  ],
  wellness: [
    {
      id: "w1",
      name: "Yakult Burst Green Tea",
      description:
        "Two Yakult swirl, Jasmine green tea, 25% sweetness default · add aloe.",
      price: "$6.50",
      category: "signature",
    },
    {
      id: "w2",
      name: "Grape Jasmine Fruit Tea",
      description:
        "Fresh grape puree, Jasmine tips, chewy nata de coco, less ice option.",
      price: "$6.75",
      category: "signature",
    },
    {
      id: "w3",
      name: "Lychee Rose Sparkling",
      description:
        "Zero-caffeine iced spritz, dried rose petals, crystal boba topper.",
      price: "$6.25",
      category: "house",
    },
    {
      id: "w4",
      name: "Matcha Strawberry Cloud",
      description:
        "Ceremonial matcha cap, icy strawberry layer, salted cream foam.",
      price: "$7.25",
      category: "seasonal",
    },
  ],
  spice: [
    {
      id: "s1",
      name: "Tiger Brown Sugar Boba Milk",
      description:
        "Slow-cooked brown sugar streaks · farm milk, tiger stripes, thick boba.",
      price: "$6.95",
      category: "signature",
    },
    {
      id: "s2",
      name: "Thai Red Milk Tea",
      description:
        "Strong Cha Tra Mue brew, spiced condensed-milk swirl, shaken over ice.",
      price: "$6.25",
      category: "signature",
    },
    {
      id: "s3",
      name: "Taro Cream Coconut Slush",
      description:
        "Fresh taro mash, coco cream cap, QQ sweet potato pearls add-on.",
      price: "$6.75",
      category: "house",
    },
    {
      id: "s4",
      name: "Takoyaki Snack Trio",
      description:
        "Bonito curls, bulldog sauce, Kewpie mayo · share plate for pickup.",
      price: "$10.95",
      category: "seasonal",
    },
  ],
};

export type MenuPresetId = keyof typeof MENU_PRESETS;
