import { icons } from "lucide-react";
import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, easeIn, size, Theme, useLayout } from "./theme";

// True for light colors (relative luminance above 0.5). Expects 6-digit hex.
export const isLight = (hex: string): boolean => {
  const n = parseInt(hex.replace("#", "").slice(0, 6), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 > 0.5;
};

// A built world instead of a flat swatch: a two-color gradient, two soft lights that travel across the film, and particles.
export const Background: React.FC<{ readonly theme: Theme }> = ({ theme }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = interpolate(frame, [0, durationInFrames], [0, 1], clamp);
  const light = isLight(theme.ground);
  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.ground,
        backgroundImage: [
          `radial-gradient(55% 45% at ${20 + 35 * t}% ${25 + 10 * t}%, ${theme.accent}${light ? "33" : "44"}, transparent 70%)`,
          `radial-gradient(50% 40% at ${85 - 30 * t}% ${78 - 8 * t}%, ${theme.accent2}${light ? "40" : "30"}, transparent 70%)`,
          `linear-gradient(160deg, ${theme.ground} 0%, ${theme.ground2} 100%)`,
        ].join(", "),
      }}
    >
      <Particles kind={theme.particles} color={light ? theme.accent : theme.accent2} />
      <AbsoluteFill style={{ background: `radial-gradient(120% 90% at 50% 45%, transparent 60%, ${light ? "rgba(80,40,40,0.12)" : "rgba(0,0,0,0.5)"} 100%)` }} />
    </AbsoluteFill>
  );
};

