import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { clamp, hash, mix } from "../theme";

/** Animated film grain. Pure function of the frame: the seed comes from the frame number. */
export const Grain: React.FC<{ readonly opacity?: number }> = ({ opacity = 0.09 }) => {
  const frame = useCurrentFrame();
  const x = Math.round(hash(frame + 1) * 220);
  const y = Math.round(hash(frame + 91) * 220);
  return (
    <AbsoluteFill
      style={{
        opacity,
        mixBlendMode: "overlay",
        backgroundImage:
          "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)'/%3E%3C/svg%3E\")",
        backgroundPosition: `${x}px ${y}px`,
        backgroundSize: "220px 220px",
      }}
    />
  );
};

/** Dark corners and a soft floor shadow: keeps the eye in the middle. */
export const Vignette: React.FC<{ readonly strength?: number }> = ({ strength = 0.85 }) => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background: `radial-gradient(115% 85% at 50% 44%, rgba(0,0,0,0) 38%, rgba(0,0,0,${0.45 * strength}) 74%, rgba(0,0,0,${0.92 * strength}) 100%)`,
    }}
  />
);

/** A soft diagonal band of light crossing the frame. */
export const LightLeak: React.FC<{
  readonly progress: number;
  readonly color?: string;
  readonly opacity?: number;
  readonly angle?: number;
  readonly width?: number;
}> = ({ progress, color = "#FFD9B0", opacity = 0.55, angle = 72, width = 120 }) => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      mixBlendMode: "screen",
      opacity,
      background: `linear-gradient(${angle}deg, rgba(0,0,0,0) ${progress * 100 - width}%, ${color} ${progress * 100}%, rgba(0,0,0,0) ${progress * 100 + width}%)`,
    }}
  />
);

/** Full-frame colour flash, used on the two hits. */
export const Flash: React.FC<{ readonly amount: number; readonly color?: string }> = ({ amount, color = "#FFF3E4" }) =>
  amount <= 0.001 ? null : (
    <AbsoluteFill style={{ pointerEvents: "none", backgroundColor: color, opacity: amount, mixBlendMode: "screen" }} />
  );

/** Embers and dust drifting up through the frame. */
export const Embers: React.FC<{ readonly count?: number; readonly seed?: number; readonly warmth?: number }> = ({
  count = 44,
  seed = 0,
  warmth = 0.7,
}) => {
  const frame = useCurrentFrame();
  const items = new Array(count).fill(0).map((_, i) => {
    const a = hash(seed + i * 3.1);
    const b = hash(seed + i * 5.7 + 11);
    const c = hash(seed + i * 9.3 + 23);
    const speed = 0.7 + b * 2.1;
    const travel = (frame * speed + c * 2300) % 2400;
    const y = 2080 - travel;
    const x = a * 1180 - 50 + Math.sin(frame * 0.017 + c * 6.28) * 46;
    const size = 2 + c * 5.5;
    const flicker = 0.45 + 0.55 * Math.sin(frame * 0.16 + i * 2.7);
    const fade = interpolate(travel, [0, 260, 2100, 2400], [0, 1, 1, 0], clamp);
    const alpha = (0.16 + 0.5 * b) * flicker * fade;
    const warm = mix(0.35, 1, warmth * (0.4 + 0.6 * c));
    return {
      key: i,
      x,
      y,
      size,
      alpha,
      color: `rgba(255,${Math.round(150 + 70 * warm)},${Math.round(90 + 60 * warm)},1)`,
      blur: size > 5 ? 1.4 : 0.6,
    };
  });
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {items.map((it) => (
        <div
          key={it.key}
          style={{
            position: "absolute",
            left: it.x,
            top: it.y,
            width: it.size,
            height: it.size,
            borderRadius: "50%",
            backgroundColor: it.color,
            opacity: it.alpha,
            filter: `blur(${it.blur}px)`,
            boxShadow: `0 0 ${it.size * 3}px rgba(255,140,60,0.75)`,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

/** A firework burst made of short streaks with gravity. */
export const Burst: React.FC<{
  readonly cx?: number;
  readonly cy?: number;
  readonly at: number;
  readonly count?: number;
  readonly power?: number;
  readonly hue?: string;
}> = ({ cx = 540, cy = 620, at, count = 42, power = 17, hue = "255,196,120" }) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < 0 || t > 74) return null;
  const parts = new Array(count).fill(0).map((_, i) => {
    const a = (i / count) * Math.PI * 2 + hash(at + i) * 0.5;
    const sp = power * (0.45 + hash(at + i * 7) * 0.85);
    const grav = 0.055;
    const px = cx + Math.cos(a) * sp * t;
    const py = cy + Math.sin(a) * sp * t + grav * t * t;
    const q = t - 1.6;
    const qx = cx + Math.cos(a) * sp * q;
    const qy = cy + Math.sin(a) * sp * q + grav * q * q;
    const alpha = Math.max(0, 1 - t / 62);
    const len = Math.hypot(px - qx, py - qy) + 4;
    const ang = (Math.atan2(py - qy, px - qx) * 180) / Math.PI;
    return { key: i, x: qx, y: qy, len, ang, alpha: alpha * (0.55 + 0.45 * hash(i + at * 3)) };
  });
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen" }}>
      {parts.map((pt) => (
        <div
          key={pt.key}
          style={{
            position: "absolute",
            left: pt.x,
            top: pt.y,
            width: pt.len,
            height: 2.4,
            borderRadius: 2,
            backgroundColor: `rgba(${hue},${pt.alpha})`,
            transform: `rotate(${pt.ang}deg)`,
            transformOrigin: "0 50%",
            boxShadow: `0 0 8px rgba(${hue},0.9)`,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

/** Expanding shock ring for the two big hits. */
export const ShockRing: React.FC<{ readonly at: number; readonly color?: string }> = ({ at, color = "255,235,200" }) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < 0 || t > 34) return null;
  const size = 120 + t * 46;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          border: `3px solid rgba(${color},${Math.max(0, 0.55 - t / 40)})`,
          filter: "blur(1px)",
        }}
      />
    </AbsoluteFill>
  );
};
