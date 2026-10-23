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
import { Subtitles } from "./Subtitles";
import { clamp, defaultTheme, Theme } from "./theme";

export type Cut = "slide" | "wipe" | "light";

type Common = {
  /** The sentence spoken during this scene. Joined in order, these lines are the whole narration script. */
  readonly say?: string;
  /** Fixed length in seconds. Leave it out to split the narration time by the length of `say`. */
  readonly seconds?: number;
  /** How this scene hands off to the next. Default "slide". */
  readonly cut?: Cut;
  /** Exact vocal onset cues in milliseconds (from start of voice.mp3) driving on-screen text transitions. */
  readonly cuesMs?: readonly number[];
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
  /** Show word-synced animated subtitles at the bottom of the frame. Default true when voice is set. */
  readonly subtitles?: boolean;
  readonly theme?: Partial<Theme>;
  readonly scenes: SceneSpec[];
};

export const TRANSITION_FRAMES = 12;
export const LIGHT_FRAMES = 24;
export const TAIL_FRAMES = 24;
const DEFAULT_SECONDS = 3;

/** Visible frames of each scene. Narration time is split by the character count of each scene's `say` unless `seconds` is given. */
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

const SceneView: React.FC<{ readonly scene: SceneSpec; readonly theme: Theme; readonly sceneStartMs: number }> = ({
  scene,
  theme,
  sceneStartMs,
}) => {
  switch (scene.type) {
    case "title": return <TitleScene {...scene} theme={theme} sceneStartMs={sceneStartMs} />;
    case "statement": return <StatementScene {...scene} theme={theme} sceneStartMs={sceneStartMs} />;
    case "list": return <ListScene {...scene} theme={theme} sceneStartMs={sceneStartMs} />;
    case "chips": return <ChipsScene {...scene} theme={theme} sceneStartMs={sceneStartMs} />;
    case "code": return <CodeScene {...scene} theme={theme} sceneStartMs={sceneStartMs} />;
    case "image": return <ImageScene {...scene} theme={theme} sceneStartMs={sceneStartMs} />;
    case "closing": return <ClosingScene {...scene} theme={theme} sceneStartMs={sceneStartMs} />;
  }
};

/** Builds the whole film from a VideoSpec: shared background, voice-locked scenes, hand-offs, narration and animated subtitles. */
export const Film: React.FC<{ readonly video: VideoSpec }> = ({ video }) => {
  const theme: Theme = { ...defaultTheme, ...video.theme };
  const frames = sceneFrames(video);
  const startFrames: number[] = [];
  let acc = 0;
  for (const f of frames) {
    startFrames.push(acc);
    acc += f;
  }

  const last = video.scenes.length - 1;
  const items: React.ReactNode[] = [];
  video.scenes.forEach((scene, i) => {
    const cut: Cut = scene.cut ?? "slide";
    const transitionAfter = i < last && cut !== "light";
    const length = frames[i] + (transitionAfter ? TRANSITION_FRAMES : 0) + (i === last ? TAIL_FRAMES : 0);
    const sceneStartMs = (startFrames[i] / video.fps) * 1000;
    items.push(
      <TransitionSeries.Sequence key={`s${i}`} name={`${i + 1} ${scene.type}`} durationInFrames={length}>
        <SceneView scene={scene} theme={theme} sceneStartMs={sceneStartMs} />
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

  const showSubtitles = video.subtitles ?? Boolean(video.voice);

  return (
    <AbsoluteFill>
      <Background theme={theme} />
      <TransitionSeries>{items}</TransitionSeries>
      {showSubtitles ? <Subtitles theme={theme} /> : null}
      {video.voice ? <Audio src={staticFile(video.voice)} /> : null}
    </AbsoluteFill>
  );
};
