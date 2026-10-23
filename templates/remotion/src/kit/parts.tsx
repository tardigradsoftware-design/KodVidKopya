import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, easeIn, Theme } from "./theme";

// A built world instead of a flat swatch: two soft lights that travel slowly across the whole film, plus a vignette.
export const Background: React.FC<{ readonly theme: Theme }> = ({ theme }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = interpolate(frame, [0, durationInFrames], [0, 1], clamp);
  const ax = 20 + 30 * t;
  const bx = 85 - 25 * t;
  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.ground,
        backgroundImage: [
          `radial-gradient(60% 70% at ${ax}% 30%, ${theme.accent}40, transparent 70%)`,
          `radial-gradient(50% 60% at ${bx}% 80%, ${theme.accent}24, transparent 70%)`,
          `radial-gradient(120% 120% at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)`,
        ].join(", "),
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
}> = ({ text, delay = 0, gap = 4, style }) => {
  const frame = useCurrentFrame();
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: "0.28em", ...style }}>
      {words.map((w, i) => {
        const start = delay + i * gap;
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: interpolate(frame, [start, start + 6], [0, 1], clamp),
              translate: interpolate(frame, [start, start + 12], ["0px 40px", "0px 0px"], { ...clamp, easing: easeIn }),
              scale: interpolate(frame, [start, start + 12], [1.18, 1], { ...clamp, easing: easeIn }),
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
export const Rise: React.FC<{ readonly delay?: number; readonly children: React.ReactNode; readonly style?: React.CSSProperties }> = ({
  delay = 0,
  children,
  style,
}) => {
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

// A thin accent line that draws itself from the center.
export const Rule: React.FC<{ readonly theme: Theme; readonly delay?: number; readonly width?: number }> = ({ theme, delay = 0, width = 220 }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        width,
        height: 4,
        borderRadius: 2,
        backgroundColor: theme.accent,
        scale: `${interpolate(frame, [delay, delay + 14], [0, 1], { ...clamp, easing: easeIn })} 1`,
      }}
    />
  );
};
