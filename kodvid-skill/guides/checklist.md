# Checklist

## Before you push

- [ ] `npx tsc` passes with no errors.
- [ ] `durationInFrames` in `Root.tsx` equals the scene math and covers the audio plus about 15 frames.
- [ ] `public/voice.mp3` exists and `<Audio src={staticFile("voice.mp3")} />` is in `Main`.
- [ ] All `remotion` and `@remotion/*` versions are exactly `4.0.538`.
- [ ] `remotion.config.ts` still sets `swangle`.
- [ ] No CSS animation, no `Math.random()`, no `Date.now()`.
- [ ] Nothing from the "Never ship" list in `motion-design.md`.
- [ ] Every scene change is a cut on motion in the film's direction.
- [ ] Text sizes: headline at least 84 px, supporting at least 44 px at 1920 wide.
- [ ] `render.json` has a new `request` value.

## When the result comes back

Open every PNG in `snapshots/` and describe each in one sentence: what is on screen, what the hero is, whether it would pass as a slide.
Then check:

- [ ] `result.json` says `"status": "ok"` and the duration matches the plan.
- [ ] No frame is empty, black or half-built.
- [ ] Text is readable and inside the safe area. Nothing overlaps or is cut off.
- [ ] One clear focal point in each frame.
- [ ] Turkish letters (ç, ğ, ı, ö, ş, ü, İ) render correctly.

If something fails, fix **all** problems you found at once, then render once more.
If problems remain after the second render, deliver it and list them for the user.
