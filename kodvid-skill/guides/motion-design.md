# Motion design guide

What separates a film that looks made by a senior motion designer from a default AI video.
Condensed from the strongest skills in this repo, several of them built from thousands of measured moves in
professional launch films (motionmaxxing, motion-doctrine, motion-video-kit, Remotion's layout rules).
Numbers are starting values, not targets.

## 1. Plan before you animate

Write a short plan before any code:

1. **One idea** that only this subject could own. Cover the name: would the film still work for a competitor? Then it is too generic.
2. **Beats.** For each beat write: "This beat makes the viewer believe ___." Cut any beat without an answer.
3. **Roles.** Hook, turn, proof, call to action. Proof is the biggest share. At most a quarter of the beats are "the point".
4. **Hand-offs.** How each scene becomes the next (see section 4).
5. **One hero moment** worth a screenshot. Spend the hardest work there: 3D, an effect, a dense composition.

Default lengths: hook 3 to 6 s, each proof 3 to 7 s, call to action 2 to 3.5 s and at most a quarter of the film.
Most promos run 15 to 30 s. A cut every 0.3 to 2.3 s. Stop as soon as it feels finished.

## 2. Frame and type

- **One focal point per frame**, three at most. Big needs small around it.
- **Every frame is a world:** a ground with light and depth or texture, not a flat color swatch. Use gradients, soft light, vignettes, grain or a photo plate.
- **Lead subject fills 60 to 85 % of the usable frame** in feature beats. Never a small card floating in a big empty field.
- **Type sizes as a share of height (1080):** headline 7 to 11 % (about 96 px), supporting 5 to 7 %, one hero number 22 to 29 %, spent once.
- **Safe area:** key text at least 80 px from the sides, 100 px from top and bottom.
- **One typeface**, usually a neo-grotesk such as Inter at 400 to 550, sentence case. **One accent color** with one meaning.

## 3. Motion

- **Arrivals decelerate:** most of the travel in the first 4 to 8 frames, then a long soft tail. `Easing.bezier(0.16, 1, 0.3, 1)`.
- **Exits accelerate:** ease in, then leave or shrink. `Easing.bezier(0.7, 0, 0.84, 0)`. Exit about 75 % of the entry length.
- **Typical move about 10 frames (0.33 s).** A single entry at most about 0.8 s; a longer build is a stagger of several elements.
- **Stagger** at most 0.5 s in total. Words land 2 to 12 frames apart: 2 to 4 for a fast hook, 4 to 6 for a headline, 8 to 12 when paced to a voice.
- **Arrive from oversize, not from zero.** Logos and key words land shrinking from about 1.3 to 3.5x. Nothing grows from a dot.
- **Almost nothing fades.** Things arrive by moving, cutting, unmasking or coming into focus. Fades are for single objects, not for scene changes.
- **No bounce or elastic.** At most one visible spring per film.
- **No idle wobble.** Breathing, floating or pulsing loops to fill time read as "the video is waiting". If a scene finishes early, add story or shorten it.
- **Something meaningful is always moving:** a reveal landing, the camera traveling, a counter stepping, a highlight sweeping.
- **Stillness before the payoff:** a 0.3 to 0.75 s pause between an action and its result.

## 4. Scene changes

- **Cut on motion, never on rest.** The outgoing scene is still moving at the cut; the incoming one starts already moving.
- **Vector law:** the exit decides the entry. Same axis, same direction, matched speed. Leaving left means the next scene arrives from the right moving left.
- **One dominant direction per film**, for example "everything moves left". Save other directions for meaning: up for a conclusion, push-in for going deeper, pull-out for arrival.
- **Never ping-pong** directions on consecutive cuts without a visible cause.
- **Hand an object across the cut** when you can: a shape that becomes the next layout, a word that flies into its slot.
- **Two or three transition types per film**, repeated. Default: a fast `slide` in the film's direction with 10 to 15 frames. Avoid a long crossfade between scenes.
- In Remotion: `slide({ direction: "from-right" })` for a leftward current, a `TransitionSeries.Overlay` light leak for one special cut.

## 5. Never ship

Delete these on sight, do not justify them:

1. Corner labels, scene numbers ("02 / FEATURES"), timecodes, progress bars, tracked all-caps labels.
2. Slide-deck layouts: a kicker above a headline, title then bullet content, "headline left, device right".
3. Generic web cards: a rounded card with a status dot, grey skeleton bars, invented names and numbers.
4. The name's first association: stars for "Star", a rocket for "launch".
5. Invented statistics or proof, a stat wall, a centered big number over a small label as a whole slide.
6. Slogan copy: three one-word sentences, "Not just X. It's Y.", "Unlock", "Meet X", "the future of".
7. A flat color background per scene, or a small object on an empty void.
8. An object pinned at the same position through three or more shots.
9. A web-footer ending (logo, tagline, button, URL) or any end card held longer than 1.4 s.
10. A typed headline with a blinking caret, unless it is the product's own input field.

## 6. Ending

End once, and quieter than you began. The final hold lasts 0.6 to 1.4 s. The last shot is at most a quarter of the film.
End in motion or on a designed stillness, not with a default fade to black.
