import assert from 'node:assert/strict';
import {findPath,walkable,hasClearPath,routeLookAhead} from '../dist/navigation.mjs';
const directStart={x:-8.13,z:-17.22},directEnd={x:7.37,z:-18.42};
assert.deepEqual(findPath(directStart,directEnd),[directEnd]);
assert.equal(hasClearPath({x:-8,z:0},{x:8,z:0}),false);
assert.equal(hasClearPath({x:0,z:-19},{x:0,z:-23}),false);
assert.equal(hasClearPath({x:7,z:-10},{x:7,z:-15}),false);
assert.equal(hasClearPath({x:-11,z:-7},{x:-9,z:-7}),false);
// Exact destinations remain usable even when rounding to the grid hits a wall.
const edge={x:12.4,z:-17.3};assert.deepEqual(findPath(directStart,edge),[edge]);
const views=[{x:8.3,z:9.4},{x:0,z:-15},{x:-8.5,z:-20},{x:-7.5,z:-22.5},{x:0,z:-24},{x:7.5,z:-22.5},{x:8.5,z:-20},{x:0,z:29},{x:17.5,z:0},{x:24,z:-8.5},{x:28,z:0},{x:24,z:8.5},{x:-17.5,z:0},{x:-24,z:8.5},{x:-28,z:0},{x:-24,z:-8.5},{x:9,z:14.5},{x:8.6,z:17.6},{x:17.4,z:18.3},{x:26.2,z:17.6}];
const routeCount=views.length*(views.length-1);
let totalLegs=0,maxLegs=0;
for(const a of views)for(const b of views){if(a===b)continue;
 const path=findPath(a,b);assert(path.length>0,JSON.stringify({a,b}));assert.deepEqual(path.at(-1),b);
 let p=a;
 for(const q of path){assert(hasClearPath(p,q));const n=Math.ceil(Math.hypot(q.x-p.x,q.z-p.z)/.01);for(let i=0;i<=n;i++)assert(walkable(p.x+(q.x-p.x)*i/n,p.z+(q.z-p.z)*i/n));p=q;}
 // Exercise the same axis-separated collision movement used by the game.
 const position={...a},remaining=path.map(p=>({...p}));
 for(let tick=0;remaining.length&&tick<12000;tick++){
  const q=remaining[0],dx=q.x-position.x,dz=q.z-position.z,d=Math.hypot(dx,dz);
  if(d<.015){remaining.shift();continue;}
  const stride=Math.min(2.1/60,d),mx=dx/d*stride,mz=dz/d*stride;
  if(walkable(position.x+mx,position.z))position.x+=mx;
  if(walkable(position.x,position.z+mz))position.z+=mz;
 }
 assert.equal(remaining.length,0,`Movement stalled: ${JSON.stringify({a,b,position})}`);
 assert(Math.hypot(position.x-b.x,position.z-b.z)<.02);
 totalLegs+=path.length;maxLegs=Math.max(maxLegs,path.length);
}
assert.equal(hasClearPath({x:12,z:3},{x:18,z:3}),false);
assert.equal(hasClearPath({x:24,z:0},{x:26,z:0}),false);
assert.equal(hasClearPath({x:-12,z:3},{x:-18,z:3}),false);
assert.equal(hasClearPath({x:-24,z:0},{x:-26,z:0}),false);
assert.equal(hasClearPath({x:6,z:10},{x:6,z:15}),false);
assert.equal(hasClearPath({x:17.4,z:15},{x:17.4,z:17}),false);
const aroundBench2=findPath({x:23.5,z:0},{x:26.5,z:0});assert(aroundBench2.length>0&&aroundBench2.length<=4);
const aroundBench=findPath({x:0,z:-19},{x:0,z:-23});assert(aroundBench.length<=4);
const ahead=routeLookAhead({x:0,z:0},[{x:0,z:1},{x:2,z:1}],2);assert.deepEqual(ahead,{x:1,z:1});
assert.deepEqual(routeLookAhead({x:0,z:0},[{x:0,z:1}],3),{x:0,z:1});
console.log(`Passed: Gallery 02–04 doorways and benches, straight routes, exact destinations, all ${routeCount} viewpoint routes, dense obstacle checks, minimal bench detour, and camera look-ahead. Average ${(totalLegs/routeCount).toFixed(1)} legs; maximum ${maxLegs}.`);
