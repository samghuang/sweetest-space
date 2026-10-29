// The playable route is deliberately compact; it is not a surveyed museum plan.
export const step = 0.5;
export function walkable(x,z) {
  const atrium = Math.abs(x)<13.45 && z>-11.55 && z<11.55 && Math.hypot(x,z)>6.15;
  const gallery = Math.abs(x)<12.45 && z>-26.45 && z<-12.45;
  const northDoor = Math.abs(x)<1.7 && z>=-13 && z<=-11;
  const entry = Math.abs(x)<3.35 && z>11 && z<23.7;
  const terrace = Math.abs(x)<24 && z>=22.7 && z<35;
  // Gallery 02 opens off the east side of the dome walkway.
  const eastDoor = x>=13.3 && x<=16.4 && Math.abs(z)<1.05;
  const gallery2 = x>16.35 && x<30.45 && Math.abs(z)<12.45;
  const westDoor = x<=-13.3 && x>=-16.4 && Math.abs(z)<1.05;
  const gallery3 = x<-16.35 && x>-30.45 && Math.abs(z)<12.45;
  const southDoor = Math.abs(x-9)<1.05 && z>=11.3 && z<=13.8;
  const gallery4 = x>5.1 && x<29.7 && z>13.75 && z<21.4;
  if (!(atrium||gallery||northDoor||entry||terrace||eastDoor||gallery2||westDoor||gallery3||southDoor||gallery4)) return false;
  if (Math.abs(x-17.4)<2.6 && Math.abs(z-16)<.8) return false;
  if (Math.abs(x)<2.6 && Math.abs(z+21)<.8) return false;
  if (Math.abs(z)<2.6 && Math.abs(Math.abs(x)-25)<.8) return false;
  for (const tx of [-10,10]) for (const tz of [-7,7]) if(Math.hypot(x-tx,z-tz)<.72) return false;
  return true;
}
const distance=(a,b)=>Math.hypot(b.x-a.x,b.z-a.z);
const point=(a,b,t)=>({x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t});
// Partition a segment at every boundary used by walkable(). Checking each
// interval prevents shortcuts through thin walls, the dome, columns or bench.
export function hasClearPath(a,b) {
  if(!walkable(a.x,a.z)||!walkable(b.x,b.z))return false;
  const dx=b.x-a.x,dz=b.z-a.z,cuts=[0,1];
  const add=t=>{if(t>0&&t<1)cuts.push(t);};
  if(dx)for(const x of [5.1,7.95,10.05,14.8,20,29.7,-30.45,-25.8,-24.2,-16.4,-16.35,-13.3,-24,-13.45,-12.45,-3.35,-2.6,-1.7,1.7,2.6,3.35,12.45,13.3,13.45,16.35,16.4,24,24.2,25.8,30.45])add((x-a.x)/dx);
  if(dz)for(const z of [11.3,13.75,13.8,15.2,16.8,21.4,-26.45,-21.8,-20.2,-13,-12.45,-11.55,-11,-2.6,-1.05,1.05,2.6,11,11.55,12.45,22.7,23.7,35])add((z-a.z)/dz);
  const circles=[[0,0,6.15]];
  for(const x of [-10,10])for(const z of [-7,7])circles.push([x,z,.72]);
  const aa=dx*dx+dz*dz;
  if(aa)for(const [x,z,r] of circles){const ox=a.x-x,oz=a.z-z,bb=2*(ox*dx+oz*dz),cc=ox*ox+oz*oz-r*r,disc=bb*bb-4*aa*cc;if(disc>=0){const q=Math.sqrt(disc);add((-bb-q)/(2*aa));add((-bb+q)/(2*aa));}}
  cuts.sort((a,b)=>a-b);
  for(let i=0;i<cuts.length;i++){
    const p=point(a,b,cuts[i]);if(!walkable(p.x,p.z))return false;
    if(i){const mid=point(a,b,(cuts[i-1]+cuts[i])/2);if(!walkable(mid.x,mid.z))return false;}
  }
  return true;
}
function anchor(p){
  const x=Math.round(p.x/step),z=Math.round(p.z/step),candidates=[];
  for(let dx=-2;dx<=2;dx++)for(let dz=-2;dz<=2;dz++){const q={x:(x+dx)*step,z:(z+dz)*step};if(hasClearPath(p,q))candidates.push(q);}
  candidates.sort((a,b)=>distance(p,a)-distance(p,b));return candidates[0];
}
// Retain short routes, but charge a small distance cost for each extra leg.
// This removes grid zigzags and prefers fewer turns when routes are similar.
export function simplifyPath(start,path){
  if(!path.length)return [];
  const points=[{x:start.x,z:start.z},...path],cost=Array(points.length).fill(Infinity),next=[];
  cost[points.length-1]=0;
  for(let i=points.length-2;i>=0;i--)for(let j=points.length-1;j>i;j--){
    if(!Number.isFinite(cost[j]))continue;
    const candidate=distance(points[i],points[j])+.35+cost[j];
    if(candidate<cost[i]-1e-9&&hasClearPath(points[i],points[j])){cost[i]=candidate;next[i]=j;}
  }
  if(!Number.isFinite(cost[0]))return [];
  const result=[];for(let i=0;i<points.length-1;){i=next[i];result.push(points[i]);}return result;
}
const key=(x,z)=>`${x},${z}`;
const dirs=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
export function findPath(start,end) {
  if(!walkable(start.x,start.z)||!walkable(end.x,end.z)||distance(start,end)<.015)return [];
  const destination={x:end.x,z:end.z};
  if(hasClearPath(start,end))return [destination];
  const from=anchor(start),to=anchor(end);if(!from||!to)return [];
  const sx=Math.round(from.x/step),sz=Math.round(from.z/step),ex=Math.round(to.x/step),ez=Math.round(to.z/step);
  const startNode={x:sx,z:sz,g:0,h:Math.hypot(ex-sx,ez-sz),parent:null};
  const open=[startNode],best=new Map([[key(sx,sz),0]]),closed=new Set();
  for(let loops=0;open.length&&loops<18000;loops++){
    let min=0;for(let i=1;i<open.length;i++)if(open[i].g+open[i].h<open[min].g+open[min].h)min=i;
    const n=open.splice(min,1)[0],nk=key(n.x,n.z);if(closed.has(nk))continue;closed.add(nk);
    if(n.x===ex&&n.z===ez){const points=[];for(let p=n;p;p=p.parent)points.push({x:p.x*step,z:p.z*step});points.reverse();points.push(destination);return simplifyPath(start,points);}
    for(const [dx,dz] of dirs){const x=n.x+dx,z=n.z+dz,k=key(x,z),g=n.g+Math.hypot(dx,dz);
      if(closed.has(k)||g>=(best.get(k)??Infinity)||!hasClearPath({x:n.x*step,z:n.z*step},{x:x*step,z:z*step}))continue;
      best.set(k,g);open.push({x,z,g,h:Math.hypot(ex-x,ez-z),parent:n});
    }
  }return [];
}
// Aim ahead along the route instead of swinging toward every nearby waypoint.
export function routeLookAhead(position,path,lookAhead=2.2){
  let from=position;
  for(const to of path){const d=distance(from,to);if(d>=lookAhead&&d>0)return point(from,to,lookAhead/d);lookAhead-=d;from=to;}
  return {x:from.x,z:from.z};
}
// Autopilot stands square in front of a drawing, about 4.2 m back, stepping closer only if a wall or bench is in the way.
export function standPointFor(pos,ry,dist=4.2){
  const nx=Math.sin(ry),nz=Math.cos(ry);
  for(let d=dist;d>1.5;d-=.05){const x=pos[0]+nx*d,z=pos[2]+nz*d;if(walkable(x,z))return {x:+x.toFixed(3),z:+z.toFixed(3)};}
  return null;
}
