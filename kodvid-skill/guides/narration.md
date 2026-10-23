# Narration guide

The user's rule: **one audio file per video**, generated in a single call.

## Script

- Write all lines first, one short line per beat. About 2.5 to 3 words per second: a 15 s video holds about 40 words.
- Write it, then cut it by half. Real phrasing, no slogans (see `motion-design.md`, "Never ship").
- Put a full stop at the end of every line. The pause between sentences gives each scene its cut point.

## Voice

- Generate the whole script in **one** call to your own text-to-speech tool. Do not generate per scene, and do not trim or re-record parts.
- Save it as `projects/<name>/public/voice.mp3`.
- Tools that do not work in this sandbox: `edge-tts` (needs a blocked website) and the Kokoro model (no Turkish).

## Timing

Measure the length once:

```bash
cd /tmp && npm i -s music-metadata && node -e "import('music-metadata').then(m=>m.parseFile('<abs path>/public/voice.mp3')).then(r=>console.log(r.format.duration))"
```

Then derive every duration from it:

1. Count the characters of each line. A line's share of the audio = its characters / all characters.
2. Scene length in frames = share × audio seconds × fps. Round to whole frames.
3. Add the transition frames back to each scene that is followed by a `TransitionSeries.Transition`, so the total still matches.
4. `durationInFrames` in `Root.tsx` = audio seconds × fps, rounded up, plus 15 frames of tail.
5. On-screen words should land 0 to 2 frames before they are heard.

If your text-to-speech tool returns word or sentence timestamps, use them instead of the character estimate.

## In the video

```tsx
import { Audio } from "@remotion/media";
import { staticFile } from "remotion";

<Audio src={staticFile("voice.mp3")} />
```

Put it once, at the top level of `Main`, outside the `TransitionSeries`, so it plays from frame 0 to the end.
For music under the voice, add a second `<Audio>` with `volume={0.12}` to `0.2`.
