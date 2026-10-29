import assert from 'node:assert/strict';
import {WALK_SPEED,movementAxes,walkingPace,lookFromDrag,advanceGait} from '../dist/motion.mjs';
import {stickVector} from '../dist/motion.mjs';
for(const [a,b] of [['w','arrowup'],['s','arrowdown'],['a','arrowleft'],['d','arrowright']]) assert.deepEqual(movementAxes(new Set([a])),movementAxes(new Set([b])));
assert.deepEqual(movementAxes(new Set(['w','arrowdown','a','arrowright'])),{forward:0,sideways:0});
assert.deepEqual(movementAxes(new Set(['w','arrowup'])),{forward:1,sideways:0});
const rightDown=lookFromDrag(0,0,100,100); assert(rightDown.yaw>0&&rightDown.pitch>0);
assert.equal(lookFromDrag(0,0,0,10000).pitch,1.1);assert.equal(lookFromDrag(0,0,0,-10000).pitch,-1.1);
let gait={phase:0,intensity:0},steps=0,maxHeight=0;
for(let i=0;i<240;i++){const v=advanceGait(gait,WALK_SPEED/60,1/60);steps+=Number(v.footfall);maxHeight=Math.max(maxHeight,Math.abs(v.height));}
assert.equal(steps,8);
assert(Math.abs(gait.phase - (1.5 * 4 / .72 * Math.PI * 2)) < 1e-10);
assert(Math.abs(WALK_SPEED / 1.5 - 1.4) < 1e-12);assert(maxHeight>.017&&maxHeight<=.018);
const phase=gait.phase;let stopped;for(let i=0;i<120;i++)stopped=advanceGait(gait,0,1/60);
assert.equal(gait.phase,phase);assert(!stopped.footfall);assert(Math.abs(stopped.height)<1e-8);
const disabled=advanceGait(gait,.2,1/60,false);assert(disabled.height===0&&disabled.pitch===0&&disabled.roll===0);
console.log('Passed: arrow/WASD parity, cancellation, drag inversion and limits, distance-based steps, settling at rest, reduced motion.');

for (const direction of ['w','s','arrowup','arrowdown']) {
 const keys=new Set([direction,' ']);
 assert.equal(walkingPace(keys),1.5);
 keys.delete(' ');assert.equal(walkingPace(keys),1);
}
for (const keys of [[],[' '],['a',' '],['arrowright',' '],['w','s',' ']]) assert.equal(walkingPace(new Set(keys)),1);
const normal={phase:0,intensity:0},quick={phase:0,intensity:0};
for(let i=0;i<240;i++) {
 advanceGait(normal,WALK_SPEED/60,1/60);
 advanceGait(quick,WALK_SPEED*walkingPace(new Set(['w',' ']))/60,1/60);
}
assert(Math.abs(quick.phase/normal.phase-1.5)<1e-10);
assert.equal(quick.intensity,normal.intensity);
console.log('Passed: Space boosts both forward/backward key sets, restores on release, leaves sideways pace alone, and increases step cadence exactly 50%.');

// Touch joystick: dead zone, analogue range, clamped knob, direction preserved.
{const z=stickVector(4,3);if(z.mag!==0)throw new Error('dead zone');
 const full=stickVector(0,-200);if(Math.abs(full.mag-1)>1e-9||Math.abs(full.y+1)>1e-9||Math.abs(full.knobY+56)>1e-9)throw new Error('full push');
 const half=stickVector(30,0);if(!(half.mag>0&&half.mag<1)||half.y!==0)throw new Error('half push');
 const diag=stickVector(100,100);if(Math.abs(Math.hypot(diag.knobX,diag.knobY)-56)>1e-9)throw new Error('knob clamp');
 console.log('Passed: touch joystick dead zone, analogue range, knob clamp and direction.');}
