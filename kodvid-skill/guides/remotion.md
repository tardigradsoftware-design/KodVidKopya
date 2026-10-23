# Remotion guide (version 4.0.538)

For custom scenes and quality mode. In fast mode you only edit `src/video.ts` (see `SKILL.md`).
Verified against Remotion 4.0.538 and real renders on this repo's GitHub workflow.

## Project

Start from `templates/remotion`. Copy the whole folder to `projects/<name>`. It contains:

| File | Purpose |
|---|---|
| `package.json` | Pinned versions. All `remotion` and `@remotion/*` packages must have the same version: `4.0.538`. |
| `remotion.config.ts` | Render settings. Keep `setChromiumOpenGlRenderer("swangle")`: GitHub has no GPU and effects need software WebGL. |
| `src/video.ts` | The film spec: scenes, narration lines, voice length, colors. |
| `src/kit/Film.tsx` | Builds the film from the spec: background, scenes, cuts, voice, and all timing math. |
| `src/kit/scenes.tsx` | The scene components. |
| `src/kit/parts.tsx` | Building blocks: `Background`, `Words` (word-by-word text), `Rise`, `Rule`. |
| `src/kit/theme.ts` | Fonts (Inter, JetBrains Mono), colors, easings, type sizes. |
| `src/Root.tsx`, `src/Main.tsx`, `src/index.ts` | Wiring. Length comes from `totalFrames(video)`. Do not edit. |
| `public/` | Assets: `voice.mp3`, images, fonts. Reference them with `staticFile("name")`. |

## Adding a custom scene

1. Write the component in `src/kit/scenes.tsx`, transparent (no background), taking its props plus `theme`. Reuse `Words`, `Rise` and the `size`, `easeIn`, `clamp` helpers.
2. Add a member to `SceneSpec` in `src/kit/Film.tsx`: `({ readonly type: "myscene" } & MyProps)`.
3. Add a `case "myscene"` to `SceneView`.
4. Use it in `video.ts`. Timing, cuts and voice keep working.

Add a package with the exact same version, for example `npm i @remotion/three@4.0.538 three @react-three/fiber`.
Useful packages: `@remotion/transitions`, `@remotion/effects`, `@remotion/media`, `@remotion/google-fonts`,
`@remotion/three`, `@remotion/lottie`, `@remotion/shapes`, `@remotion/paths`, `@remotion/captions`, `@remotion/layout-utils`, `@remotion/motion-blur`.

Check locally with `npm install` and `npx tsc` before pushing. Rendering happens on GitHub.

## Time

- Everything is measured in **frames**. Get `fps` from `useVideoConfig()` and write times as `2 * fps`.
- `useCurrentFrame()` is the frame number **inside the current Sequence**, starting at 0.
- The kit sets the total length from `video.ts` through `totalFrames(video)`. Outside the kit: `durationInFrames = Math.ceil(audioSeconds * fps) + 15`.

## Animation

Drive every value with `interpolate()` over an explicit frame range, and clamp it:

```tsx
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

const frame = useCurrentFrame();
const { fps } = useVideoConfig();
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

<div style={{
  opacity: interpolate(frame, [0, 0.4 * fps], [0, 1], clamp),
  translate: interpolate(frame, [0, 0.5 * fps], ["0px 80px", "0px 0px"], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) }),
  scale: interpolate(frame, [0, 0.5 * fps], [1.4, 1], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) }),
}} />
```

- Use the CSS properties `translate`, `scale` and `rotate` instead of a `transform` string where possible.
- Easing: `Easing.bezier(0.16, 1, 0.3, 1)` for arrivals (fast start, long soft landing), `Easing.bezier(0.7, 0, 0.84, 0)` for exits (slow start, leaves fast), `Easing.spring({ damping: 200 })` for a push with no bounce.
- Stagger: give item `i` the range `[i * 4, i * 4 + 12]` frames.
- Randomness: `random("seed-" + i)` from `remotion` returns the same number every render. Never `Math.random()`.
- Never use CSS `transition`, `animation`, keyframes or Tailwind animation classes. They do not render.

## Scenes

Use `TransitionSeries` for scenes in a row:

```tsx
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";

<TransitionSeries>
  <TransitionSeries.Sequence name="Hook" durationInFrames={120}><Hook /></TransitionSeries.Sequence>
  <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={linearTiming({ durationInFrames: 15 })} />
  <TransitionSeries.Sequence name="Proof" durationInFrames={150}><Proof /></TransitionSeries.Sequence>
</TransitionSeries>
```

