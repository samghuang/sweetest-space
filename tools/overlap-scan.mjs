const fake=()=>new Proxy(function(){}, {get:(t,k)=>k===Symbol.toPrimitive?()=>0:(k==='then'?undefined:fake()),apply:()=>fake(),set:()=>true,construct:()=>fake()});
globalThis.document={querySelector:()=>fake(),querySelectorAll:()=>[],createElement:(t)=>({width:0,height:0,getContext:()=>fake(),style:{},addEventListener(){}}),addEventListener(){},createElementNS:()=>fake()};
globalThis.matchMedia=()=>({matches:false});globalThis.location={hash:''};Object.defineProperty(globalThis,'navigator',{value:{maxTouchPoints:0},configurable:true});document.body={classList:{add(){},remove(){},toggle(){}}};globalThis.localStorage={getItem:()=>null,setItem(){}};
globalThis.addEventListener=()=>{};globalThis.window=globalThis;globalThis.innerWidth=1200;globalThis.innerHeight=800;globalThis.devicePixelRatio=1;
globalThis.requestAnimationFrame=()=>0;
globalThis.Image=class{addEventListener(){} removeEventListener(){}};
const m=await import(process.argv[2]);
const {worldMeshes,scene,THREE}=m;
scene.updateMatrixWorld(true);
// Collect axis-aligned faces of boxes and planes.
const faces=[];
const v=new THREE.Vector3();
for(const o of worldMeshes){
  const g=o.geometry; if(!g.parameters) continue;
  const type=g.type;
  if(type!=='BoxGeometry'&&type!=='PlaneGeometry')continue;
  const mat=o.material; if(mat.transparent&&mat.opacity<.5)continue;
  // object world axes
  const e=o.matrixWorld.elements;
  const ax=[new THREE.Vector3(e[0],e[1],e[2]),new THREE.Vector3(e[4],e[5],e[6]),new THREE.Vector3(e[8],e[9],e[10])];
  const aligned=ax.every(a=>[a.x,a.y,a.z].filter(c=>Math.abs(c)>1e-4).length===1);
  if(!aligned)continue;
  const c=new THREE.Vector3().setFromMatrixPosition(o.matrixWorld);
  const p=g.parameters, half=type==='BoxGeometry'?[p.width/2,p.height/2,p.depth/2]:[p.width/2,p.height/2,0];
  const dirs=type==='BoxGeometry'?[0,1,2]:[2];
  for(const d of dirs)for(const sgn of type==='BoxGeometry'?[1,-1]:[1]){
    const n=ax[d].clone().multiplyScalar(sgn).normalize();
    const axis=Math.abs(n.x)>.5?0:Math.abs(n.y)>.5?1:2;
    const pos=c.getComponent(axis)+n.getComponent(axis)*half[d];
    // extents in other two world axes
    const ext=[0,1,2].map(k=>{let r=0;for(let j=0;j<3;j++)if(j!==d)r+=Math.abs(ax[j].getComponent(k))*half[j];return [c.getComponent(k)-r,c.getComponent(k)+r];});
    faces.push({o,axis,sign:Math.sign(n.getComponent(axis)),pos,ext,kind:type,name:mat.color?.getHexString?.()||''});
  }
}
const hits=[];
for(let i=0;i<faces.length;i++)for(let j=i+1;j<faces.length;j++){
  const a=faces[i],b=faces[j];if(a.o===b.o||a.axis!==b.axis||a.sign!==b.sign)continue;
  const gap=Math.abs(a.pos-b.pos);if(gap>.012)continue;
  let area=1;for(let k=0;k<3;k++){if(k===a.axis)continue;const lo=Math.max(a.ext[k][0],b.ext[k][0]),hi=Math.min(a.ext[k][1],b.ext[k][1]);if(hi-lo<=.001){area=0;break;}area*=hi-lo;}
  if(area>.0005)hits.push({axis:'xyz'[a.axis]+(a.sign>0?'+':'-'),at:+a.pos.toFixed(3),gap:+gap.toFixed(4),area:+area.toFixed(3),
   A:a.kind[0]+'#'+a.name+' c='+[...new THREE.Vector3().setFromMatrixPosition(a.o.matrixWorld).toArray()].map(x=>x.toFixed(2)).join(','),
   B:b.kind[0]+'#'+b.name+' c='+[...new THREE.Vector3().setFromMatrixPosition(b.o.matrixWorld).toArray()].map(x=>x.toFixed(2)).join(',')});
}
hits.sort((a,b)=>b.area-a.area);
console.log('meshes',worldMeshes.length,'faces',faces.length,'overlaps',hits.length);
for(const h of hits.slice(0,80))console.log(JSON.stringify(h));
