# Worth the Detour — A Museum of Us

A personal gift: a first-person, walkable browser museum (Three.js) inspired by National Gallery Singapore. Four galleries, one per date, five ink drawings each. The owner (Samuel) will send a link to the person the museum is about. Read `HANDOFF.md` for the full history; this file is the short version you must follow.

## How to work with Samuel
- Carry out clear requests without repeatedly asking for confirmation. Ask only when something necessary is genuinely missing.
- Explanations: nontechnical and concise.
- Small, reviewable iterations. Never rebuild from scratch.
- Never claim a browser walkthrough you didn't do. Say exactly what was checked by tests versus by eye.

## Story rules (do not break)
- Only use facts Samuel has given (see `HANDOFF.md`). Don't invent her thoughts, feelings, or relationship milestones.
- Physical contact: only what's described — her head on his shoulder (Gallery 02) and the airport hug (Gallery 04). No handholding, linked arms, or other added contact anywhere.
- Faces are never shown in drawings (backs of heads, overhead or tabletop views).
- Drawings: fine black-brown ink and crosshatching on warm ivory paper. The museum itself is realistic architecture. Keep that distinction.
- Captions are short lowercase poems in Samuel's voice, centred on how he felt; what happened is only a light anchor. Sweet, romantic, wholesome.
- Wall introductions (`galleryWalls` in `dist/app.js`) are in a museum curator's voice. The "Read the full story" panels in `dist/index.html` are the personal versions.
- Don't regenerate existing drawings unless asked.

## Layout
- Rooms from the entrance: 01 south-east (beside entrance hall), 02 east, 03 north (large room behind the dome), 04 west. Each next gallery is a right turn on the way out.
- Visitors start outside. Guidance is quiet: a fading floor-chevron trail + short message only when walking in or leaving a gallery.

## Controls that are deliberate — preserve
- WASD/arrows move relative to view; left/right arrows strafe. Drag directions are intentionally reversed (`lookFromDrag` signs).
- WALK_SPEED 2.1; Space + forward/back = 1.5× pace and cadence. Gait driven by distance; reduced-motion respected.
- Click floor to walk (straight routes, simplified obstacle routes, 2.2 look-ahead). Click/tap a drawing to open it; E nearby; M directory; P autopilot.
- Autopilot: starts at the nearest drawing; flies between rooms (≈13 m/s, eased, slight lift + FOV), walks within rooms with eased approach; stops at each gallery's wall introduction first; prompts Continue / next gallery. Manual movement pauses it. The "E · Read this memory" pill is hidden while autopilot is on.
- Touch devices (auto-detected, or `#touch` in the URL): floating left-thumb joystick, swipe to look, tap to go/open, "Guide me / explore" sheet, bottom-sheet prompts, portrait FOV and closer autopilot framing, adaptive resolution.

## Files
- `dist/app.js` — world, materials, galleries, memories/captions, UI, movement loop, autopilot, touch.
- `dist/navigation.mjs` — walkable regions, collision, A*, route simplification, `standPointFor`.
- `dist/motion.mjs` — keys, drag, walk speed, gait, `stickVector`.
- `dist/index.html`, `dist/style.css` — dialogs, HUD, touch layer.
- `dist/assets/memory-1.jpg … memory-20.jpg` — final drawings, in gallery order (1–5 = G01 … 16–20 = G04).
- `dist/vendor/` — Three.js 0.170.0 (MIT), vendored. No CDN, no npm deps, no backend.
- `artwork-prompts.json` — image prompt history (later corrections override earlier ones).

## Commands
```bash
npm test                 # syntax check + motion, navigation, autopilot tests
npm run preview          # serve dist/ at http://127.0.0.1:4173 (don't open via file://)
npm run build            # release/worth-the-detour.html (single file) + source zip
npm run build:web        # release/web/ — page + assets for a static host
npm run check:flicker    # lists coplanar surfaces (z-fighting); walls/floors must not appear
```
Run `npm test` and `npm run check:flicker` after any change to geometry, movement or autopilot.

## Hosting
The current shared link is a claude.ai Artifact published from a Cowork session; it can't be updated from here. `npm run build:web` produces a static site that can go on any static host — ask Samuel before publishing anywhere public, since this is private.
