import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadPoppins } from "@remotion/google-fonts/Poppins";
import { Easing, useVideoConfig } from "remotion";

// Fonts load at module level so rendering waits for them. latin-ext keeps Turkish letters.
const ext = ["latin", "latin-ext"] as ("latin" | "latin-ext")[];
export const fonts = {
  inter: loadInter("normal", { weights: ["400", "500", "800"], subsets: ext }).fontFamily,
  mono: loadMono("normal", { weights: ["400", "700"], subsets: ext }).fontFamily,
  playfair: loadPlayfair("normal", { weights: ["600", "800"], subsets: ext }).fontFamily,
  poppins: loadPoppins("normal", { weights: ["400", "600", "800"], subsets: ext }).fontFamily,
};

export type Style = "soft" | "bold" | "fresh" | "dark";

export type Theme = {
  ground: string; // background base
  ground2: string; // second background color for the gradient
  ink: string; // main text
  muted: string; // secondary text
  accent: string; // one accent color
  accent2: string; // highlight on dark text, badges
  display: string; // font for headlines
  sans: string; // font for body text
  displayWeight: number;
  particles: "bokeh" | "sparkle" | "none";
  captionBg: string;
  captionInk: string;
};

// Colors are 6-digit hex.
export const styles: Record<Style, Theme> = {
  // Warm cream and rose, elegant serif headlines. Lifestyle, beauty, self-care, quotes.
  soft: {
    ground: "#fbf3ec", ground2: "#f6dfd8", ink: "#3a2a2e", muted: "#8c7271", accent: "#d4718a", accent2: "#f3c7cf",
    display: fonts.playfair, sans: fonts.poppins, displayWeight: 800, particles: "bokeh", captionBg: "#3a2a2e", captionInk: "#fff7f2",
  },
  // Deep plum with magenta and gold. Energetic tips, trends, motivation.
  bold: {
    ground: "#1d0b2e", ground2: "#4a1253", ink: "#ffffff", muted: "#d9c2e6", accent: "#ff4fa3", accent2: "#ffd166",
    display: fonts.poppins, sans: fonts.poppins, displayWeight: 800, particles: "sparkle", captionBg: "#ffffff", captionInk: "#1d0b2e",
  },
  // Mint and teal on white. Health, food, home, wellness.
  fresh: {
    ground: "#f3fbf8", ground2: "#d6f2e9", ink: "#12332c", muted: "#5b7d75", accent: "#1fa98f", accent2: "#ffb4a2",
    display: fonts.poppins, sans: fonts.poppins, displayWeight: 800, particles: "bokeh", captionBg: "#12332c", captionInk: "#f3fbf8",
  },
  // Dark navy and teal. Tech, explainers.
  dark: {
    ground: "#0b1020", ground2: "#13233a", ink: "#eef2ff", muted: "#94a3b8", accent: "#5eead4", accent2: "#fbbf24",
    display: fonts.inter, sans: fonts.inter, displayWeight: 800, particles: "sparkle", captionBg: "#eef2ff", captionInk: "#0b1020",
  },
};

// Arrivals decelerate, exits accelerate (see kodvid-skill/guides/motion-design.md).
export const easeIn = Easing.bezier(0.16, 1, 0.3, 1);
export const easeOut = Easing.bezier(0.7, 0, 0.84, 0);
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Sizes at a 1080 px short side. Multiply by unit() for other sizes.
export const size = { hero: 150, headline: 96, body: 50, small: 40, code: 36, caption: 46 };

// Layout: safe areas differ for vertical (Reels, TikTok, Shorts) and horizontal video.
export const useLayout = () => {
  const { width, height } = useVideoConfig();
  const vertical = height > width;
  const unit = Math.min(width, height) / 1080;
  return {
    vertical,
    unit,
    width,
    height,
    // Reels: the top ~12 % and bottom ~22 % are covered by the app UI.
    padTop: vertical ? Math.round(height * 0.13) : Math.round(100 * unit),
    padBottom: vertical ? Math.round(height * 0.34) : Math.round(170 * unit),
    padX: vertical ? Math.round(80 * unit) : Math.round(140 * unit),
    captionY: vertical ? Math.round(height * 0.68) : Math.round(height * 0.86),
    maxText: vertical ? width - Math.round(160 * unit) : Math.round(1500 * unit),
  };
};
