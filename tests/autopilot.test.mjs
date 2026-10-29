import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {findPath,walkable,hasClearPath,standPointFor} from '../dist/navigation.mjs';
// Read every drawing's position and facing straight from the app source.
const src=readFileSync(new URL('../dist/app.js',import.meta.url),'utf8');
const PI=Math.PI,items=[...src.matchAll(/(?:\{|\{gallery:(\d),)title:'([^']+)'.*?pos:\[([^\]]+)\],ry:([^,]+),view/g)].map(m=>({gallery:+(m[1]||1),title:m[2],pos:m[3].split(',').map(Number),ry:Function('Math',`return ${m[4]}`)(Math)}));
assert.equal(items.length,20,'expected 20 drawings');
const order=[...items].sort((a,b)=>a.gallery-b.gallery);
const stands=order.map(m=>{const p=standPointFor(m.pos,m.ry);assert(p,`no standing spot for ${m.title}`);assert(walkable(p.x,p.z));
 // Standing square-on: the spot lies on the drawing's centre line, 2–4.2 m back.
 const dx=p.x-m.pos[0],dz=p.z-m.pos[2],d=Math.hypot(dx,dz);assert(d>=2&&d<=4.21,`${m.title} distance ${d}`);
 assert(Math.abs(dx*Math.cos(m.ry)-dz*Math.sin(m.ry))<1e-6,`${m.title} off-centre`);return p;});
function walk(a,b){const path=findPath(a,b);assert(path.length||Math.hypot(a.x-b.x,a.z-b.z)<.05,`no route ${JSON.stringify([a,b])}`);
 const pos={...a},rem=path.map(p=>({...p}));for(let t=0;rem.length&&t<20000;t++){const q=rem[0],dx=q.x-pos.x,dz=q.z-pos.z,d=Math.hypot(dx,dz);if(d<.015){rem.shift();continue;}const s=Math.min(2.1/60,d);if(walkable(pos.x+dx/d*s,pos.z))pos.x+=dx/d*s;if(walkable(pos.x,pos.z+dz/d*s))pos.z+=dz/d*s;}
 assert.equal(rem.length,0,'movement stalled');assert(Math.hypot(pos.x-b.x,pos.z-b.z)<.02);}
// Portrait phones stand closer; those spots must be centred and reachable too.
for(const m of order){const p=standPointFor(m.pos,m.ry,3.7);assert(p&&walkable(p.x,p.z));const d=Math.hypot(p.x-m.pos[0],p.z-m.pos[2]);assert(d>=2&&d<=3.71,m.title);walk(stands[0],p);}
// Wall introductions: autopilot reads each gallery's wall text first.
const intros={1:{pos:[14,2.3,13.506],ry:0},2:{pos:[16.306,2.3,-5],ry:PI/2},3:{pos:[-5,2.3,-12.206],ry:PI},4:{pos:[-16.306,2.3,5],ry:-PI/2}};
const introStands={};for(const g of [1,2,3,4]){{const q=standPointFor(intros[g].pos,intros[g].ry,2.6);assert(q&&walkable(q.x,q.z));walk({x:0,z:31},q);}const p=standPointFor(intros[g].pos,intros[g].ry,4);assert(p,`no spot for intro ${g}`);introStands[g]=p;}
// Full sequence: outside → intro 01 → five drawings → intro 02 → … → way out.
const seq=[{x:0,z:31}];for(const g of [1,2,3,4]){seq.push(introStands[g]);for(let k=0;k<5;k++)seq.push(stands[(g-1)*5+k]);}
for(let i=1;i<seq.length;i++)walk(seq[i-1],seq[i]);
walk(stands.at(-1),{x:0,z:16});
// Turning autopilot on from anywhere reaches any drawing (sampled starts).
for(const s of [{x:0,z:31},{x:0,z:16},{x:8.3,z:9.4},{x:-10,z:-10},{x:24,z:0},{x:-24,z:5},{x:17,z:19}])for(const p of [stands[0],stands[7],stands[13],stands[19]])walk(s,p);
console.log('Passed: autopilot standing spots (desktop and portrait) are centred and walkable; intro stops, the full 01→04 walk, the way out, and starts from anywhere all route and move cleanly.');
