import { lightLeak } from "@remotion/effects/light-leak";
import { Audio } from "@remotion/media";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { AbsoluteFill, interpolate, Solid, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Background } from "./parts";
import {
  ChipsProps, ChipsScene, ClosingProps, ClosingScene, CodeProps, CodeScene, ImageProps, ImageScene,
  ListProps, ListScene, StatementProps, StatementScene, TitleProps, TitleScene,
} from "./scenes";
import { clamp, defaultTheme, Theme } from "./theme";

// How a scene hands off to the next one.
// "slide": fast move in the film's direction (default). "wipe": a hard wipe in the same direction.
// "light": a light leak over a hard cut, for one special moment.
export type Cut = "slide" | "wipe" | "light";

type Common = {
  /** The sentence spoken during this scene. Joined in order, these lines are the whole narration script. */
  readonly say?: string;
  /** Fixed length in seconds. Leave it out to split the narration time by the length of `say`. */
  readonly seconds?: number;
  /** How this scene hands off to the next. Default "slide". */
  readonly cut?: Cut;
};

export type SceneSpec = Common &
  (
    | ({ readonly type: "title" } & TitleProps)
    | ({ readonly type: "statement" } & StatementProps)
    | ({ readonly type: "list" } & ListProps)
    | ({ readonly type: "chips" } & ChipsProps)
    | ({ readonly type: "code" } & CodeProps)
    | ({ readonly type: "image" } & ImageProps)
    | ({ readonly type: "closing" } & ClosingProps)
  );

export type VideoSpec = {
  readonly fps: number;
  readonly width: number;
  readonly height: number;
  /** File in public/ with the whole narration, or null for no voice. */
  readonly voice: string | null;
  /** Measured length of the voice file in seconds. Scenes without `seconds` share it. */
  readonly voiceSeconds: number | null;
  readonly theme?: Partial<Theme>;
  readonly scenes: SceneSpec[];
};

export const TRANSITION_FRAMES = 12;
export const LIGHT_FRAMES = 24;
export const TAIL_FRAMES = 15;
const DEFAULT_SECONDS = 3;

/** Visible frames of each scene. Narration time is split by the character count of each scene's `say`. */
export const sceneFrames = (v: VideoSpec): number[] => {
  const fixed = v.scenes.map((s) => (s.seconds ? s.seconds : 0));
  const free = v.scenes.map((s, i) => (fixed[i] ? 0 : Math.max(1, (s.say ?? "").length)));
  const freeTotal = free.reduce((a, b) => a + b, 0);
  const voiceLeft = Math.max(0, (v.voiceSeconds ?? 0) - fixed.reduce((a, b) => a + b, 0));
  return v.scenes.map((s, i) => {
    const sec = fixed[i] || (v.voiceSeconds && freeTotal ? (free[i] / freeTotal) * voiceLeft : DEFAULT_SECONDS);
    return Math.max(Math.round(1 * v.fps), Math.round(sec * v.fps));
  });
};

/** Total composition length. Use it for durationInFrames in Root.tsx. */
export const totalFrames = (v: VideoSpec): number => sceneFrames(v).reduce((a, b) => a + b, 0) + TAIL_FRAMES;

/** The narration script: every scene's `say`, in order. Give exactly this text to the text-to-speech tool. */
export const narrationScript = (v: VideoSpec): string => v.scenes.map((s) => s.say ?? "").filter(Boolean).join(" ");

const LightLeak: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();
  return <Solid width={width} height={height} effects={[lightLeak({ hueShift: 0, progress: interpolate(frame, [0, durationInFrames - 1], [0, 1], clamp) })]} />;
};

const SceneView: React.FC<{ readonly scene: SceneSpec; readonly theme: Theme }> = ({ scene, theme }) => {
  switch (scene.type) {
    case "title": return <TitleScene {...scene} theme={theme} />;
    case "statement": return <StatementScene {...scene} theme={theme} />;
    case "list": return <ListScene {...scene} theme={theme} />;
    case "chips": return <ChipsScene {...scene} theme={theme} />;
    case "code": return <CodeScene {...scene} theme={theme} />;
    case "image": return <ImageScene {...scene} theme={theme} />;
    case "closing": return <ClosingScene {...scene} theme={theme} />;
  }
};

/** Builds the whole film from a VideoSpec: shared background, scenes, hand-offs and narration. */
export const Film: React.FC<{ readonly video: VideoSpec }> = ({ video }) => {
  const theme: Theme = { ...defaultTheme, ...video.theme };
  const frames = sceneFrames(video);
  const last = video.scenes.length - 1;
  const items: React.ReactNode[] = [];
  video.scenes.forEach((scene, i) => {
    const cut: Cut = scene.cut ?? "slide";
    const transitionAfter = i < last && cut !== "light";
    const length = frames[i] + (transitionAfter ? TRANSITION_FRAMES : 0) + (i === last ? TAIL_FRAMES : 0);
    items.push(
      <TransitionSeries.Sequence key={`s${i}`} name={`${i + 1} ${scene.type}`} durationInFrames={length}>
        <SceneView scene={scene} theme={theme} />
      </TransitionSeries.Sequence>,
    );
    if (i === last) return;
    if (cut === "light") {
      items.push(
        <TransitionSeries.Overlay key={`o${i}`} durationInFrames={LIGHT_FRAMES}>
          <LightLeak />
        </TransitionSeries.Overlay>,
      );
    } else if (cut === "wipe") {
      items.push(<TransitionSeries.Transition key={`t${i}`} presentation={wipe({ direction: "from-right" })} timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })} />);
    } else {
      items.push(<TransitionSeries.Transition key={`t${i}`} presentation={slide({ direction: "from-right" })} timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })} />);
    }
  });

  return (
    <AbsoluteFill>
      <Background theme={theme} />
      <TransitionSeries>{items}</TransitionSeries>
      {video.voice ? <Audio src={staticFile(video.voice)} /> : null}
    </AbsoluteFill>
  );
};
