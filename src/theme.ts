import type { CSSProperties } from "react";
import type { AccentColor, ThemeMode } from "./types";

export interface AccentOption {
  id: AccentColor;
  label: string;
  hex: string;
}

export const ACCENT_OPTIONS: AccentOption[] = [
  { id: "red", label: "Red", hex: "#e31837" },
  { id: "blue", label: "Blue", hex: "#1d4ed8" },
  { id: "gold", label: "Gold", hex: "#c9a227" },
  { id: "green", label: "Green", hex: "#15803d" },
  { id: "purple", label: "Purple", hex: "#7c3aed" },
  { id: "orange", label: "Orange", hex: "#ea580c" },
  { id: "pink", label: "Pink", hex: "#db2777" },
  { id: "teal", label: "Teal", hex: "#0d9488" },
];

export function getAccentHex(accent: AccentColor): string {
  return ACCENT_OPTIONS.find((a) => a.id === accent)?.hex ?? "#e31837";
}

function accentSoft(hex: string, alpha = 0.14): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Generated boba shop — Kung Fu Tea–style: dark nav, body by mode, accent on brand + hero */
export function siteThemeStyle(
  mode: ThemeMode,
  accentColor: AccentColor,
): CSSProperties {
  const accent = getAccentHex(accentColor);
  const soft = accentSoft(accent);

  if (mode === "light") {
    return {
      "--tsp-accent": accent,
      "--tsp-accent-soft": soft,
      "--tsp-page-bg": "#ffffff",
      "--tsp-surface": "#ffffff",
      "--tsp-section-alt": "#f5f5f5",
      "--tsp-deep": "#141414",
      "--tsp-muted": "#525252",
      "--tsp-border": "#e5e5e5",
      "--tsp-nav-bg": "#141414",
      "--tsp-nav-ink": "#f5f5f5",
      "--tsp-nav-muted": "#a3a3a3",
      "--tsp-promo-bg": "#0a0a0a",
      "--tsp-promo-ink": "#fafafa",
      "--tsp-btn-on-primary": "#ffffff",
      "--tsp-hero-bg": "#ffffff",
    } as CSSProperties;
  }

  return {
    "--tsp-accent": accent,
    "--tsp-accent-soft": soft,
    "--tsp-page-bg": "#121212",
    "--tsp-surface": "#1c1c1c",
    "--tsp-section-alt": "#181818",
    "--tsp-deep": "#f5f5f5",
    "--tsp-muted": "#a3a3a3",
    "--tsp-border": "#333333",
    "--tsp-nav-bg": "#0a0a0a",
    "--tsp-nav-ink": "#f5f5f5",
    "--tsp-nav-muted": "#737373",
    "--tsp-promo-bg": "#000000",
    "--tsp-promo-ink": "#fafafa",
    "--tsp-btn-on-primary": "#ffffff",
    "--tsp-hero-bg": "#121212",
  } as CSSProperties;
}

/** Builder chrome follows the same light/dark + accent choices */
export function builderThemeStyle(
  mode: ThemeMode,
  accentColor: AccentColor,
): CSSProperties {
  const accent = getAccentHex(accentColor);
  const soft = accentSoft(accent);

  if (mode === "light") {
    return {
      "--bg": "#ececec",
      "--surface": "#fafafa",
      "--sidebar": "#e2e2e2",
      "--sidebar-ink": "#141414",
      "--sidebar-muted": "#525252",
      "--ink": "#141414",
      "--muted": "#525252",
      "--line": "#d4d4d4",
      "--accent": accent,
      "--accent-soft": soft,
      "--input-bg": "#ffffff",
    } as CSSProperties;
  }

  return {
    "--bg": "#1a1a1a",
    "--surface": "#242424",
    "--sidebar": "#141414",
    "--sidebar-ink": "#f5f5f5",
    "--sidebar-muted": "#a3a3a3",
    "--ink": "#f5f5f5",
    "--muted": "#a3a3a3",
    "--line": "#404040",
    "--accent": accent,
    "--accent-soft": soft,
    "--input-bg": "#2a2a2a",
  } as CSSProperties;
}
