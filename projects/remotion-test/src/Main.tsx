import { loadFont } from "@remotion/google-fonts/Inter";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const { fontFamily } = loadFont("normal", { weights: ["400", "800"], subsets: ["latin", "latin-ext"] });

const colors = { ground: "#0b1020", ink: "#eef2ff", accent: "#5eead4", muted: "#94a3b8" };

// One scene: a headline that rises in and a line that fades in after it.
const Scene: React.FC<{ readonly title: string; readonly line: string }> = ({ title, line }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ease = Easing.bezier(0.16, 1, 0.3, 1);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.ground,
        alignItems: "center",
        justifyContent: "center",
        gap: 32,
        fontFamily,
      }}
    >
      <div
        style={{
          color: colors.ink,
          fontSize: 140,
          fontWeight: 800,
          letterSpacing: "-0.04em",
          opacity: interpolate(frame, [0, 0.6 * fps], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease }),
          translate: interpolate(frame, [0, 0.8 * fps], ["0px 60px", "0px 0px"], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease }),
        }}
      >
        {title}
      </div>
      <div
        style={{
          color: colors.muted,
          fontSize: 48,
          opacity: interpolate(frame, [0.5 * fps, 1.1 * fps], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      >
        {line}
      </div>
    </AbsoluteFill>
  );
};

export const Main: React.FC = () => {
  const { fps } = useVideoConfig();
  // Total length = sum of sequences minus transition lengths. Keep it equal to durationInFrames in Root.tsx.
  return (
    <AbsoluteFill style={{ backgroundColor: colors.ground }}>
      <TransitionSeries>
        <TransitionSeries.Sequence name="Opening" durationInFrames={5 * fps}>
          <Scene title="KodVid" line="Remotion şablonu" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={linearTiming({ durationInFrames: 15 })} />
        <TransitionSeries.Sequence name="Closing" durationInFrames={5 * fps + 15}>
          <Scene title="Hazır" line="Kodla video" />
        </TransitionSeries.Sequence>
      </TransitionSeries>
      {/* Narration: put the file in public/voice.mp3, then add:
          import { Audio } from "@remotion/media";  import { staticFile } from "remotion";
          <Audio src={staticFile("voice.mp3")} /> */}
    </AbsoluteFill>
  );
};
