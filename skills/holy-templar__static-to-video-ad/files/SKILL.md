---
name: static-to-video-ad-complete
description: v1.0 — Unified two-path skill that turns ANY static ad into video on the MaxFusion AI MCP, opening with a gate that asks which treatment the user wants. PATH A — ANIMATE THE STATIC AD: a real human hand enters frame and physically organizes the ad's elements one by one in photorealistic live-action (real physics, natural shadows, smooth human motion — never stop-motion) over 0-4s, non-text elements only; then every text block animates in cleanly at the end and the finished ad holds — 6 seconds, Google Omni locked. PATH B — MAKE A VIDEO AD: the static becomes the ENDING of a live-action clip — footage shows the events that happened BEFORE the static image, converges on its composition, FREEZES at the instant the photo was "taken", and the logo/headline land last so the literal final frames are the user's original file — ~10 seconds, Seedance 2.5 locked, frames mode with both frames pinned. Both paths: fresh named MaxFusion project per run, direct MCP tools, no canvas, all delivery in chat. Use for "static to video ad complete", "static to video complete", "static to video", "animate this static ad", "make my static a video", "hand builds the ad", "freeze frame ad", or any static ad dropped wanting a video treatment. Requires the MaxFusion AI MCP and ffmpeg.
---

# Static to Video Ad Complete

**v1.0.** One skill, two treatments for turning a static ad into video, both generated on the MaxFusion AI MCP and both delivered back in chat. Which treatment runs is decided by the user at GATE 0 — always asked, never assumed.

- **PATH A — ANIMATE THE STATIC AD.** A 6-second photorealistic clip in which a real human hand enters the frame and physically builds the ad on camera — placing the product, arranging the imagery, laying the panels — and once the visual scene is fully built, the text blocks animate in on their own and the finished ad holds.
- **PATH B — MAKE A VIDEO AD.** A ~10-second live-action clip in which the user's static is the FINAL SCENE: the video shows the events that led up to the exact instant the photo was "taken", the frame freezes on the photo's composition, and the graphics (logo, headline) appear last over the frozen frame — the literal final frames are the user's original file, pixel for pixel.

No narration, no speech by default, no music — ever, on either path.

## GATE 0 — Which treatment? (always the first stop)

Before any analysis, any upload, any generation: ask the user which of the two they want. Present both options exactly like this:

1. **Do you want to animate the static ad?** A real human hand enters the frame and physically builds your ad's elements one by one on camera, with the text animating in last.
2. **Do you want to make a video ad?** The video shows the events that happened before your static image — the static is the final scene: live footage leads up to the moment the photo was taken, freezes on it, and the graphics land last.

You may add a one-line recommendation based on the image (a designed layout — flat background, product shots, text panels — suits PATH A; a real photographed moment — people, motion, location — suits PATH B), but the user's answer decides. Their pick routes the run into that path's pipeline below. If mid-run it becomes clear the other treatment fits better, say so and return to GATE 0 — never silently switch.

## Runtime requirements (both paths)

- **MaxFusion AI MCP** connected and authenticated (`https://mcp.maxfusion.ai/mcp`). All image and video generation runs through it. If it is not connected, stop and walk the user through connecting before doing anything else.
- **ffmpeg + ffprobe** for frame preparation, local compositing, and QA. This is a chat-stack skill: direct MCP tools only, **no canvas, ever**.
- The source static is a **local file the user provides** (they paste the image in chat AND point to the file, or name a folder to find it in). No browser, no HTTP crawling — not part of this skill.
- Working directory for intermediates only: `runs/static-to-video-ad-complete/<YYYY-MM-DD>-<title>/` with `frames/` and `runs/run-vNN/` subfolders. This folder holds frame preps, QA sheets, and local composites — it is plumbing, not a delivery point. **All delivery happens in chat** (see Delivery).

## Per-run setup (standing rules, both paths)

