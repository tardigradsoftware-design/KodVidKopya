import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { Easing } from "remotion";

// Fonts load at module level so rendering waits for them. latin-ext keeps Turkish letters.
export const fonts = {
  sans: loadInter("normal", { weights: ["400", "500", "800"], subsets: ["latin", "latin-ext"] }).fontFamily,
  mono: loadMono("normal", { weights: ["400", "700"], subsets: ["latin", "latin-ext"] }).fontFamily,
};

export type Theme = { ground: string; ink: string; muted: string; accent: string };

export const defaultTheme: Theme = { ground: "#0b1020", ink: "#eef2ff", muted: "#94a3b8", accent: "#5eead4" };

// Arrivals decelerate, exits accelerate (see kodvid-skill/guides/motion-design.md).
export const easeIn = Easing.bezier(0.16, 1, 0.3, 1);
export const easeOut = Easing.bezier(0.7, 0, 0.84, 0);
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Type sizes at 1080 px height.
export const size = { hero: 168, headline: 104, body: 52, small: 40, code: 38 };
