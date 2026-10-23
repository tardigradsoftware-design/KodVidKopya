# Narration guide

The user's rule: **one audio file per video**, generated once.

## Script

- Each scene in `src/video.ts` has one `say` sentence. Together they are the whole script.
- About 2.5 words per second: a 15 s video holds about 35 to 40 words, so about 6 words per scene for 6 scenes.
- Real phrasing, no slogans (see `motion-design.md`, "Never ship"). End every sentence with a full stop: the pause between sentences is where the cut lands.

## Voice

- Join all `say` lines with spaces, in order, and generate them in **one** call to your own text-to-speech tool.
- Save it as `projects/<name>/public/voice.mp3`.
- **Do not regenerate to hit a target length.** The kit splits the voice length across scenes, so the video always matches the voice.
  Regenerate only if the length is more than 25 % off what the user asked, or the voice has a clear error.
- Tools that do not work in this sandbox: `edge-tts` (needs a blocked website) and the Kokoro model (no Turkish).

## Measure once

```bash
cd /tmp && npm i -s music-metadata && node -e "import('music-metadata').then(m=>m.parseFile('<abs path>/public/voice.mp3')).then(r=>console.log(r.format.duration))"
```

Put the number in `video.ts`: `voice: "voice.mp3", voiceSeconds: <number>`. That is all. The kit gives each scene a share of the voice in proportion to the length of its `say` sentence, and adds a short tail at the end.

To pin one scene to an exact length, give it `seconds`. The other scenes share the rest of the voice.

## Music (optional)

The kit plays only the voice. To add music under it, put the file in `public/` and add `<Audio src={staticFile("music.mp3")} volume={0.15} />` inside `Film` in `src/kit/Film.tsx`, next to the voice.