- **Fresh, meaningfully named MaxFusion project per run** via `maxfusion_create_project` (e.g. "Hand Build — Acme Protein Bar" / "Hold That — adidas Hyperboost"). Never the default API project, never a shared multi-run project. Every generation in the run carries this project's `project_group_id`.
- Upload every reference image via `maxfusion_upload_asset` (`purpose: "image_reference"`, correct `content_type`, exact `size_bytes`, `filename`) — it returns an upload session; POST a multipart form via curl to `upload.url` with every key/value from `upload.fields` exactly as given, plus the file bytes as the final part named `file`. Any 2xx = success. Record every `file_id` / image id / job id in the run's `qa.md`.
- No cost/credit talk in chat, ever. The path's approval gate IS the spend authorization for the run.
- Defects: report and wait. **Never auto-regenerate a paid generation.**
- **Show every generated image in chat** (`maxfusion_display_generation`) as it completes — the user watches the assets appear; no approval stop on them unless the path defines one or the user objects.

## Live capability checks (never assume, both paths)

Before any generation, verify live — constraints are read from the live catalog, never from memory:

- `maxfusion_list_video_models` — confirm the path's locked model is available and read its supported **durations**, **aspect ratios**, **resolutions**, and reference modes from the catalog.
  - **PATH A: `gemini-omni-flash` is LOCKED.** No other video model is ever used or offered.
  - **PATH B: `seedance-2.5` is LOCKED.** No other video model is ever used or offered. Confirm `frames` mode is present. **API law (learned live):** Seedance 2.5 frames mode **rejects an end frame without a start frame** (`VALIDATION_REFERENCE_COMBINATION`) — both frames are always pinned, which is why the start frame is a first-class asset in PATH B, never optional.
- `maxfusion_list_image_models` — confirm the image model (`gpt-image-2` default) supports the source's aspect ratio and reference images before any still is generated.

---

# PATH A — ANIMATE THE STATIC AD (the hand builds it)

Turn a static ad into a 6-second clip where a real human hand enters the frame and physically organizes the ad's elements one by one — exactly like real footage of someone assembling the ad on a surface. Once the visual scene is fully built, the text blocks animate in on their own and the finished ad holds.

**The realism is the whole point.** The output must read as REAL FOOTAGE — a physical hand with natural skin, correct anatomy, real contact shadows, and smooth human motion, handling elements that behave like physical objects. If a result looks stop-motion, stepped, choppy, or like motion-graphics tweens where objects fly in by themselves during the assembly, it has failed regardless of everything else being right. Every prompt, QA check, and repair in this path bends toward protecting that realism.

**The two-act structure:**

- **ACT 1 — THE HAND ORGANIZES THE VISUALS (0-4s).** Every NON-TEXT element (product, imagery, garnish, bars, panels) is carried in and placed by the hand, one beat at a time. Elements never move by themselves in Act 1. No text is on screen during Act 1.
- **ACT 2 — TEXT ANIMATES IN LAST (~4-5s).** Only after every visual element has been placed and the hand has exited frame, the text blocks animate in cleanly — stamping, sliding, or fading into place as rigid pre-rendered blocks. The hand does NOT place the text; text entry is the one part of the clip allowed to be non-physical animation. Then everything holds to 6s.

The output stays 100% loyal to the source ad's own visual style.

## Duration and aspect handling

Target is **6 seconds**. If the live catalog shows 6s is supported, use `duration: 6`. If the catalog only allows longer durations (e.g. 10s), generate at the minimum allowed duration with the same assembly / text / hold structure stretched proportionally, and trim to exactly 6 seconds locally (re-encode: `ffmpeg -y -i in.mp4 -t 6 -c:v libx264 -c:a aac out.mp4`). Tell the user this happened.

Detect the source ad's aspect ratio (common statics: 4:5, 1:1, 9:16). Match it if the live catalog supports it. If not supported, tell the user which ratios ARE supported and ask which to use — then recompose the GATE A2 still to that ratio (never letterbox, never stretch).

## The hand (standing default)

Neutral adult hand, clean and well-kept, no jewelry, no watch, no nail polish, sleeve cropped out of frame or a plain neutral sleeve — lit to match the ad's lighting exactly, casting real contact shadows on the surface. One hand by default; a second hand may assist only for large elements. The user can override any of this per run (e.g. manicured hand, brand-colored sleeve) — apply overrides without debate.

