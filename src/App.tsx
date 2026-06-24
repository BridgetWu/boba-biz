import { useCallback, useState } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./App.css";
import { AuthProvider, useAuth } from "../components/AuthProvider";
import { Header } from "../components/Header";
import { defaultSiteConfig } from "./migrateConfig";
import { ACCENT_OPTIONS, builderThemeStyle } from "./theme";
import { TeaShopPreview } from "./TeaShopPreview";
import type { SiteConfig, MenuItem, SocialPlatform, ToppingOption } from "./types";

const UI_TEXT = {
  en: {
    shopName: "Shop name",
    city: "City or neighborhood",
    light: "Light",
    dark: "Dark",
    aiGenerate: "AI Generate",
    suggestHeadline: "Suggest headline",
    suggestHint: "Pulls from your shop name - refine freely.",
    pickupDelivery: "Pickup & delivery",
    plans: "Plans",
    siteTheme: "Site theme",
    accentColor: "Accent color",
    heroHeadline: "Hero headline",
    deliveryDetails: "Delivery details",
    publishedHours: "Published hours",
    sweetnessPresets: "Sweetness presets",
    toppingsPresets: "Toppings presets",
    enableDelivery: "Enable Online Delivery",
    counterPickup: "Counter & scheduled pickup",
    localDelivery: "Local delivery",
    shipping: "Bottle kits & pantry merch shipping",
    livePreview: "Live preview",
    selected: "Selected:",
    ownerEmail: "Owner email",
    socialLinks: "Social links",
    socialHint: "Optional. Add the profiles you want shown on the live site.",
    facebook: "Facebook",
    instagram: "Instagram",
    tiktok: "TikTok",
    x: "X / Twitter",
    youtube: "YouTube",
    shopIcon: "Shop icon",
    clearIcon: "Use default icon",
    addSweetness: "Add custom sweetness option",
    addTopping: "Add custom topping option",
    customizeMode: "Shop Owner Mode",
    customerMode: "Customer Mode",
  },
  "zh-Hant": {
    shopName: "店名",
    city: "城市或商圈",
    light: "明亮",
    dark: "暗色",
    aiGenerate: "AI 生成",
    suggestHeadline: "建議主標",
    suggestHint: "根據你的店名生成，可以自由再調整。",
    pickupDelivery: "自取與外送",
    plans: "方案",
    siteTheme: "網站主題",
    accentColor: "強調色",
    heroHeadline: "首頁主標",
    deliveryDetails: "外送資訊",
    publishedHours: "對外營業時間",
    sweetnessPresets: "甜度預設",
    toppingsPresets: "配料預設",
    enableDelivery: "啟用線上外送",
    counterPickup: "櫃台與預約自取",
    localDelivery: "在地外送",
    shipping: "瓶裝組合與周邊寄送",
    livePreview: "即時預覽",
    selected: "已選擇：",
    ownerEmail: "店主電子郵件",
    socialLinks: "社群連結",
    socialHint: "選填項目，會在實際網站上顯示。",
    facebook: "Facebook",
    instagram: "Instagram",
    tiktok: "TikTok",
    x: "X / Twitter",
    youtube: "YouTube",
    shopIcon: "店家圖示",
    clearIcon: "使用預設圓形圖示",
    addSweetness: "新增自訂甜度",
    addTopping: "新增自訂配料",
    customizeMode: "店主模式",
    customerMode: "顧客模式",
  },
} as const;

