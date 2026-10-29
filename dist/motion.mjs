// Longer steps cover 40% more ground without changing the walking rhythm.
export const WALK_SPEED = 2.1;
const STEP_DISTANCE = WALK_SPEED * (.72 / 1.5);

// Both key sets describe movement relative to the current view.
export function movementAxes(keys) {
  return {
    forward: Number(keys.has('w') || keys.has('arrowup')) - Number(keys.has('s') || keys.has('arrowdown')),
    sideways: Number(keys.has('d') || keys.has('arrowright')) - Number(keys.has('a') || keys.has('arrowleft'))
  };
}

// Space quickens forward/backward steps without changing their length.
export function walkingPace(keys) {
  return keys.has(' ') && movementAxes(keys).forward !== 0 ? 1.5 : 1;
}

export function lookFromDrag(yaw, pitch, dx, dy) {
  return {yaw: yaw + dx * .003, pitch: Math.max(-1.1, Math.min(1.1, pitch + dy * .003))};
}

// Drive the gait by actual distance travelled, so holding a key against a wall
// cannot produce steps. Smooth the onset and finish of the camera motion.
export function advanceGait(gait, distance, dt, enabled=true) {
  const before = gait.phase;
  gait.phase += Math.max(0, distance) / STEP_DISTANCE * Math.PI * 2;
  const walking = distance > .0001;
  gait.intensity += ((walking && enabled ? 1 : 0) - gait.intensity) * (1 - Math.exp(-dt * 10));
  if (!enabled) gait.intensity = 0;
  const a = gait.intensity;
  return {
    height: Math.sin(gait.phase) * .018 * a,
    pitch: Math.cos(gait.phase) * .0025 * a,
    roll: Math.sin(gait.phase * .5) * .0018 * a,
    footfall: walking && Math.floor(gait.phase / (Math.PI * 2)) > Math.floor(before / (Math.PI * 2))
  };
}

// Touch joystick: a thumb offset becomes an analogue direction (0–1), with a small dead zone.
export function stickVector(dx, dy, radius = 56, dead = .14) {
  const d = Math.hypot(dx, dy);
  if (d < radius * dead) return {x: 0, y: 0, mag: 0, knobX: dx, knobY: dy};
  const r = Math.min(d, radius), mag = (r / radius - dead) / (1 - dead);
  return {x: dx / d * mag, y: dy / d * mag, mag, knobX: dx / d * r, knobY: dy / d * r};
}
