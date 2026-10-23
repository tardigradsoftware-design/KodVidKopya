```
   _____                   _____            .__
  /     \ _____  ___  ____/ ____\_ __  _____|__| ____   ____
 /  \ /  \\__  \ \  \/  /\   __\  |  \/  ___/  |/  _ \ /    \
/    Y    \/ __ \_>    <  |  | |  |  /\___ \|  (  <_> )   |  \
\____|__  (____  /__/\_ \ |__| |____//____  >__|\____/|___|  /
        \/     \/      \/                 \/               \/
```

# Static to Video Ad

A [Claude](https://claude.com) skill that turns any static ad into a finished video ad through the [MaxFusion](https://maxfusion.ai) MCP — entirely from chat. You drop the static; the skill opens with one question — which treatment do you want? — then runs the whole pipeline: analysis, approval gates, generation, QA, and delivery back in chat.

## The two paths

The skill always opens with the same gate, and your answer decides everything after it:

1. **Animate the static ad** — a real human hand enters the frame and physically builds your ad's elements one by one on camera, in photorealistic live-action, with the text animating in last. 6 seconds.
2. **Make a video ad** — the video shows the events that happened *before* your static image; the static is the final scene. Live footage leads up to the moment the photo was taken, freezes on it, and the graphics land last — the literal final frames are your original file, pixel for pixel. ~10 seconds.

## Examples

### Path A — a hand builds the ad

| Static | Skill Output |
| --- | --- |
| ![RYZE static](examples/ryze-static.png) | ![RYZE output](examples/ryze-preview.gif) |
| ![Grüns static](examples/gruns-static.png) | ![Grüns output](examples/gruns-preview.gif) |

### Path B — the events before the photo

| Static | Skill Output |
| --- | --- |
| ![Hyperboost static](examples/hyperboost-static.jpg) | ![Hyperboost output](examples/hyperboost-preview.gif) |
| ![Teens static](examples/teens-static.jpg) | [![Teens output — click to play](examples/teens-poster.jpg)](examples/teens-video.mp4)<br>*▶ click to play — this one exceeds GitHub's GIF size limit* |

Full-quality MP4s of every example are in [`examples/`](examples/).

## What the skill enforces

- **The opening gate, always asked** — the skill never assumes which treatment you want. It may recommend one based on your image (designed layouts suit the hand; real photographed moments suit the lead-up), but your answer decides.
- **Path A: the realism rule** — the output must read as real footage: a physical hand with correct anatomy and real contact shadows placing elements that behave like physical objects. Anything stop-motion, stepped, or self-assembling is a failure by definition.
- **Path A: the two-act law** — the hand places every non-text element first (0–4s); every text block animates in on its own as a rigid pre-rendered block only after the hand has exited; then the finished ad holds.
- **Path B: the freeze laws** — mid-motion subjects never slow down or pose (the freeze is snatched out of full motion); the freeze sound is one crisp camera shutter click, never a thump; graphics land last over the frozen frame; the final frames are your original file, pixel for pixel.
- **Locked models per path** — Google Omni for the hand build, Seedance 2.5 (frames mode, both frames pinned) for the lead-up. Live capability checks before every run; never from memory.
- **A fresh named MaxFusion project per run** — every generation lands in its own named project, never a shared or default one.
- **Approval gates are the only spend authorization** — nothing paid runs before you approve, and defects are reported and waited on, never silently regenerated.
- **SFX only** — no music, no narration, no speech by default, on either path. Ever.
- **Everything is delivered in chat** — stills and clips come back as inline widgets as they complete.

## Requirements

- **[Claude Code](https://claude.com/claude-code)** (or any agent that can follow the skill file).
- **[MaxFusion](https://maxfusion.ai) MCP** — required. All image and video generation runs through it; the skill does not work without it.
- **ffmpeg + ffprobe** — used locally for frame preparation, QA, and Path B's final composite.

## Install

1. Drop `SKILL.md` into your skills directory:

```
mkdir -p ~/.claude/skills/static-to-video-ad
curl -o ~/.claude/skills/static-to-video-ad/SKILL.md \
  https://raw.githubusercontent.com/holy-templar/static-to-video-ad/main/SKILL.md
```

2. Connect the MaxFusion MCP server:

```
claude mcp add --transport http maxfusion https://mcp.maxfusion.ai/mcp
```

   The first call will ask you to authenticate with your MaxFusion account.

3. In Claude Code, say something like:

> *make this static a video* — and attach your ad image.

The skill takes it from there: it asks which of the two treatments you want, then walks its gates — analysis, approval, generation, delivery.

## License

[GNU AGPL v3.0](LICENSE) — Copyright (C) 2026 Maxfusion AI s.r.o.

Free to use, study, modify and share. If you modify it and let others use it —
including over a network — the modified version must be released under the
same license.