## The two input modes

Detect the mode at intake; confirm it in the GATE A1 brief.

**MODE A — COMPETITOR SWAP.** The user drops a competitor's static ad. We keep the ad's **format skeleton and visual style** (layout logic, composition, hierarchy, typography feel, energy) and **fully replace the brand**: the competitor's product, logo, colors, and messaging are swapped for the user's. Nothing of the competitor's brand identity survives into the output.

**MODE B — OWN AD.** The user drops their own finished static. Style is already theirs. No swap — extract layers and animate as-is.

## Brand guidelines intake (MODE A only — first-class input)

Before GATE A1, collect from the user:

- **Product image(s)** — the actual product shots to composite in (uploaded files)
- **Brand colors** — hex values or "pull from my product/logo"
- **Messaging** — the replacement headline, claims, offer, CTA text (exact copy; never invent claims)
- **Logo** (optional)
- **Type feel** (optional) — if the user wants their brand font energy instead of the competitor's

If the user drops a competitor ad with no brand package, ask for these before proposing anything. Missing pieces block GATE A1. In MODE B, skip this entirely.

## GATE A1 — Extraction brief

No generation calls of any kind before this gate is approved.

Analyze the source ad and deliver a brief:

```text
MODE: [A — competitor swap / B — own ad]
FORMAT: [static format name — e.g. Before/After, Us vs Them, Benefit Stack, Testimonial, Offer Stack, Discount Banner, Meme, Cart Screenshot...]

LAYER INVENTORY (each layer = one animation element):
  1. Background — [description] — background hex: #XXXXXX
  2. [Product shot — description]
  3. [Headline block — text content — solid rigid block]
  4. [Badge / sticker — description]
  5. [Proof element — description]
  ... (4-8 layers total; merge tiny elements into their parent layer — too many pieces makes the assembly unstable and gives the hand too many trips)

ASSEMBLY ORDER (0-4s, hand-placed): [non-text layer entry order, one beat each — background is already present, it IS the first frame.
  TWO-ACT LAW: Act 1 = the hand places every NON-TEXT layer (product, imagery, garnish, bars, panels).
  Act 2 = every TEXT block ANIMATES in on its own, only after all of Act 1 has landed and the hand has exited. Text never precedes visuals; the hand never places text.]

HAND PLAN: [default neutral hand, or the user's override — plus which elements need a second assisting hand, if any]

STYLE LOYALTY NOTES: [the visual DNA being preserved — rendering style, lighting, typography energy, composition logic]

BRAND SWAP PLAN (MODE A only): [what gets replaced with what — product, colors, each text element old → new]

TARGET ASPECT RATIO: [matched to source, pending live catalog check]
```

Then **stop** and wait for approval or revision notes. Iterate until approved.

Rules:

- The **background hex** is critical — it becomes the ffmpeg first frame AND must be written into the GATE A2 image prompt verbatim. One hex, flat, exact.
- If the source background is a gradient, photo, or texture (not flat), flag it in the brief and plan the background as **layer 0 that is already fully present in frame 1** — i.e. the first frame is the empty background itself (extracted or generated separately), not a flat color. Note this changes the frame-prep step below.
- Text layers are always inventoried as **solid rigid blocks** with their exact copy written out.

## GATE A2 — The still

Only after GATE A1 approval. Generate the final composed static — the exact last frame of the video.

- Model: default image model from the live catalog, `quality: "high"`, aspect ratio per the brief, `project_group_id` = this run's project.
- Attach references via `ref_image_file_ids` with `ref_image_mode: "ingredients"`:
  - MODE A: the competitor ad (style/layout reference) + the user's product image(s) + logo. The prompt must instruct: recreate the layout, composition, and visual style of the reference ad, but replace the product with the attached product photo **kept photographically identical — never redrawn, never stylized**, replace all brand colors with [user hexes], and replace all text with the exact new copy.
  - MODE B: the user's own ad as the primary reference — reproduce it faithfully at generation resolution.