export default function App() {
  const [config, setConfig] = useState<SiteConfig>(defaultSiteConfig);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || import.meta.env.REACT_APP_GOOGLE_CLIENT_ID || "";

  const ui = UI_TEXT[config.language];
  const socialFields: { key: SocialPlatform; label: string; placeholder: string }[] = [
    { key: "facebook", label: ui.facebook, placeholder: "https://facebook.com/yourpage" },
    { key: "instagram", label: ui.instagram, placeholder: "https://instagram.com/yourhandle" },
    { key: "tiktok", label: ui.tiktok, placeholder: "https://tiktok.com/@yourhandle" },
    { key: "x", label: ui.x, placeholder: "https://x.com/yourhandle" },
    { key: "youtube", label: ui.youtube, placeholder: "https://youtube.com/@yourchannel" },
  ];

  const toggleLanguage = useCallback(() => {
    setConfig((c) => ({ ...c, language: c.language === "en" ? "zh-Hant" : "en" }));
  }, []);

  const handleMenuItemUpdate = useCallback((updatedItem: MenuItem) => {
    setConfig((c) => ({
      ...c,
      menuItems: c.menuItems.map((item) => (item.id === updatedItem.id ? updatedItem : item)),
    }));
  }, []);

  const handleAddTopping = useCallback(() => {
    const name = window.prompt("New topping name");
    if (!name?.trim()) return;
    const trimmed = name.trim();
    setConfig((c) => ({
      ...c,
      toppingOptions: [
        ...c.toppingOptions,
        {
          id: `${trimmed.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
          name: trimmed,
          price: 0,
        },
      ],
    }));
  }, []);

  const handleRemoveTopping = useCallback((id: string) => {
    setConfig((c) => ({
      ...c,
      toppingOptions: c.toppingOptions.filter((t) => t.id !== id),
    }));
  }, []);

  const handleToppingPriceChange = useCallback((id: string, price: number) => {
    setConfig((c) => ({
      ...c,
      toppingOptions: c.toppingOptions.map((t) => (t.id === id ? { ...t, price } : t)),
    }));
  }, []);

  const handleShopIconUpload = useCallback((file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      if (!result) return;
      setConfig((c) => ({ ...c, shopIcon: result }));
    };
    reader.readAsDataURL(file);
  }, []);

  const ownerPanel = (
    <aside className="app__wizard app__wizard--floating" aria-label="Owner customization panel">
      <div className="app__wizardInner">
        <div className="app__panelTitleRow">
          <h2 className="app__stepTitle">{ui.customizeMode}</h2>
          <p className="app__stepHint">Edits apply to the live page instantly.</p>
        </div>

        <div className="app__field">
          <label className="app__label" htmlFor="shop">{ui.shopName}</label>
          <input id="shop" className="app__input" value={config.shopName} onChange={(e) => setConfig({ ...config, shopName: e.target.value })} />
        </div>

        <div className="app__field">
          <label className="app__label" htmlFor="city">{ui.city}</label>
          <input id="city" className="app__input" value={config.city} onChange={(e) => setConfig({ ...config, city: e.target.value })} />
        </div>

        <div className="app__field">
          <label className="app__label" htmlFor="ownerEmail">{ui.ownerEmail}</label>
          <input id="ownerEmail" type="email" className="app__input" value={config.ownerEmail} onChange={(e) => setConfig({ ...config, ownerEmail: e.target.value })} />
        </div>

        <div className="app__field">
          <span className="app__label">{ui.socialLinks}</span>
          <div className="app__socialGrid">
            {socialFields.map((field) => (
              <div key={field.key} className="app__socialField">
                <label className="app__socialLabel" htmlFor={`social-${field.key}`}>{field.label}</label>
                <input
                  id={`social-${field.key}`}
                  className="app__input"
                  type="url"
                  inputMode="url"
                  placeholder={field.placeholder}
                  value={config.socialLinks?.[field.key] ?? ""}
                  onChange={(e) => setConfig((c) => ({ ...c, socialLinks: { ...(c.socialLinks ?? {}), [field.key]: e.target.value.trim() || undefined } }))}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="app__field">
          <span className="app__label">{ui.shopIcon}</span>
          <input type="file" className="app__input" accept="image/*" onChange={(e) => handleShopIconUpload(e.target.files?.[0] ?? null)} />
          {config.shopIcon ? <button type="button" className="app__btn app__btn--ghost" onClick={() => setConfig((c) => ({ ...c, shopIcon: undefined }))}>{ui.clearIcon}</button> : null}
        </div>

        <div className="app__field">
          <span className="app__label">{ui.siteTheme}</span>
          <div className="app__themeToggle" role="group" aria-label="Light or dark site">
            <button type="button" className={config.themeMode === "light" ? "app__themeBtn app__themeBtn--on" : "app__themeBtn"} onClick={() => setConfig({ ...config, themeMode: "light" })}>{ui.light}</button>
            <button type="button" className={config.themeMode === "dark" ? "app__themeBtn app__themeBtn--on" : "app__themeBtn"} onClick={() => setConfig({ ...config, themeMode: "dark" })}>{ui.dark}</button>
          </div>
        </div>

        <div className="app__field">
          <span className="app__label">{ui.accentColor}</span>
          <div className="app__accentGrid" role="listbox" aria-label="Accent color">
            {ACCENT_OPTIONS.map((accent) => (
              <button
                key={accent.id}
                type="button"
                role="option"
                aria-selected={config.accentColor === accent.id}
                aria-label={accent.label}
                title={accent.label}
                className={config.accentColor === accent.id ? "app__accentSwatch app__accentSwatch--on" : "app__accentSwatch"}
                style={{ backgroundColor: accent.hex }}
                onClick={() => setConfig({ ...config, accentColor: accent.id })}
              />
            ))}
          </div>
          <p className="app__accentLabel">{ui.selected} {ACCENT_OPTIONS.find((a) => a.id === config.accentColor)?.label ?? "Red"}</p>
        </div>

        <div className="app__field">
          <div className="app__panelTitleRow">
            <span className="app__label">{ui.toppingsPresets}</span>
            <button type="button" className="app__btn" onClick={handleAddTopping}>{ui.addTopping}</button>
          </div>
          <div className="app__stack">
            {config.toppingOptions.map((topping: ToppingOption) => (
              <div key={topping.id} className="app__toppingRow">
                <div>
                  <div className="app__toppingName">{topping.name}</div>
                </div>
                <div className="app__toppingActions">
                  <label className="app__miniInput">
                    <span>Price</span>
                    <input
                      type="number"
                      min="0"
                      step="0.05"
                      value={topping.price}
                      onChange={(e) => handleToppingPriceChange(topping.id, Number.isFinite(e.target.valueAsNumber) ? e.target.valueAsNumber : 0)}
                    />
                  </label>
                  <button type="button" className="app__btn app__btn--ghost" onClick={() => handleRemoveTopping(topping.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </aside>
  );

  function AppShell() {
    const { user } = useAuth();
    const isOwnerMode = Boolean(user);

    return (
      <div className="app" style={builderThemeStyle(config.themeMode, config.accentColor)}>
        <Header />
        <div className="app__siteShell">
          {isOwnerMode ? ownerPanel : null}

          <TeaShopPreview
            config={config}
            onMenuItemUpdate={isOwnerMode ? handleMenuItemUpdate : undefined}
            onLanguageToggle={toggleLanguage}
            onMarketingCopyUpdate={
              isOwnerMode
                ? (field, value) =>
                    setConfig((c) => ({
                      ...c,
                      marketingCopy: {
                        ...c.marketingCopy,
                        [c.language]: { ...c.marketingCopy[c.language], [field]: value },
                      },
                    }))
                : undefined
            }
          />
        </div>
      </div>
    );
  }

  const appContent = (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );

  return googleClientId ? <GoogleOAuthProvider clientId={googleClientId}>{appContent}</GoogleOAuthProvider> : appContent;
}