// Deterministic floating particles. "bokeh": large soft circles. "sparkle": small twinkling stars.
export const Particles: React.FC<{ readonly kind: "bokeh" | "sparkle" | "none"; readonly color: string; readonly count?: number; readonly seed?: string }> = ({
  kind, color, count, seed = "p",
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  if (kind === "none") return null;
  const n = count ?? (kind === "bokeh" ? 14 : 40);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {new Array(n).fill(0).map((_, i) => {
        const r = (k: string) => random(`${seed}-${kind}-${i}-${k}`);
        const s = kind === "bokeh" ? 60 + r("s") * 180 : 4 + r("s") * 8;
        const speed = kind === "bokeh" ? 0.25 + r("v") * 0.5 : 0.4 + r("v") * 0.8;
        const x = (r("x") * width + Math.sin((frame / 60) * speed + r("p") * 6) * 40) % width;
        const y = (r("y") * height - frame * speed * (kind === "bokeh" ? 0.6 : 1.2) + height * 2) % (height + s) - s / 2;
        const tw = kind === "sparkle" ? 0.35 + 0.65 * Math.abs(Math.sin(frame / (8 + r("t") * 12) + r("o") * 6)) : 1;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: s,
              height: s,
              borderRadius: "50%",
              backgroundColor: color,
              opacity: (kind === "bokeh" ? 0.1 + r("a") * 0.16 : 0.5 + r("a") * 0.5) * tw,
              filter: kind === "bokeh" ? `blur(${6 + r("b") * 14}px)` : undefined,
              boxShadow: kind === "sparkle" ? `0 0 ${s * 2}px ${color}` : undefined,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// A burst of particles from the center at `at` frames: confetti-like stars for emphasis.
export const Burst: React.FC<{ readonly color: string; readonly color2: string; readonly at?: number; readonly seed?: string }> = ({ color, color2, at = 0, seed = "b" }) => {
  const frame = useCurrentFrame() - at;
  if (frame < 0 || frame > 45) return null;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
      {new Array(28).fill(0).map((_, i) => {
        const a = (i / 28) * Math.PI * 2 + random(`${seed}${i}a`) * 0.4;
        const dist = interpolate(frame, [0, 40], [0, 380 + random(`${seed}${i}d`) * 260], { ...clamp, easing: easeIn });
        const s = 8 + random(`${seed}${i}s`) * 12;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              width: s,
              height: s,
              borderRadius: i % 3 === 0 ? 2 : "50%",
              backgroundColor: i % 2 ? color : color2,
              translate: `${Math.cos(a) * dist}px ${Math.sin(a) * dist + frame * frame * 0.08}px`,
              rotate: `${frame * 9 * (i % 2 ? 1 : -1)}deg`,
              opacity: interpolate(frame, [25, 45], [1, 0], clamp),
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// An expanding ring, for a hit or a reveal.
export const ShockRing: React.FC<{ readonly color: string; readonly at?: number }> = ({ color, at = 0 }) => {
  const frame = useCurrentFrame() - at;
  if (frame < 0 || frame > 30) return null;
  const s = interpolate(frame, [0, 30], [0.2, 2.6], { ...clamp, easing: easeIn });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
      <div style={{ width: 500, height: 500, borderRadius: "50%", border: `6px solid ${color}`, scale: s, opacity: interpolate(frame, [0, 30], [0.9, 0], clamp) }} />
    </AbsoluteFill>
  );
};

// A diagonal gleam that passes over the frame once, starting at `at`.
export const LightSweep: React.FC<{ readonly at?: number; readonly duration?: number }> = ({ at = 6, duration = 22 }) => {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [at, at + duration], [-60, 160], clamp);
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        mixBlendMode: "screen",
        background: `linear-gradient(105deg, transparent ${x - 18}%, rgba(255,255,255,0.35) ${x}%, transparent ${x + 18}%)`,
      }}
    />
  );
};

// Words that land one after another, each decelerating from slightly oversize. delay and gap are in frames.
export const Words: React.FC<{
  readonly text: string;
  readonly delay?: number;
  readonly gap?: number;
  readonly style?: React.CSSProperties;
  readonly highlight?: string;
  readonly highlightColor?: string;
}> = ({ text, delay = 0, gap = 4, style, highlight, highlightColor }) => {
  const frame = useCurrentFrame();
  const marked = new Set((highlight ?? "").toLocaleLowerCase("tr").split(/\s+/).filter(Boolean));
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: "0.26em", ...style }}>
      {words.map((w, i) => {
        const start = delay + i * gap;
        const isMarked = marked.has(w.toLocaleLowerCase("tr").replace(/[.,!?;:"“”]/g, ""));
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              color: isMarked ? highlightColor : undefined,
              opacity: interpolate(frame, [start, start + 6], [0, 1], clamp),
              translate: interpolate(frame, [start, start + 12], ["0px 0.45em", "0px 0em"], { ...clamp, easing: easeIn }),
              scale: interpolate(frame, [start, start + 12], [1.2, 1], { ...clamp, easing: easeIn }),
              filter: `blur(${interpolate(frame, [start, start + 8], [8, 0], clamp)}px)`,
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

// Fades and rises a block in after `delay` frames.
export const Rise: React.FC<{ readonly delay?: number; readonly children: React.ReactNode; readonly style?: React.CSSProperties }> = ({ delay = 0, children, style }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        opacity: interpolate(frame, [delay, delay + 10], [0, 1], clamp),
        translate: interpolate(frame, [delay, delay + 16], ["0px 30px", "0px 0px"], { ...clamp, easing: easeIn }),
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Pops a block in from oversize with a tiny overshoot.
export const Pop: React.FC<{ readonly delay?: number; readonly children: React.ReactNode; readonly style?: React.CSSProperties }> = ({ delay = 0, children, style }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        opacity: interpolate(frame, [delay, delay + 5], [0, 1], clamp),
        scale: interpolate(frame, [delay, delay + 8, delay + 14], [1.6, 0.94, 1], clamp),
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// A thin accent line that draws itself from the center.
export const Rule: React.FC<{ readonly color: string; readonly delay?: number; readonly width?: number }> = ({ color, delay = 0, width = 200 }) => {
  const frame = useCurrentFrame();
  return <div style={{ width, height: 5, borderRadius: 3, backgroundColor: color, scale: `${interpolate(frame, [delay, delay + 14], [0, 1], { ...clamp, easing: easeIn })} 1` }} />;
};

// A Lucide icon by name, for example "Sparkles", "Heart", "Coffee", "Moon", "Sun", "Leaf". See https://lucide.dev/icons.
export const Icon: React.FC<{ readonly name: string; readonly size?: number; readonly color: string; readonly strokeWidth?: number }> = ({
  name, size: s = 120, color, strokeWidth = 1.8,
}) => {
  const Cmp = (icons as Record<string, React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>>)[name] ?? icons.Sparkles;
  return <Cmp size={s} color={color} strokeWidth={strokeWidth} />;
};

// A number that counts up from 0 to `value` between `from` and `to` frames.
export const Counter: React.FC<{ readonly value: number; readonly from?: number; readonly to?: number; readonly prefix?: string; readonly suffix?: string; readonly decimals?: number }> = ({
  value, from = 4, to = 34, prefix = "", suffix = "", decimals = 0,
}) => {
  const frame = useCurrentFrame();
  const v = interpolate(frame, [from, to], [0, value], { ...clamp, easing: easeIn });
  return <>{prefix}{v.toLocaleString("tr-TR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}</>;
};

// Slow camera push across the scene: the frame is never frozen.
export const CameraPush: React.FC<{ readonly length: number; readonly children: React.ReactNode; readonly amount?: number }> = ({ length, children, amount = 0.06 }) => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{ scale: interpolate(frame, [0, length], [1, 1 + amount], clamp) }}>{children}</AbsoluteFill>;
};

// Subtitles for one scene: the sentence appears in a box and each word lights up as it is spoken.
// Timing is estimated from character counts across the scene length.
export const Captions: React.FC<{ readonly text: string; readonly length: number; readonly theme: Theme }> = ({ text, length, theme }) => {
  const frame = useCurrentFrame();
  const L = useLayout();
  const words = text.split(/\s+/).filter(Boolean);
  const total = words.reduce((a, w) => a + w.length + 1, 0);
  const spoken = interpolate(frame, [2, Math.max(3, length - 6)], [0, total], clamp);
  let acc = 0;
  return (
    <div style={{ position: "absolute", left: L.padX, right: L.padX, top: L.captionY, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          columnGap: "0.25em",
          rowGap: 6,
          maxWidth: L.maxText,
          padding: `${16 * L.unit}px ${28 * L.unit}px`,
          borderRadius: 22 * L.unit,
          backgroundColor: `${theme.captionBg}d9`,
          fontFamily: theme.sans,
          fontSize: size.caption * L.unit,
          fontWeight: 600,
          lineHeight: 1.25,
          opacity: interpolate(frame, [0, 6], [0, 1], clamp),
        }}
      >
        {words.map((w, i) => {
          const start = acc;
          acc += w.length + 1;
          const on = spoken >= start;
          return (
            <span key={i} style={{ color: on ? theme.captionInk : `${theme.captionInk}66`, fontWeight: on ? 700 : 600 }}>
              {w}
            </span>
          );
        })}
      </div>
    </div>
  );
};
