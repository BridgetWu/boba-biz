import type { MenuItem } from "./types";

export const MENU_PRESETS: Record<string, MenuItem[]> = {
  classic: [
    {
      id: "c1",
      name: "Classic Pearl Black Milk Tea",
      description:
        "Ceylon and Assam brew, cane sugar ice level, boba simmered in honey syrup.",
      price: "$5.75",
      category: "signature",
      sectionId: "signature",
      itemType: "drink",
      customization: {
        sweetnessLevels: ["0%", "25%", "50%", "75%", "100%"],
      },
    },
    {
      id: "c2",
      name: "Okinawa Roast Milk Tea",
      description:
        "Roasted Okinawa brown sugar swirl, oat or whole milk, hot or cold.",
      price: "$6.25",
      category: "signature",
      sectionId: "signature",
      itemType: "drink",
      customization: {
        sweetnessLevels: ["0%", "25%", "50%", "75%", "100%"],
      },
    },
    {
      id: "c3",
      name: "Winter Melon Lemonade QQ",
      description:
        "Light winter melon tea, calamansi, basil seed, and coconut jelly.",
      price: "$5.95",
      category: "house",
      sectionId: "house",
      itemType: "drink",
      customization: {
        sweetnessLevels: ["0%", "25%", "50%", "75%", "100%"],
      },
    },
    {
      id: "c4",
      name: "Taiwanese Popcorn Chicken",
      description:
        "Shatter-crisp marinade, plum powder shaker, pickled radish bites.",
      price: "$8.95",
      category: "seasonal",
      sectionId: "seasonal",
      itemType: "food",
    },
  ],
};

export type MenuPresetId = keyof typeof MENU_PRESETS;
