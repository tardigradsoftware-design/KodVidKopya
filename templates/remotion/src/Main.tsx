import { lightLeak } from "@remotion/effects/light-leak";
import { loadFont } from "@remotion/google-fonts/Inter";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  Solid,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const { fontFamily } = loadFont("normal", { weights: ["400", "800"], subsets: ["latin", "latin-ext"] });

const colors = { ground: "#0b1020", ink: "#eef2ff", accent: "#5eead4", muted: "#94a3b8" };
const ease = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// One scene: a headline that rises in and a supporting line that fades in after it.
const Scene: React.FC<{ readonly title: string; readonly line: string }> = ({ title, line }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: colors.ground, alignItems: "center", justifyContent: "center", gap: 32, fontFamily }}>
      <div
        style={{
          color: colors.ink,
          fontSize: 140,
          fontWeight: 800,
          letterSpacing: "-0.04em",
          opacity: interpolate(frame, [0, 0.6 * fps], [0, 1], { ...clamp, easing: ease }),
          translate: interpolate(frame, [0, 0.8 * fps], ["0px 60px", "0px 0px"], { ...clamp, easing: ease }),
        }}
      >
        {title}
      </div>
      <div style={{ color: colors.muted, fontSize: 48, opacity: interpolate(frame, [0.5 * fps, 1.1 * fps], [0, 1], clamp) }}>
        {line}
      </div>
    </AbsoluteFill>
  );
};

// A light leak played over a cut. Needs WebGL: see remotion.config.ts.
const LightLeakOverlay: React.FC<{ readonly hueShift?: number }> = ({ hueShift = 0 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();
  return (
    <Solid
      width={width}
      height={height}
      effects={[lightLeak({ hueShift, progress: interpolate(frame, [0, durationInFrames - 1], [0, 1], clamp) })]}
    />
  );
};

// Total length = sum of Sequence durations minus Transition durations (Overlays add nothing).
// 120 + 90 + 105 - 15 = 300 frames. Keep durationInFrames in Root.tsx equal to it.
export const Main: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: colors.ground }}>
      <TransitionSeries>
        <TransitionSeries.Sequence name="Opening" durationInFrames={120}>
          <Scene title="KodVid" line="Remotion şablonu" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Overlay durationInFrames={30}>
          <LightLeakOverlay hueShift={160} />
        </TransitionSeries.Overlay>
        <TransitionSeries.Sequence name="Middle" durationInFrames={90}>
          <Scene title="Efektler" line="Işık sızıntısı ve geçişler" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={linearTiming({ durationInFrames: 15 })} />
        <TransitionSeries.Sequence name="Closing" durationInFrames={105}>
          <Scene title="Hazır" line="Kodla video" />
        </TransitionSeries.Sequence>
      </TransitionSeries>
      {/* Narration: put the file in public/voice.mp3, then add:
          import { Audio } from "@remotion/media";  import { staticFile } from "remotion";
          <Audio src={staticFile("voice.mp3")} /> */}
    </AbsoluteFill>
  );
};