- The prompt must state the background as one flat field of the exact hex (or the defined layer-0 background), state every text block verbatim with instruction to render it as clean, correctly-spelled type, and end with: no watermark, no extra UI, no added elements beyond the layer inventory. **No hand appears in the still** — the still is the finished ad only.

Poll with `maxfusion_get_job` (`wait: 60`). Download the result to `<item>/frames/last-frame-original.png`. Record image job id + image id.

**Still QA before showing the user:**

- Every text block spelled correctly, matching the approved copy exactly — a single wrong letter = regenerate before presenting
- Product is the user's actual product (MODE A), photographically faithful
- Background is the flat hex / defined layer 0
- Layer count matches the inventory — no invented elements
- No competitor brand residue anywhere (MODE A)

Display via `maxfusion_display_generation` and **stop** for approval. On revisions, regenerate only what's rejected; never reuse a rejected still downstream.

## PATH A VIDEO — straight after still approval

Once the still is approved, generate immediately. There is no audio question — audio is permanently locked to **SFX only, no music, no voice, no narration**. Never ask the user about music.

### 1. Frame prep (the sandwich)

Normalize the approved still to the target resolution:

```bash
ffmpeg -y -i <item>/frames/last-frame-original.png \
  -vf "scale=<W>:<H>:force_original_aspect_ratio=increase,crop=<W>:<H>" \
  <item>/frames/last-frame.png
```

First frame — default (flat hex background):

```bash
ffmpeg -y -f lavfi -i color=c=0x<HEX>:s=<W>x<H> -frames:v 1 <item>/frames/first-frame.png
```

First frame — non-flat background (per GATE A1 flag): the empty background alone, no elements. Extract it by generating a background-only still at GATE A2 time (same prompt minus all layers) or by inpaint-free crop if the source ad has clean empty regions — whichever the brief specified.

Upload both frames (upload flow above) and record both `file_id`s.

### 2. The animation prompt

Reference order carries the roles: **first-frame file_id FIRST, last-frame file_id SECOND** — matching "Image 1" / "Image 2" in the prompt.

Template:

```text
PHOTOREALISTIC LIVE-ACTION footage, shot on a locked-off camera looking straight at the ad surface. Image 1 is the exact empty first frame; Image 2 is the exact completed final composition. One continuous shot, real-world physics throughout.

THE REALISM RULE, above all others: a real human hand — [hand plan: neutral adult hand, clean, no jewelry, sleeve out of frame], lit exactly like the scene, casting natural contact shadows — enters the frame and physically places each visual element, one at a time. Every element in Act 1 is carried in, set down, and adjusted BY THE HAND, exactly like real footage of a person assembling a layout on a table. Smooth natural human motion only. NO stop-motion, NO stepped or choppy cadence, NO elements sliding or flying in on their own during the assembly, NO CGI weightlessness. Elements behave like physical printed pieces and objects: they have weight, they land with a tiny natural settle, their shadows move correctly under the hand.

0.0s-4.0s — ACT 1, THE HAND ORGANIZES THE VISUALS: open on the empty background from Image 1. The hand enters and places the non-text elements one beat at a time: [non-text layer beats, exactly as approved — e.g. the hand sets the product down at center-right and nudges it square → the hand lays the garnish beside it → the hand places the panel and smooths it flat]. The hand fully exits frame after the last placement. No text of any kind is on screen during Act 1.

4.0s-5.0s — ACT 2, TEXT ANIMATES IN: with the hand gone, the text blocks animate in one per beat: [text layer beats, exactly as approved]. Each text block is one solid rigid pre-rendered block, already fully typeset exactly as in Image 2 — it stamps, slides, or fades into its exact position and never redraws, retypes, morphs, or animates letter by letter. No hand touches the text.

5.0s-6.0s — HOLD: the completed composition from Image 2 holds perfectly still. Nothing enters, exits, or drifts.

The visual style is exactly the style of Image 2 — preserve its rendering, lighting, colors, and typography precisely. Locked camera, no cuts, no zoom, no new objects, no style change. The hand appears ONLY during Act 1 and is fully out of frame by the end.

AUDIO: [see audio block]. No voices, no narration, no speech of any kind.
```