- **Length math:** total = sum of `Sequence` durations minus `Transition` durations. `Overlay`s add nothing. Keep `Root.tsx` equal to it.
- Presentations: `fade()`, `slide({ direction })`, `wipe({ direction })`, `flip()`, `clockWipe({ width, height })`, each from `@remotion/transitions/<name>` (`clock-wipe` for clockWipe). Directions: `from-left`, `from-right`, `from-top`, `from-bottom`.
- An effect over a cut without shortening the film: `<TransitionSeries.Overlay durationInFrames={30}>`, see the light leak in the template.
- For layers with their own start time inside a scene, use `<Sequence from={30} durationInFrames={60}>`. Its children see frame 0 at its start.
- For your own transition, pass `presentation={{ component: MyPresentation, props: {} }}`; the component receives `presentationProgress` (0 to 1) and `presentationDirection` (`"entering"` or `"exiting"`).

## Layout and text

- Each scene is an `<AbsoluteFill>` (full frame, flex column). Center with `alignItems` and `justifyContent`.
- Fonts: `const { fontFamily } = loadFont("normal", { weights: ["400", "800"], subsets: ["latin", "latin-ext"] })` from `@remotion/google-fonts/<Font>`. Keep `latin-ext` for Turkish letters.
- Minimum sizes at 1920 wide: headline 84 px, supporting text 44 px. Keep text 80 px from the sides and 100 px from the top and bottom.
- Measure text that must fit a box with `fitText` or `measureText` from `@remotion/layout-utils`.

## Media

```tsx
import { Audio, Video } from "@remotion/media";
import { Img, staticFile } from "remotion";

<Audio src={staticFile("voice.mp3")} />                     // narration, plays from frame 0
<Audio src={staticFile("music.mp3")} volume={0.15} />      // music under the voice
<Img src={staticFile("photo.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
<Video src={staticFile("clip.mp4")} trimBefore={2 * fps} muted />
```

- Delay a sound with `from={frames}` on `<Audio>`. Trim with `trimBefore` and `durationInFrames`.
- Remote URLs work too, but local files in `public/` are safer on GitHub.

## Effects

`@remotion/effects` gives WebGL effects on canvas-based components. Put them on `<Solid>`, `<Img>`, `<CanvasImage>`, `<Video>`, or wrap normal HTML in `<HtmlInCanvas>`:

```tsx
import { lightLeak } from "@remotion/effects/light-leak";
<Solid width={width} height={height} effects={[lightLeak({ hueShift: 200, progress: interpolate(frame, [0, durationInFrames - 1], [0, 1], clamp) })]} />
```

Available families: color (brightness, contrast, saturation, duotone, tint, LUT), blur (blur, zoomBlur, progressive blur), light (glow, lightLeak, shine, vignette, dropShadow), distortion (chromaticAberration, wave, fisheye), texture (noise, halftone, scanlines, paper, dotGrid), pixel (pixelate, pixelDissolve).
Import each from `@remotion/effects/<kebab-case-name>`. Effects never animate on their own: drive `progress` or other values from the frame.

**Effects draw only inside the element's own box.** A glow or blur on a small element is cut off at its edges and shows as a grey rectangle.
Give the element enough padding for the effect, or apply the effect to a full-frame `<Solid>` or `<HtmlInCanvas>` layer. This happened in a real test.
For exact options, read `remotion-markup/effects.md` in Remotion's skills (see SKILL.md, "Deeper topics").

## 3D

Wrap Three.js content in `<ThreeCanvas width={width} height={height}>` from `@remotion/three` and add lights. Drive every rotation and position from `useCurrentFrame()`; never use `useFrame` or a free-running clock.

## Common errors

| Error or symptom | Fix |
|---|---|
| `Failed to acquire WebGL2 context` | `remotion.config.ts` must have `Config.setChromiumOpenGlRenderer("swangle")`. |
| Version mismatch warning | Make every `remotion` and `@remotion/*` version exactly `4.0.538`. |
| Video ends early or has black at the end | `durationInFrames` in `Root.tsx` does not match the scene math. |
| Animation jumps at a scene start | You used the global frame. Inside a Sequence the frame starts at 0. |
| Element flickers | Something animates without `useCurrentFrame()`: CSS animation, `useFrame`, `Date.now()`. |
| Font falls back to a system font | Call `loadFont()` at module level, outside the component. |
