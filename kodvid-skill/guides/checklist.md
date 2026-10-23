# Checklist

## Before you push

- [ ] `npx tsc` passes.
- [ ] `video.ts` has `voice: "voice.mp3"` and the measured `voiceSeconds`, and `public/voice.mp3` exists.
- [ ] Every scene has a `say` sentence, and the joined sentences are exactly what you sent to text-to-speech.
- [ ] On-screen text is short: titles of 1 to 4 words, list items of 2 to 5 words, at most 5 list items, at most 10 code lines.
- [ ] Nothing from the "Never ship" list in `motion-design.md`.
- [ ] `render.json` has a new `request` value.

## When the result comes back

1. Open `contact-sheet.jpg` first: all snapshots in one image. Describe each frame in a few words.
2. Open a single `snapshots/*.png` only if something in the sheet needs a closer look.
3. Check:
   - [ ] `result.json` says `"status": "ok"`.
   - [ ] No frame is empty, black or half-built.
   - [ ] Text is readable, inside the frame, not overlapping.
   - [ ] Turkish letters (ç, ğ, ı, ö, ş, ü, İ) render correctly.

Fast mode: if all pass, deliver now. If something fails, fix every problem at once and render one more time.
If problems remain after the second render, deliver it and list them for the user.

Report the real total time: start clock time, delivery clock time, and the difference.