Audio block (locked — the only audio mode, always):

```text
AUDIO: Silent video only with SFX and no music. Real, quiet, tactile sound effects synced to the hand's actions — soft surface slides, gentle taps and paper-on-surface placement sounds as each piece lands, a faint fabric brush as the hand moves — then subtle clean stamps for the text entries, then near-silence during the hold. No music, no melody, no soundtrack.
```

### 3. Submit

```text
video_model: gemini-omni-flash        (locked — never another model, never offered)
ref_image_file_ids: [<first-frame file_id>, <last-frame file_id>]
prompt: <animation prompt>
duration: 6                            (or minimum allowed per live catalog, then trim)
aspect_ratio: <per brief / catalog>
resolution: 720p
project_group_id: <this run's project>
```

Poll `maxfusion_get_job` (`wait: 60`) until terminal. Download to `<item>/runs/run-v01/final-6s.mp4` for QA. On failure, apply the repair playbook and re-run on gemini-omni-flash — never switch models.

**Do NOT strip the audio track.** The SFX lives in it. Deliver with audio.

## PATH A video QA

Judge the progression, not just the ending.

```bash
# 12-frame contact sheet (2 fps over 6s)
ffmpeg -y -i final-6s.mp4 -vf "fps=2,scale=270:-2,tile=6x2" -frames:v 1 contact-sheet.jpg
# actual first frame
ffmpeg -y -i final-6s.mp4 -vf "select=eq(n\,0)" -frames:v 1 video-first-frame.jpg
# last frame for comparison
ffmpeg -y -sseof -0.1 -i final-6s.mp4 -frames:v 1 video-last-frame.jpg
# verify: duration ~6s, video stream, audio stream PRESENT
ffprobe -v error -show_entries format=duration -show_entries stream=codec_type -of default=nw=1 final-6s.mp4
```

Pass criteria:

- Frame 1 is (near-)pure empty background; slight element edges peeking at borders acceptable
- **Realism (the #1 check):** the hand looks real — correct anatomy (five fingers, natural proportions), natural skin, matched lighting, contact shadows that track the hand. A morphing, melting, extra-fingered, or badly-lit hand is a FAIL even if everything else passes
- **Hand agency:** in Act 1, every visual element enters IN the hand or visibly moved by it. Elements popping in, fading in, or sliding in on their own before ~4s is a FAIL. Stop-motion stepped cadence anywhere is a FAIL
- **Hand exit:** the hand is fully out of frame before the first text block appears and never returns
- **Text-last ordering:** in the contact sheet, no text block may be visible in any frame where a non-text element has yet to be placed. Text appearing before or alongside the first visual placements is a FAIL
- **Text integrity:** sample the frames where each text block is on screen — text must match the approved copy in every sampled frame; warped, retyped, or re-rendered text is a FAIL
- **End frame:** at ~5s+ the composition matches Image 2 — all elements in position, hand gone. Missing/extra/relocated elements = FAIL
- Style loyalty: no drift into a different rendering style, no 3D-ification
- Audio stream present; no voice/speech audible; no music audible — SFX only
- Correct aspect ratio, 720p, ~6.0s

Build `end-frame-comparison.jpg` (approved still beside video last frame) for the user. Write verdicts to `<run>/qa.md`.

## PATH A repair playbook

- **Elements enter without the hand (the most common expected failure):** move the REALISM RULE paragraph to the very top of the prompt, restate each Act 1 beat as "the hand carries in X, sets it down at [position], and releases it", add "no element may appear or move unless the hand is touching it", re-run.
- **Hand anatomy broken (morphing, extra fingers, floating):** strengthen the hand description — "one ordinary adult human hand with exactly five fingers, photorealistic skin, natural motion" — reduce the number of separate placements (merge small layers so the hand makes fewer trips), re-run.
- **Stop-motion / stepped cadence creeps in:** add "smooth continuous real-time motion, natural human speed, no frame-stepping, no choppy cadence" to the REALISM RULE, strip any wording the model could read as "stop-motion" or "assembles itself", re-run.
- **Hand touches or places text:** restate Act 2 harder — "the hand is fully out of frame before any text appears; text blocks animate in on their own" — and name the exact beat where the hand exits, re-run.
- **Text mangled in motion:** re-state the rigid-block clause harder ("each text block is one pre-rendered block that never changes"), name each block's exact copy in the prompt, re-run. If text is wrong in the STILL, that's a GATE A2 problem — regenerate the still, re-confirm, then redo video.
- **End-frame drift:** strengthen "Image 2 is the exact completed final composition" + "the completed composition holds perfectly still", re-run.
- **Music present:** re-run with the audio block moved to the top of the prompt and repeated at the end.
- **Voice/speech appears:** re-run with "no voices, no narration, no speech, no humming, no vocalizations" appended to the audio block.
- **One job fails:** re-run only that job. Never re-run passing items. Never switch models.

All re-runs go through the defect rule: report the defect, wait for the user's go. Never auto-regenerate.

---

# PATH B — MAKE A VIDEO AD (the events before the static)

The user's static becomes the ENDING of a short live-action clip. The video is the scene that leads up to the exact instant the photo was "taken": live footage plays, converges on the photo's composition, the frame FREEZES, and the graphics (logo, headline) appear LAST over the frozen frame. The literal final frames are the user's original file, pixel for pixel.

Aspect ratio: **match the source image exactly** (Seedance 2.5's coverage — 1:1, 9:16, 16:9, 21:9, 4:3, 3:4 — makes this possible; no outpaint/crop workarounds). Resolution 720p. Duration default **8 seconds** (freeze ≈ 6.5s, frozen hold to 8s), then +2s local extension → ~10s final.

## GATE B — Analyze + three scenarios (this path's only approval stop)

No generation of any kind before this gate clears.

1. **Read the actual image file** and analyze it in chat:
   - Photographic style, precisely (e.g. "90s point-and-shoot, harsh on-camera flash, washed highlights, film grain" vs "warm cinematic, shallow DOF"). This style will be enforced on every generated asset — start frame, video, everything.
   - Subject(s), wardrobe piece by piece, location elements.
   - **Motion state:** is the moment mid-motion (mid-stride, mid-laugh, mid-gesture) or still? This decides the freeze rule below.
   - **The load-bearing detail:** the element that explains the freeze — a blurred hand in front of the lens, an object being shown, a foot mid-push-off. The best scenario is built around it.
2. **Propose THREE scenario concepts** for the lead-up video, each one paragraph: what happens, where the camera starts, how it reaches the photo's composition, what triggers the freeze. Anchor at least one scenario in the load-bearing detail. Recommend one.
3. **Stop.** The user picks a scenario (or supplies their own — theirs always wins). Their pick is the full-run approval; everything after runs straight through.

## PATH B asset build (after the pick)

### 1. Clean end frame

GPT Image 2, `quality: "high"`, source aspect ratio, reference = the uploaded source, `project_group_id` = this run's project. Prompt: reproduce the photograph EXACTLY, pixel-faithful — same framing, subject, colors, lighting, grain — with the ONLY change being the complete REMOVAL of every brand graphic (logo, headline, text overlays), the background continuing naturally where they were.

- **KEEP every photographic element, including the odd ones.** A blurred hand mid-frame, a held object, a lens flare — that is content, not a graphic. Name it in the prompt as something to keep.
- List every removal explicitly ("remove (1) the headline text, (2) the trefoil logo") and every keep-element explicitly.
- End with: no text, no logo, no watermark anywhere; photorealistic, indistinguishable from the original apart from the removals.
- Download, QA visually (removals clean, nothing else changed), display in chat.

### 2. Start frame

GPT Image 2, `quality: "high"`, same aspect ratio, reference = the **clean end frame** (never the original — graphics could leak back in), `project_group_id` = this run's project. It depicts the chosen scenario's opening moment:

- The same scene "a few seconds earlier / from farther away," per the scenario — full person(s) visible when the scenario is an action approach (a legs-only opening reads as boring; wide-with-person is the standard).
- Wardrobe restated piece by piece. **Only describe what the crop actually shows; flag guesses.** When the source doesn't show something (e.g. only a black garment edge is visible), say so in chat and make the best call visibly.
- Style block: "another frame from the same roll of film / same shoot, seconds earlier" + the exact style language from the analysis (flash, grain, tilt / cinematic DOF).
- Exclude scenario elements that only appear at the freeze (e.g. the foreground hand) — they arrive in the video.
- No graphics, no text, no watermark. Download, QA, display in chat.

### 3. The video — Seedance 2.5, frames mode

```text
video_model: seedance-2.5            (locked)
start_frame_file_id: <start frame image id>
end_frame_file_id:   <clean end frame image id>
ref_image_mode: frames
duration: 8
aspect_ratio: <matched to source>
resolution: 720p
project_group_id: <this run's project>
```

Prompt skeleton (adapt per scenario, keep every hard rule):

```text
RAW HANDHELD / CINEMATIC LIVE-ACTION footage, photorealistic, one continuous unbroken
take, [exact style language from the analysis — vintage camcorder grain / warm cinematic
DOF / candid phone energy]. The FIRST frame of the video is exactly the start image
[describe]. The LAST frame of the video is exactly the end image [describe]. The shot
must travel from one to the other in a single continuous move.

The items, the colors, every element looks exactly as the images — same person, same
outfit, same location, same light.

THE SCENE: [scene + subject(s), wardrobe restated].

0.0s-Xs — [ACT 1, the approach/action]: [camera person walks/runs/approaches; subjects
do what the scenario says; handheld bob/shake as fits the style; subjects never look at
the camera unless the scenario says so].

Xs-6.5s — [ACT 2, converging]: [the camera closes into the exact composition of the end
image while the action continues; the moment that triggers the freeze builds].

6.5s-8.0s — THE FREEZE: at [the trigger — peak of the stride / peak of the laugh / the
flash], the frame FREEZES exactly on the end image composition and holds perfectly
still, matching it EXACTLY — same angle, same crop, same light, same colors. No motion
at all.

No text, no logo, no graphics anywhere in the video — the frame stays purely
photographic.

AUDIO: [natural SFX for the scene — footsteps, fabric, ambience, indistinct chatter] —
then ONE crisp photo-camera shutter click-snap synced exactly to the freeze (a clean
mechanical camera shutter sound, NOT a thump, NOT a boom, NOT an impact), then
near-silence with faint ambience on the frozen frame. No music. [Speech rule below.]
```

**Hard rules (each one is a paid lesson — never drop them):**

- **Mid-motion law.** If the photo is mid-motion, the subject NEVER stops, slows, settles, or poses — the freeze is snatched out of full motion. Write "never slows down / never posing" into every act. A subject who "settles into the pose" is a rejected result: the moment is captured in the middle of motion.
- **Speech law.** A spoken line exists ONLY if it is an explicit audio event: the quoted words placed in the timeline AND in the AUDIO block ("the camera person's voice says out loud: '…'"). Flavor text like *pointing as if to say "that's it"* gets muted by a no-speech audio block — the model obeys the ban. Default audio is no speech, or indistinct unintelligible chatter for candid scenes. If the scenario includes a line, name the only speaker and state "the ONLY spoken words in the whole video are …".
- **Shutter law.** The freeze sound is one crisp camera shutter click. The words "NOT a thump, NOT a boom, NOT an impact" appear verbatim. No music, ever. No narration, ever.
- **Exactness line** ("The items, the colors, every element looks exactly as the images…") rides in every video prompt — standard, never dropped.
- The pinned frames outrank the prose: if the text description of the scene geometry is wrong, the frames win — but describe the geometry correctly anyway (verify what surfaces/walls actually are before writing; an ad's "floor" may be a wall the foot is propped on).

Poll `maxfusion_get_job` (`wait: 60`). On a stuck job (~25+ min running), a re-run with identical inputs is legitimate — tell the user; the first job may still land later and both results are theirs.

### 4. Post — graphics land last, hold extends (ffmpeg, local, free)

```bash
# graphics-last crossfade: the ORIGINAL image (with graphics) fades in over the frozen tail
ffmpeg -y -i gen-8s.mp4 -loop 1 -i source-ad.jpg -filter_complex \
  "[1:v]scale=<W>:<H>,format=yuva420p,fade=t=in:st=7.0:d=0.6:alpha=1[img];[0:v][img]overlay=0:0[v]" \
  -map "[v]" -map 0:a -c:v libx264 -crf 18 -c:a aac -t 8 composite-8s.mp4

# extended hold: +2 seconds on the final frame (standing rule)
ffmpeg -y -i composite-8s.mp4 -vf "tpad=stop_mode=clone:stop_duration=2" \
  -af "apad=pad_dur=2" -c:v libx264 -crf 18 -c:a aac final-10s.mp4
```

`<W>:<H>` = the video's actual rendered dimensions (probe them — 720p renders as 960×960 at 1:1, 716×1284 at 9:16; scale the image to match). The crossfade guarantees: graphics appear last, and the final frames are the user's original file exactly — even if the generated freeze drifted slightly, the fade bridges it.

## PATH B video QA

```bash
ffmpeg -y -i final.mp4 -vf "fps=1.5,scale=203:-2,tile=6x2" -frames:v 1 contact-sheet.jpg
ffmpeg -y -sseof -0.1 -i final.mp4 -frames:v 1 final-last-frame.jpg
ffprobe -v error -show_entries format=duration -show_entries stream=codec_type -of default=nw=1 final.mp4
```

Pass criteria:

- Opening matches the start frame; the story beats of the approved scenario all read in the contact sheet
- Style loyalty through motion (grain/flash/DOF never turns modern-digital)
- Mid-motion law held: no posing, no settling before the freeze (when applicable)
- Freeze lands on (or near — the crossfade bridges) the end composition; **final frame = the original ad exactly**, graphics present
- No text/graphics visible before the crossfade point
- Duration, aspect, video + audio streams correct
- Known accepted trait: a faint scan-line shimmer sometimes appears on frozen frames — reads as period texture, not a defect
- **Audio content cannot be verified visually** — say so plainly and ask the user to confirm by ear (speech present/absent as designed, shutter not a thump). If wrong: report, propose the one-line fix, re-roll only on their go.

Write verdicts + all IDs (project, uploads, image jobs/ids, video job/id, post steps) to `<run>/qa.md`.

---

## Delivery (both paths — in chat, always)

- **Everything is delivered in chat. Nothing is delivered as a file drop elsewhere on the computer.** The run folder is intermediates and audit trail only.
- MCP-generated media (stills, PATH A final video, PATH B raw generation) via `maxfusion_display_generation` — one widget call per asset. Never paste raw asset URLs in chat.
- Locally composited media (PATH B final composite) sent directly in chat as a file.
- QA sheets (contact sheet, end-frame comparison) via file presentation in chat so the user can eyeball the progression.
- One line per run: PATH A — which format was extracted and what was swapped (MODE A); PATH B — scenario used, freeze trigger, known blemishes.
- Report all ids (project, image job/id, frame file_ids, video job/id) so any item can be referenced or re-run individually.
- On revisions: superseded cuts stay in the run folder; the newest delivered version in chat is the canonical one.

## When NOT to use this skill

- The user wants a stop-motion assembly look (visible stepped cadence) → this skill never produces stop-motion; say so.
- The user wants a video ad with narration, a presenter, or multiple scripted scenes → out of scope for this skill.
- The user wants a designed static only, no animation → just make the static; this flow isn't needed.
- The user wants per-layer editable transparent assets or a timeline → this skill does not deliver separated layers.
- The user wants the photo animated in place (a cinemagraph) rather than a lead-up story → not this; say so and ask what they'd like.
- The user asks to clone a competitor ad **keeping the competitor's brand** → refuse the clone; this skill only produces the user's own brand on top of a format skeleton.
