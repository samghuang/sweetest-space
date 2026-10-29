# Worth the Detour — A Museum of Us

Quick start: `npm test`, `npm run preview` (then open http://127.0.0.1:4173), `npm run build`. No install needed (Node + Python 3 only). Claude Code instructions live in `CLAUDE.md`.

# Worth the Detour — Claude handoff

Read HANDOFF.md first for the full project context and established preferences.

## Preview

From this directory run:

    python3 -m http.server 4173 --bind 127.0.0.1 --directory dist

Open http://127.0.0.1:4173/ in a WebGL-capable browser. There is no dependency installation or build step. Serve dist/index.html over HTTP; do not open that modular file directly. The separately supplied worth-the-detour.html is the self-contained playable version.

## Edit and validate

Edit files in dist/. Final artwork is in dist/assets/. Preserve the relationship and date details in HANDOFF.md.

    node --check dist/app.js
    node tests/motion.test.mjs
    node tests/navigation.test.mjs

## Rebuild the standalone gift

    python3 tools/package-local.py

Outputs are written into release/: worth-the-detour.html, worth-the-detour-source.zip, and standalone-syntax-check.mjs. An optional --output-dir PATH changes that destination. The script uses Python standard-library modules only. Validate generated code with:

    node --check release/standalone-syntax-check.mjs

This project has no backend, API credentials, external runtime services, or deployed website. The optional references ZIP contains location and person references for future artwork edits; these originals are intentionally excluded from the runtime application. The only browser persistence is the visited-memory list in localStorage.

Three.js is vendored with its MIT license in dist/vendor/. Original generated illustrations and the latest corrections are included. Prompt refinements in artwork-prompts.json supersede earlier prompt text.


## Hosted copy

To build a copy for a static host (one page with all code inlined, plus the five images):

    python3 tools/package-web.py

It writes release/web/index.html and release/web/assets/. The page omits doctype/head/body tags because the current host (a claude.ai Artifact) adds its own page shell; wrap it in a basic HTML page for other hosts.

## Gallery 02 — The Next One

Opens off the east side of the dome walkway (doorway at the old Gallery 02 sign). Five drawings, memory-6.png to memory-10.png, in order: A Tea for You, Our First Photo, The Perfect Bite, Lost Track of Time, Past My Stop. The drawings were made with Figma AI from text prompts only (no reference photos), so outfits are illustrative: he wears a black polo, she has long dark hair and a black sleeveless top (a light knit top in The Perfect Bite). Prompts are in artwork-prompts.json.

## Gallery 03 — Never Enough Time

Mirrors Gallery 02 on the west side of the dome walkway. Drawings memory-11.png to memory-15.png: Not Even Hungry, Strong Opinions, The Most Captivating Piece, Matching Bags, Next to You. Also made with Figma AI from text prompts only; outfits for this date are illustrative (he: plain black T-shirt; she: light top and jeans).

## Artwork files

Full-quality PNG originals live in artwork-originals/. The museum uses compressed JPEG copies in dist/assets/ (about a tenth of the size) so it loads quickly; frames show plain paper until each drawing arrives.

## Flicker check

`python3 tools/check-overlaps.py` lists surfaces that overlap in the same plane (z-fighting). Floors, walls and ceilings should not appear; wall lettering, drawings and labels appear with small deliberate gaps.

## Gallery 04 — Every Last Minute

A long room behind the walkway's south wall (doorway where the old 04 sign was), east of the entrance hall. Drawings memory-16 to memory-20: Sambal Under Review, Very Patient, The Saddest Ride, Always Too Short, Every Word. Made with Figma AI from text prompts; outfits illustrative. All four galleries are now open.

## Walking order and signage

A first visit starts outside on the terrace. Walking in through the entrance hall, Gallery 01 is the first doorway on the right (south-east room). The walk continues anticlockwise from above: 01 south-east, 02 east, 03 north (the large room behind the dome), 04 west, then back to the entrance. Each next doorway is the adjacent one, a right turn on the way out. Guidance is quiet and temporary: only when you walk in from outside, or step out of a gallery, a faint trail of floor chevrons toward the next doorway fades in, plus a short message ("Gallery 02 is next, just to your right"). The trail fades after about 16 seconds or as soon as you enter a gallery. Doorway wall lettering stays as normal museum signage.

## Autopilot

Press P or the Autopilot button (bottom right). It starts from the drawing that is the shortest walk away, walks there naturally, stops square-on with the drawing centred, and asks "Continue →" (or "Read this memory"). After the fifth drawing it asks whether to walk on to the next gallery; after Gallery 04 it offers to walk to the way out. Walking with the keys or clicking the floor hands control back (autopilot pauses); turning it on again resumes from the nearest drawing. Test: `node tests/autopilot.test.mjs`.

### Autopilot motion (update)

Between rooms (outside → a gallery, or gallery → gallery) autopilot flies: up to 13 m/s with eased acceleration, a gentle 1 m rise and a slight widening of view, then a soft landing. Within a gallery it walks with eased start and stop. Its gaze follows the route and drifts to the work over the last few metres, then settles smoothly so the piece ends centred. On entering each gallery it first stops at the wall introduction (museum-style text), then continues to the first drawing. Reduced motion or the walking-rhythm toggle disables the rise and view widening.

## Phones and tablets

Detected automatically on touch screens (append #touch to the URL to preview on desktop). Patterns borrowed from mobile games:
- A floating joystick appears wherever the left thumb lands in the lower-left area; push further to walk faster (analogue, with a dead zone).
- Swipe anywhere else to look; one-finger look and joystick work at the same time.
- Tap the floor to walk there, tap a drawing to open it; the "Read this memory" pill is tappable.
- After "Step inside", a bottom sheet asks "Guide me" (Autopilot) or "I'll explore on my own" (shows a short controls hint).
- A large thumb-reach Autopilot button sits bottom-right above "Visit a gallery"; autopilot prompts and the memory view open as bottom sheets with big buttons.
- Portrait screens widen the field of view and autopilot stands a little closer so each work fills the width; a tip suggests turning sideways.
- Lighter rendering on touch (capped pixel ratio, smaller shadow map) plus automatic resolution scaling when frames drop.
