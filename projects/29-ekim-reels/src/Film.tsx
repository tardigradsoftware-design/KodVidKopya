import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, interpolate, Sequence, staticFile } from "remotion";
import { Captions } from "./components/Captions";
import { CountScene } from "./scenes/CountScene";
import { Closing } from "./scenes/Closing";
import { FlagScene } from "./scenes/FlagScene";
import { Opening } from "./scenes/Opening";
import { ValuesScene } from "./scenes/ValuesScene";
import { clamp } from "./theme";
import { SCENE, VALUE_AT } from "./timeline";

/** Music sits under the voice and swells once the words stop. */
const musicVolume = (f: number): number =>
  interpolate(
    f,
    [0, 30, 320, 719, 760, 800, 872, 900, 916],
    [0, 0.085, 0.098, 0.105, 0.125, 0.165, 0.26, 0.28, 0.0],
    clamp,
  );

type Sfx = {
  readonly src: string;
  readonly from: number;
  readonly frames: number;
  readonly trim?: number;
  readonly volume: number;
};

// Every file is CC0 1.0 from the agent-video-editor library.
const SFX: readonly Sfx[] = [
  { src: "sfx/riser-medium-4s.wav", from: 0, frames: 18, trim: 102, volume: 0.3 },
  { src: "sfx/impact-soft-2.wav", from: 18, frames: 17, volume: 0.46 },
  { src: "sfx/dry-thud.wav", from: 18, frames: 6, volume: 0.44 },
  { src: "sfx/whoosh-long-2s.wav", from: 153, frames: 24, trim: 36, volume: 0.34 },
  { src: "sfx/whoosh-medium-1s.wav", from: 312, frames: 12, trim: 18, volume: 0.32 },
  { src: "sfx/whoosh-soft.wav", from: 456, frames: 14, trim: 7, volume: 0.3 },
  { src: "sfx/whoosh-short.wav", from: 710, frames: 9, trim: 2, volume: 0.34 },
  { src: "sfx/riser-short-2s.wav", from: 740, frames: 42, trim: 18, volume: 0.28 },
  { src: "sfx/impact-soft-1.wav", from: 782, frames: 16, volume: 0.5 },
  { src: "sfx/stinger-hit-short.wav", from: 782, frames: 35, volume: 0.2 },
];

export const Film: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#050507" }}>
      <Sequence from={SCENE.opening.from} durationInFrames={SCENE.opening.to - SCENE.opening.from} name="01 1923">
        <Opening />
      </Sequence>
      <Sequence from={SCENE.flag.from} durationInFrames={SCENE.flag.to - SCENE.flag.from} name="02 Bayrak">
        <FlagScene />
      </Sequence>
      <Sequence from={SCENE.count.from} durationInFrames={SCENE.count.to - SCENE.count.from} name="03 Sayac">
        <CountScene />
      </Sequence>
      <Sequence from={SCENE.values.from} durationInFrames={SCENE.values.to - SCENE.values.from} name="04 Degerler">
        <ValuesScene />
      </Sequence>
      <Sequence from={SCENE.closing.from} durationInFrames={SCENE.closing.to - SCENE.closing.from} name="05 Kapanis">
        <Closing />
      </Sequence>

      {/* captions live on top of the picture, under the closing title */}
      <Sequence from={SCENE.opening.from} durationInFrames={SCENE.closing.from - SCENE.opening.from} name="Altyazi">
        <Captions />
      </Sequence>

      {/* voice: one file, generated once, starts just after the impact */}
      <Sequence from={21} name="Seslendirme">
        <Audio src={staticFile("voice.mp3")} />
      </Sequence>

      <Audio src={staticFile("music.mp3")} trimBefore={120} volume={musicVolume} />

      {SFX.map((s) => (
        <Sequence key={s.src + s.from} from={s.from} durationInFrames={s.frames} name={s.src}>
          <Audio src={staticFile(s.src)} trimBefore={s.trim ?? 0} volume={s.volume} />
        </Sequence>
      ))}

      {VALUE_AT.map((at) => (
        <Sequence key={`pop${at}`} from={at} durationInFrames={6} name="pop">
          <Audio src={staticFile("sfx/pop-1.wav")} volume={0.22} />
        </Sequence>
      ))}

      {new Array(8).fill(0).map((_, i) => (
        <Sequence key={`tick${i}`} from={344 + i * 12} durationInFrames={3} name="tick">
          <Audio src={staticFile("sfx/tick-soft.wav")} volume={0.16} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
