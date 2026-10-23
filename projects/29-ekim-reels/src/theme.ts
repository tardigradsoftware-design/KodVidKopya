import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { Easing, interpolate } from "remotion";

// Fonts load at module level so the renderer waits for them. latin-ext keeps ç ğ ı ö ş ü İ.
export const anton = loadAnton("normal", { weights: ["400"], subsets: ["latin", "latin-ext"] }).fontFamily;
export const inter = loadInter("normal", { weights: ["400", "600", "800"], subsets: ["latin", "latin-ext"] }).fontFamily;

export const C = {
  ink: "#F7F3EC",
  white: "#FFFFFF",
  red: "#E30A17", // official Turkish flag red, RGB 227 10 23
  deepRed: "#7E070E",
  ember: "#FF9B4A",
  gold: "#F4C97A",
  ground: "#050507",
} as const;

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeIn = Easing.bezier(0.7, 0, 0.84, 0);
export const easeSoft = Easing.bezier(0.45, 0, 0.25, 1);

/** 0 -> 1 progress between two frames, decelerating. */
export const p = (frame: number, from: number, to: number, easing = easeOut): number =>
  interpolate(frame, [from, to], [0, 1], { ...clamp, easing });

/** Linear 0 -> 1 between two frames. */
export const pl = (frame: number, from: number, to: number): number => interpolate(frame, [from, to], [0, 1], clamp);

export const mix = (a: number, b: number, t: number): number => a + (b - a) * t;

/** Deterministic hash in [0,1) used for particles. */
export const hash = (seed: number): number => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
