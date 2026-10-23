import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { voiceAmpAtFrame } from "../audioSync";
import { clamp, easeIn, Theme } from "./theme";

const toHex2 = (n: number): string => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");

// Shared atmospheric world: two traveling lights whose intensity responds organically to the narrator's voice.
export const Background: React.FC<{ readonly theme: Theme }> = ({ theme }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const amp = voiceAmpAtFrame(frame);
  const t = interpolate(frame, [0, durationInFrames], [0, 1], clamp);
  const ax = 20 + 30 * t;
  const bx = 85 - 25 * t;
  const glowA = toHex2(0x36 + 0x26 * amp);
  const glowB = toHex2(0x1e + 0x1c * amp);
  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.ground,
        backgroundImage: [
          `radial-gradient(62% 72% at ${ax}% 28%, ${theme.accent}${glowA}, transparent 70%)`,
          `radial-gradient(52% 62% at ${bx}% 80%, ${theme.accent}${glowB}, transparent 70%)`,
          `radial-gradient(120% 120% at 50% 50%, transparent 54%, rgba(0,0,0,0.58) 100%)`,
        ].join(", "),
      }}
    />
  );
};

// Words that land either at a fixed frame gap or on exact audio cue frames (`cuesLocalFrames`).
export const Words: React.FC<{
  readonly text: string;
  readonly delay?: number;
  readonly gap?: number;
  readonly cuesLocalFrames?: readonly number[];
  readonly style?: React.CSSProperties;
}> = ({ text, delay = 0, gap = 4, cuesLocalFrames, style }) => {
  const frame = useCurrentFrame();
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: "0.28em", ...style }}>
      {words.map((w, i) => {
        const start = cuesLocalFrames && cuesLocalFrames[i] !== undefined ? cuesLocalFrames[i] : delay + i * gap;
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: interpolate(frame, [start, start + 6], [0, 1], clamp),
              translate: interpolate(frame, [start, start + 12], ["0px 38px", "0px 0px"], { ...clamp, easing: easeIn }),
              scale: interpolate(frame, [start, start + 12], [1.2, 1], { ...clamp, easing: easeIn }),
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
        opacity: interpolate(frame, [delay, delay + 9], [0, 1], clamp),
        translate: interpolate(frame, [delay, delay + 14], ["0px 28px", "0px 0px"], { ...clamp, easing: easeIn }),
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// A thin accent line that draws itself from the center, with subtle audio-reactive glow.
export const Rule: React.FC<{
  readonly theme: Theme;
  readonly delay?: number;
  readonly duration?: number;
  readonly width?: number;
  readonly amp?: number;
}> = ({ theme, delay = 0, duration = 16, width = 240, amp = 0 }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        width,
        height: 4,
        borderRadius: 2,
        backgroundColor: theme.accent,
        boxShadow: `0 0 ${Math.round(12 + 16 * amp)}px ${theme.accent}88`,
        scale: `${interpolate(frame, [delay, delay + duration], [0, 1], { ...clamp, easing: easeIn })} 1`,
      }}
    />
  );
};
