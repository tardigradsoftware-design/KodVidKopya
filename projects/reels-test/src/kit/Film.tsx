import { lightLeak } from "@remotion/effects/light-leak";
import { Audio } from "@remotion/media";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { AbsoluteFill, interpolate, Sequence, Solid, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Background, CameraPush, Captions } from "./parts";
import {
  ChipsProps, ChipsScene, ClosingProps, ClosingScene, CodeProps, CodeScene, CtaProps, CtaScene, FactProps, FactScene,
  HookProps, HookScene, ImageProps, ImageScene, ListProps, ListScene, QuoteProps, QuoteScene, StatementProps, StatementScene,
  TipProps, TipScene, TitleProps, TitleScene,
} from "./scenes";
import { clamp, Style, styles, Theme } from "./theme";

// How a scene hands off to the next one.
// "slide": fast move (default). "wipe": hard wipe. "light": a light leak over a hard cut, for one special moment.
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
    | ({ readonly type: "hook" } & HookProps)
    | ({ readonly type: "title" } & TitleProps)
    | ({ readonly type: "tip" } & TipProps)
    | ({ readonly type: "quote" } & QuoteProps)
    | ({ readonly type: "fact" } & FactProps)
    | ({ readonly type: "statement" } & StatementProps)
    | ({ readonly type: "list" } & ListProps)
    | ({ readonly type: "chips" } & ChipsProps)
    | ({ readonly type: "code" } & CodeProps)
    | ({ readonly type: "image" } & ImageProps)
    | ({ readonly type: "cta" } & CtaProps)
    | ({ readonly type: "closing" } & ClosingProps)
  );

/** Bundled CC0 music beds (copied to public/kodvid-audio by the render workflow). */
export type Music = "calm-loop" | "emotional-piano-loop" | "energetic-22s" | "happy-clap-17s" | "lofi-chill-loop" | "inspiring-orchestral";

export type VideoSpec = {
  readonly fps: number;
  /** 1080x1920 for Reels, TikTok and Shorts. 1920x1080 for YouTube. */
  readonly width: number;
  readonly height: number;
  /** "soft" cream and rose, "bold" plum and magenta, "fresh" mint, "dark" navy. */
  readonly style: Style;
  /** Override single colors of the style, as 6-digit hex. */
  readonly theme?: Partial<Theme>;
  /** File in public/ with the whole narration, or null for no voice. */
  readonly voice: string | null;
  /** Measured length of the voice file in seconds. Scenes without `seconds` share it. */
  readonly voiceSeconds: number | null;
  /** Show each scene's `say` as subtitles with word highlighting. Default true. */
  readonly captions?: boolean;
  /** Sound effects on cuts and key moments. Default true. */
  readonly sfx?: boolean;
  /** Background music under the voice, or null. For Instagram, prefer adding music in the app. */
  readonly music?: Music | null;
  readonly scenes: SceneSpec[];
};

export const TRANSITION_FRAMES = 10;
export const LIGHT_FRAMES = 24;
export const TAIL_FRAMES = 15;
const DEFAULT_SECONDS = 3;
const AUDIO = "kodvid-audio";

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

/** Total composition length. Root.tsx uses it. */
export const totalFrames = (v: VideoSpec): number => sceneFrames(v).reduce((a, b) => a + b, 0) + TAIL_FRAMES;

/** The narration script: every scene's `say`, in order. Give exactly this text to the text-to-speech tool. */
export const narrationScript = (v: VideoSpec): string => v.scenes.map((s) => s.say ?? "").filter(Boolean).join(" ");

const LightLeak: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();
  return <Solid width={width} height={height} effects={[lightLeak({ hueShift: 320, progress: interpolate(frame, [0, durationInFrames - 1], [0, 1], clamp) })]} />;
};

const SceneView: React.FC<{ readonly scene: SceneSpec; readonly theme: Theme; readonly length: number }> = ({ scene, theme, length }) => {
  const b = { theme, length };
  switch (scene.type) {
    case "hook": return <HookScene {...scene} {...b} />;
    case "title": return <TitleScene {...scene} {...b} />;
    case "tip": return <TipScene {...scene} {...b} />;
    case "quote": return <QuoteScene {...scene} {...b} />;
    case "fact": return <FactScene {...scene} {...b} />;
    case "statement": return <StatementScene {...scene} {...b} />;
    case "list": return <ListScene {...scene} {...b} />;
    case "chips": return <ChipsScene {...scene} {...b} />;
    case "code": return <CodeScene {...scene} {...b} />;
    case "image": return <ImageScene {...scene} {...b} />;
    case "cta": return <CtaScene {...scene} {...b} />;
    case "closing": return <ClosingScene {...scene} {...b} />;
  }
};

const Sfx: React.FC<{ readonly at: number; readonly name: string; readonly volume?: number }> = ({ at, name, volume = 0.5 }) => (
  <Sequence from={Math.max(0, at)} layout="none">
    <Audio src={staticFile(`${AUDIO}/sfx/${name}.wav`)} volume={volume} />
  </Sequence>
);

/** Builds the whole film from a VideoSpec: background, scenes, cuts, captions, sound effects, music and narration. */
export const Film: React.FC<{ readonly video: VideoSpec }> = ({ video }) => {
  const theme: Theme = { ...styles[video.style], ...video.theme };
  const frames = sceneFrames(video);
  const last = video.scenes.length - 1;
  const captions = video.captions ?? true;
  const sfx = video.sfx ?? true;
  const items: React.ReactNode[] = [];
  const sounds: React.ReactNode[] = [];
  let t = 0; // visible start of the current scene

  video.scenes.forEach((scene, i) => {
    const cut: Cut = scene.cut ?? "slide";
    const transitionAfter = i < last && cut !== "light";
    const length = frames[i] + (transitionAfter ? TRANSITION_FRAMES : 0) + (i === last ? TAIL_FRAMES : 0);
    items.push(
      <TransitionSeries.Sequence key={`s${i}`} name={`${i + 1} ${scene.type}`} durationInFrames={length}>
        <CameraPush length={length} amount={scene.type === "image" ? 0 : 0.05}>
          <SceneView scene={scene} theme={theme} length={length} />
        </CameraPush>
        {captions && scene.say ? <Captions text={scene.say} length={frames[i]} theme={theme} /> : null}
      </TransitionSeries.Sequence>,
    );
    if (sfx) {
      if (scene.type === "hook" || scene.type === "fact") sounds.push(<Sfx key={`h${i}`} at={t + 2} name="impact-soft-1" volume={0.55} />);
      if (scene.type === "tip" || scene.type === "list") sounds.push(<Sfx key={`p${i}`} at={t + 8} name="pop-1" volume={0.35} />);
      if (scene.type === "cta") sounds.push(<Sfx key={`c${i}`} at={t + 2} name="success-chime" volume={0.45} />);
      if (i < last) sounds.push(<Sfx key={`w${i}`} at={t + frames[i] - 6} name={cut === "light" ? "swell-soft-3s" : "whoosh-soft"} volume={0.4} />);
    }
    t += frames[i];
    if (i === last) return;
    if (cut === "light") {
      items.push(<TransitionSeries.Overlay key={`o${i}`} durationInFrames={LIGHT_FRAMES}><LightLeak /></TransitionSeries.Overlay>);
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
      {sounds}
      {video.music ? <Audio src={staticFile(`${AUDIO}/music/${video.music}.mp3`)} volume={video.voice ? 0.12 : 0.35} loop /> : null}
      {video.voice ? <Audio src={staticFile(video.voice)} /> : null}
    </AbsoluteFill>
  );
};
