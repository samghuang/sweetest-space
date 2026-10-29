import * as THREE from './vendor/three.module.js';
import {walkable,findPath,routeLookAhead,standPointFor,hasClearPath} from './navigation.mjs';
import {WALK_SPEED,movementAxes,walkingPace,lookFromDrag,advanceGait,stickVector} from './motion.mjs';
window.__detourBooted=true;

const $=s=>document.querySelector(s), canvas=$('#world');
const memories=[
 {title:'Looking Together',caption:'among all that art\ni felt a quiet kind of nervous\nthe good kind\nthe kind that hopes\n\ni barely remember the paintings\ni remember feeling lucky\nthat out of everyone in that room\nyou were standing next to me',alt:'Ink drawing of the couple seen from behind, walking through a quiet gallery together.',pos:[4.85,2.25,17.6],ry:Math.PI/2,view:{x:8.6,z:17.6}},
 {title:'The Space Between Galleries',caption:'walking past the white dome\ni felt the day slow down\n\nno plan, no rush\njust a calm i didn’t expect\nand a feeling\nthat i could stay in that in-between\nas long as you were in it too',alt:'Ink drawing of the couple seen from behind beside the white dome and glass walkway.',pos:[10,2.25,21.65],ry:Math.PI,view:{x:10,z:18.3}},
 {title:'A Very Thorough Search',caption:'i should have felt embarrassed\nleading us in circles\naround the wrong side of the building\n\ninstead i felt light\nalmost giddy\nevery wrong turn\nwas one more minute with you\nand i wasn’t in a hurry to be right',alt:'Ink drawing of the couple walking away along the museum’s columned facade.',pos:[17.4,2.25,21.65],ry:Math.PI,view:{x:17.4,z:18.3}},
 {title:'Across the Table',caption:'when you put food on my plate\nsomething in me went soft\n\ni felt so cared for\nover pork and steamed egg\nthat for a moment\ni caught myself thinking\ni could get used to this',alt:'Overhead ink drawing of the couple seated opposite each other at a square table, sharing pork from two rack-topped serving trays.',pos:[24.8,2.25,21.65],ry:Math.PI,view:{x:24.8,z:18.3}},
 {title:'A Little Longer',caption:'sitting beside you with our koi\ni felt the evening was going well\nand i didn’t want to jinx it\n\nso i stayed quiet in the happiest way\ngrateful for every extra minute\nhoping you were glad\nto stay a little longer too',alt:'Ink drawing of the couple seen from behind, sitting side by side in an indoor booth with two KOI drinks.',pos:[29.95,2.25,17.6],ry:-Math.PI/2,view:{x:26.2,z:17.6}}
];
// Gallery 02 sits east of the dome walkway; positions are world coordinates.
memories.push(
 {gallery:2,title:'A Tea for You',caption:'my heart was racing before you arrived\nso i held on to a peach tea\nlike it could steady me\n\nwhen i realised you had walked right past\nand were waiting at the escalator\nthe nerves broke into a grin\ni couldn’t hide',alt:'Ink drawing of the man seen from behind in a station convenience store, taking a bottled peach tea from the drinks fridge with a coffee in his other hand.',pos:[24,2.25,-12.55],ry:0,view:{x:24,z:-8.5}},
 {gallery:2,title:'Our First Photo',caption:'up among the supertrees\ntime felt endless\nlike we had forever to talk\n\nmy heart was louder than the city\nwhen i finally asked\nfor our first photo\nand i felt so proud of myself\nfor being brave enough',alt:'Ink drawing of the couple seen from behind on the Supertree walkway at sunset, the man raising a phone for their first photo together.',pos:[30.4,2.25,-7.5],ry:-Math.PI/2,view:{x:26.5,z:-7.5}},
 {gallery:2,title:'The Perfect Bite',caption:'when you made that bite for me\ni felt seen\nin the smallest, sweetest way\n\nthe talking came so easily\ni forgot to be nervous\nand for a moment\nit felt like we had done this\na hundred times before',alt:'Ink drawing across a restaurant table: the man holds a spoon with a neat bite of linguine topped with salmon roe, while the woman’s hand rests over her bowl of pasta.',pos:[30.4,2.25,0],ry:-Math.PI/2,view:{x:28,z:0}},
 {gallery:2,title:'Lost Track of Time',caption:'i felt completely at ease\nthe kind of easy\nyou can’t plan for\n\nyou watched me finish a whole dessert\nwe talked about nothing at all\nand i felt so happy\ni forgot to check the time\neven once',alt:'Ink drawing of the couple seen from behind, sitting side by side at a table in a large food court, an empty dessert bowl in front of the man.',pos:[30.4,2.25,7.5],ry:-Math.PI/2,view:{x:26.5,z:7.5}},
 {gallery:2,title:'Past My Stop',caption:'when you rested your head on my shoulder\ni felt everything go still\nand wonderful\n\ni missed my stop on purpose\nand when you said\nwe’ll wait for the next one\nmy heart felt full\nin a way i still can’t describe',alt:'Ink drawing of the couple seen from behind on a quiet MRT train, the woman resting her head on the man’s shoulder.',pos:[24,2.25,12.55],ry:Math.PI,view:{x:24,z:8.5}}
);
// Gallery 03 is the large north room behind the dome. From the entrance the walk runs 01 south-east, 02 east, 03 north, 04 west.
memories.push(
 {gallery:3,title:'Not Even Hungry',caption:'you came along when you weren’t hungry\nand i felt so looked after\n\nsharing that one big bowl\npicking out the lotus root we both love\ni felt a warmth\nthat had nothing to do with the mala',alt:'Ink drawing across a restaurant table: a large shared bowl of dry mala full of lotus root sits in the middle; the man lifts a lotus slice into his heaped small bowl while the woman places one neat piece into hers, a bubble-tea bag beside her.',pos:[-12.55,2.25,-20],ry:Math.PI/2,view:{x:-8.5,z:-20}},
 {gallery:3,title:'Strong Opinions',caption:'you laughed at every outfit i picked\nand i felt happier than i had all week\n\nthere is something about being teased\nby someone you like\nit feels like being let in',alt:'Ink drawing of the couple seen from behind in a homeware store, the man holding up a patterned shirt while the woman laughs and points at it.',pos:[-7.5,2.25,-26.4],ry:0,view:{x:-7.5,z:-22.5}},
 {gallery:3,title:'The Most Captivating Piece',caption:'i felt a little lost\nin front of all that art\ni didn’t understand most of it\n\nbut i understood the feeling\nof turning to look at you\nand forgetting\nthere was anything else on the walls',alt:'Ink drawing of the couple seen from behind in a white contemporary gallery; she studies a large abstract painting while he turns his head toward her.',pos:[0,2.25,-26.4],ry:0,view:{x:0,z:-24}},
 {gallery:3,title:'Matching Bags',caption:'calling that car felt embarrassing\nbut with you there\nit turned into a story\n\nchoosing matching bags\ni felt a quiet thrill\nlike we were making something\nthat belonged to both of us',alt:'Ink drawing of the couple seen from behind at a shop counter, each holding up one of two identical black drawstring dumpling bags.',pos:[7.5,2.25,-26.4],ry:0,view:{x:7.5,z:-22.5}},
 {gallery:3,title:'Next to You',caption:'when you said you love seeing my excited face\ni felt shy and happy all at once\n\nmoving to sit beside you\nfelt like the most natural thing\nand the hours\nfelt like minutes',alt:'Ink drawing of the couple seen from behind, sitting side by side at a hotpot table with a steaming divided pot in front of them.',pos:[12.55,2.25,-20],ry:-Math.PI/2,view:{x:8.5,z:-20}}
);
// Gallery 04 mirrors Gallery 02 on the west side of the walkway.
memories.push(
 {gallery:4,title:'Sambal Under Review',caption:'knowing it was our last day\ni felt every minute more sharply\n\nyou teased me about my sambal\nand i laughed\nbut underneath it\ni was already missing you\nacross the table',alt:'Ink drawing across a breakfast table: the man’s plate is piled with nasi lemak, sambal, peanuts and anchovies, while the woman, with only a small pastry and fruit, points at it teasingly.',pos:[-24,2.25,12.55],ry:Math.PI,view:{x:-24,z:8.5}},
 {gallery:4,title:'Very Patient',caption:'i felt so guilty\ngiving those hours to my laptop\nwhen they should have been yours\n\nbut every time i looked up\nyou were still there\npatient and kind\nand i felt more grateful\nthan i knew how to say',alt:'Overhead ink drawing of a hotel room: the man sits on the couch with his back to the window, head bowed over his laptop, while the woman sits curled up in the armchair to the left of the side table.',pos:[-30.4,2.25,7.5],ry:Math.PI/2,view:{x:-26.5,z:7.5}},
 {gallery:4,title:'The Saddest Ride',caption:'that ride was the saddest i have felt\nin a long time\n\ni kept imagining the life we could have\nand how far away it was about to feel\n\nthe booklet in my hands\nfelt heavier than paper',alt:'Ink drawing from the back of a car: the couple sit side by side on the rear seat, seen from behind, the man holding a small closed booklet on his lap.',pos:[-30.4,2.25,0],ry:Math.PI/2,view:{x:-28,z:0}},
 {gallery:4,title:'Always Too Short',caption:'i held on\nand still it felt too short\n\nwalking through those gates\ni felt my chest tighten\nlike part of me\nhad stayed behind with you',alt:'Ink drawing of the couple hugging goodbye in an airport check-in hall, the man seen from behind with a backpack, her face hidden against his shoulder.',pos:[-30.4,2.25,-7.5],ry:Math.PI/2,view:{x:-26.5,z:-7.5}},
 {gallery:4,title:'Every Word',caption:'reading your words above the clouds\ni felt everything at once\n\ngrateful, aching, so lucky\nand for the first time\ni cried on a plane\n\ni haven’t stopped thinking about you since',alt:'Ink drawing of the man seen from behind in a business-class seat by the window, reading a small spiral booklet and wiping his eye.',pos:[-24,2.25,-12.55],ry:0,view:{x:-24,z:-8.5}}
);
const galleries={1:{title:'Worth the Detour',start:0},2:{title:'The Next One',start:5},3:{title:'Never Enough Time',start:10},4:{title:'Every Last Minute',start:15}};
const galleryOf=i=>memories[i].gallery||1,inGallery=i=>i-galleries[galleryOf(i)].start,pad=n=>String(n).padStart(2,'0');
const gait={phase:0,intensity:0};
const state={started:false,yaw:.62,pitch:.04,targetYaw:.62,targetPitch:.04,keys:new Set(),path:[],current:0,seen:new Set(),tour:false,tourIndex:0,near:null,sound:false,drag:false,moved:0};
try{state.seen=new Set(JSON.parse(localStorage.getItem('detour-seen-v1')||'[]').filter(n=>Number.isInteger(n)&&n>=0&&n<memories.length));}catch{}
let renderer,scene,camera,sun,clock,frameId,marker,footAudio,lastFoot=0,toastTimer;
const artTargets=[],interactTargets=[],floorTargets=[],worldMeshes=[];
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
// Phones and tablets: touch controls, larger targets and a lighter renderer.
const touch=location.hash==='#touch'||matchMedia('(pointer: coarse)').matches||(navigator.maxTouchPoints>0&&matchMedia('(hover: none)').matches);
if(touch)document.body.classList.add('touch');
// Keep at least ~70° of view across narrow (portrait) screens.
const baseFov=()=>{const a=innerWidth/innerHeight;return Math.max(62,Math.min(95,2*Math.atan(Math.tan(35*Math.PI/180)/a)*180/Math.PI));};
const loader=new THREE.TextureLoader();
const V=(x,y,z)=>new THREE.Vector3(x,y,z);
const mat=(color,roughness=.8,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
let seed=48;function rnd(){seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;}
function makeTexture(w,h,fn){const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),8);return t;}
function surfaceTexture(type){return makeTexture(1024,1024,(c,w,h)=>{
 if(type==='wood'){c.fillStyle='#977656';c.fillRect(0,0,w,h);for(let j=0;j<16;j++){let light=42+rnd()*13;c.fillStyle=`hsl(29,27%,${light}%)`;c.fillRect(0,j*64,w,63);c.fillStyle='#604d3b';c.fillRect(0,j*64,w,1);for(let k=0;k<85;k++){let y=j*64+rnd()*62;c.strokeStyle=`rgba(${rnd()>.5?'50,32,16':'236,200,144'},${.04+rnd()*.1})`;c.lineWidth=.5+rnd();c.beginPath();c.moveTo(0,y);c.bezierCurveTo(250,y+rnd()*6,650,y-rnd()*6,w,y);c.stroke();}let shift=(j%3)*270;for(let x=shift;x<w;x+=600){c.fillStyle='#65523f';c.fillRect(x,j*64,1,64);}}}
 else{c.fillStyle=type==='stone'?'#c5c2b5':'#efede3';c.fillRect(0,0,w,h);for(let i=0;i<40000;i++){const a=.015+rnd()*.04;c.fillStyle=`rgba(61,57,43,${a})`;c.fillRect(rnd()*w,rnd()*h,1+rnd()*2,1+rnd()*2);}if(type==='stone'){c.strokeStyle='#999b902f';c.lineWidth=1;for(let y=0;y<h;y+=256){c.strokeRect(0,y,w,256);for(let x=(y%512?256:0);x<w;x+=512)c.strokeRect(x,y,512,256);}}}
 });}
function mesh(geo,material,x=0,y=0,z=0,parent=scene){const o=new THREE.Mesh(geo,material);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);worldMeshes.push(o);return o;}
function box(w,h,d,x,y,z,m,parent=scene){return mesh(new THREE.BoxGeometry(w,h,d),m,x,y,z,parent);}
function cyl(rt,rb,h,x,y,z,m,parent=scene,segments=24){return mesh(new THREE.CylinderGeometry(rt,rb,h,segments),m,x,y,z,parent);}
function rod(a,b,r,m,parent=scene){const dir=new THREE.Vector3().subVectors(b,a);const o=mesh(new THREE.CylinderGeometry(r,r,dir.length(),12),m,0,0,0,parent);o.position.copy(a).add(b).multiplyScalar(.5);o.quaternion.setFromUnitVectors(V(0,1,0),dir.normalize());return o;}
function label(text,sub,w,h,x,y,z,ry=0,{bg='#eeeadd',ink='#3c4537',font=58,wallText=false}={}){
 const t=makeTexture(1024,Math.round(1024*h/w),(c,cw,ch)=>{if(wallText){c.clearRect(0,0,cw,ch);c.fillStyle='#394533';c.textAlign='left';c.font='24px Arial';c.fillText(sub,90,ch*.26);c.font=`${font}px Georgia`;c.fillText(text,90,ch*.66);}else{c.fillStyle=bg;c.fillRect(0,0,cw,ch);c.fillStyle=ink;c.textAlign='center';c.font=`${font}px Georgia`;c.fillText(text,cw/2,ch*.45);if(sub){c.font='22px Arial';c.fillStyle=ink;c.fillText(sub,cw/2,ch*.72);}}});
 const material=wallText?new THREE.MeshStandardMaterial({map:t,transparent:true,depthWrite:false,roughness:1,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}):new THREE.MeshBasicMaterial({map:t});
 const o=mesh(new THREE.PlaneGeometry(w,h),material,x,y,z);o.rotation.y=ry;o.castShadow=false;return o;
}
function archShape(w,h){const s=new THREE.Shape(),r=w/2;s.moveTo(-r,0);s.lineTo(r,0);s.lineTo(r,h-r);s.absarc(0,h-r,r,0,Math.PI,false);s.lineTo(-r,0);return s;}
function arch(w,h,x,y,z,m,parent){return mesh(new THREE.ShapeGeometry(archShape(w,h)),m,x,y,z,parent);}
function archTrim(w,h,x,y,z,m,parent,thick=.05){const r=w/2,pts=[V(-r,0,0),V(-r,h-r,0)];for(let i=0;i<=24;i++){let a=Math.PI-i/24*Math.PI;pts.push(V(Math.cos(a)*r,h-r+Math.sin(a)*r,0));}pts.push(V(r,0,0));const curve=new THREE.CatmullRomCurve3(pts,false,'centripetal');const o=mesh(new THREE.TubeGeometry(curve,60,thick,6,false),m,x,y,z,parent);return o;}
function floor(w,d,x,z,m){const o=box(w,.16,d,x,-.1,z,m);floorTargets.push(o);return o;}

// Wayfinding appears only after someone leaves a gallery (or first walks in from outside):
// a faint trail of floor chevrons toward the next doorway that fades away by itself.
const trails=[];
const legs=[
 [[0,12.6],[0.8,10.9],[8.6,10.9],[9,11.3]],                 // entrance → 01
 [[9,10.9],[12.3,9.3],[12.3,1],[13.1,0]],                   // 01 → 02
 [[12.3,-1],[12.3,-9.3],[1.5,-10.8],[0,-11.3]],             // 02 → 03
 [[-1.5,-10.8],[-12.3,-9.3],[-12.3,-1],[-13.1,0]],          // 03 → 04
 [[-12.3,1],[-12.3,9.3],[-1,10.9],[0,13.2]]                 // 04 → way out
];
function buildTrails(){
 const tex=makeTexture(256,256,(c,w,h)=>{c.clearRect(0,0,w,h);c.lineJoin='round';c.lineCap='round';c.beginPath();c.moveTo(60,176);c.lineTo(128,100);c.lineTo(196,176);c.lineWidth=26;c.strokeStyle='#f6efdc';c.stroke();});
 const geo=new THREE.PlaneGeometry(.36,.36);
 legs.forEach(pts=>{
  const mat=new THREE.MeshBasicMaterial({map:tex,transparent:true,opacity:0,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
  const group=new THREE.Group();group.visible=false;scene.add(group);
  for(let k=1;k<pts.length;k++){const [ax,az]=pts[k-1],[bx,bz]=pts[k],d=Math.hypot(bx-ax,bz-az),n=Math.max(1,Math.round(d/1.4));
   for(let i=(k===1?0:1);i<=n;i++){const t=i/n,g=new THREE.Group();g.position.set(ax+(bx-ax)*t,-.012,az+(bz-az)*t);g.rotation.y=Math.atan2(-(bx-ax),-(bz-az));const o=new THREE.Mesh(geo,mat);o.rotation.x=-Math.PI/2;o.renderOrder=1;g.add(o);group.add(g);}}
  trails.push({group,mat});
 });
}
function showTrail(leg){state.trail={leg,age:0};trails.forEach((t,i)=>{t.group.visible=i===leg;t.mat.opacity=0;});}
function hideTrail(){if(state.trail)state.trail.fading=true;}
function updateTrail(dt){
 const tr=state.trail;if(!tr)return;const t=trails[tr.leg];tr.age+=dt;
 if(tr.age>16)tr.fading=true;
 t.mat.opacity=tr.fading?Math.max(0,t.mat.opacity-dt*.8):Math.min(.6,t.mat.opacity+dt*.8);
 if(tr.fading&&t.mat.opacity<=0){t.group.visible=false;state.trail=null;}
}
const roomAt=(x,z)=>x>14.2?2:x<-14.2?4:z<-12?3:(x>4.3&&z>12.2&&z<22.2)?1:0;
// Museum wall text for each gallery, in a curator's voice.
const galleryWalls={
 1:{kicker:'GALLERY 01  ·  THE FIRST DATE',title:'Worth the Detour',meta:'National Gallery Singapore and Funan  ·  An evening',body:'The evening began with a reservation that turned out to be a waitlist. What followed was unplanned: an unhurried walk through the galleries, a pause beside the white dome, and a long, confident circuit of the building in search of a restaurant that had been upstairs all along. The date closed over Korean barbecue and bubble tea. These five works suggest that the best parts of a plan are often the ones it never included.'},
 2:{kicker:'GALLERY 02  ·  THE SECOND DATE',title:'The Next One',meta:'Gardens by the Bay, Marina Bay Sands and the MRT  ·  Sunset to night',body:'A second meeting, arranged at Gardens by the Bay station, begins with nerves and a bottled peach tea. The works move from a hazy sunset among the Supertrees, where a first photograph was finally requested, to an easy dinner, a late dessert at Marina Bay Sands, and a train ride that continued well past its intended stop. The gallery takes its title from a single line spoken on a platform: we’ll wait for the next one.'},
 3:{kicker:'GALLERY 03  ·  THE THIRD DATE',title:'Never Enough Time',meta:'Orchard, the Singapore Art Museum and beyond  ·  Sunday afternoon to late night',body:'Arranged on short notice because earlier evenings had always ended too soon, this date unfolds as a series of small, unplanned turns: Molly Tea and a shared bowl of malatang, good-natured teasing at H&M Home, the Singapore Art Museum, a private bus that accepted only cash, and a pair of matching bags. It ends late, at a hotpot table. Together the works consider how easily hours disappear in good company.'},
 4:{kicker:'GALLERY 04  ·  THE LAST DAY',title:'Every Last Minute',meta:'A hotel morning, the road to the airport, and a flight  ·  Departure day',body:'The final gallery records a departure day measured in minutes. It begins early, with breakfast and gentle teasing over sambal, moves through a quiet morning of work and patient company, and follows a subdued car ride to the airport, where a handmade booklet was given with instructions not to open it yet. The series closes in the air, as the booklet is finally read. These works consider how a goodbye can hold as much tenderness as any beginning.'}
};
function wallIntroTexture(g){const d=galleryWalls[g];return makeTexture(1024,1024,(c,w,h)=>{c.clearRect(0,0,w,h);c.fillStyle='#394533';c.font='23px Arial';c.fillText(d.kicker,90,112);c.font='64px Georgia';c.fillText(d.title,90,206);c.font='italic 23px Georgia';c.fillText(d.meta,90,256);c.fillRect(90,290,70,2);c.font='29px Georgia';let y=352,line='';for(const word of d.body.split(' ')){const t=line?line+' '+word:word;if(c.measureText(t).width>844&&line){c.fillText(line,90,y);y+=45;line=word;}else line=t;}if(line)c.fillText(line,90,y);});}
function buildSideGallery(sx,plaster,dark,bronze,wood,{gallery,heading,title,lines}){
 // Side galleries share Gallery 01's treatment. sx=1 builds east of the walkway, sx=-1 mirrors it to the west.
 const X=x=>x*sx;
 floor(2.1,2.8,X(15.05),0,wood);floor(15,26,X(23.6),0,wood);
 for(const z of [-1.4,1.4])box(1.71,3.5,.2,X(15.045),1.75,z,plaster);box(1.71,.25,3,X(15.045),3.62,0,plaster);
 for(const z of [-7.15,7.15])box(.4,5,11.7,X(16.1),2.5,z,plaster);box(.4,1.5,2.6,X(16.1),4.25,0,plaster);
 box(.35,4.9,26,X(30.65),2.45,0,plaster);for(const z of [-12.8,12.8])box(14.6,4.9,.35,X(23.6),2.45,z,plaster);box(14.6,.25,26,X(23.6),5,0,plaster);
 for(const z of [-11.8,11.8])box(13,.08,.06,X(23.6),4.65,z,dark);box(.06,.08,23,X(29.65),4.65,0,dark);
 for(const z of [-8,0,8]){const p=new THREE.PointLight('#fff0d2',19,12,1.5);p.position.set(X(24),4.2,z);scene.add(p);}
 const intro=wallIntroTexture(gallery);
 const introMesh=mesh(new THREE.PlaneGeometry(2.9,2.9),new THREE.MeshStandardMaterial({map:intro,transparent:true,depthWrite:false,roughness:1,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}),X(16.306),2.3,X(-5));introMesh.rotation.y=sx*Math.PI/2;introMesh.castShadow=false;introMesh.userData={kind:'intro',gallery};interactTargets.push(introMesh);
 box(.9,.13,4.6,X(25),.6,0,wood);for(const z of [-1.85,1.85])box(.66,.55,.13,X(25),.28,z,dark);
 // Bronze doorway frame and wall lettering on the walkway side.
 for(const z of [-1.42,1.42])box(.18,3.55,.12,X(13.76),1.78,z,bronze);box(.18,.12,2.96,X(13.76),3.5,0,bronze);
 label(title,`GALLERY ${pad(gallery)}  /  FIVE MEMORIES`,3.6,.9,X(13.795),4.45,0,-sx*Math.PI/2,{font:68,wallText:true});
}
function buildSouthGallery(plaster,dark,bronze,wood){
 // A long room behind the walkway's south wall, east of the entrance hall. Faces never share a plane.
 floor(2.6,1.4,9,12.7,wood);floor(26,8.6,17.4,17.7,wood);
 for(const x of [7.6,10.4])box(.2,3.4,.9,x,1.7,12.65,plaster);box(2.8,.2,.9,9,3.5,12.65,plaster);
 box(3.3,5,.4,6.05,2.5,13.3,plaster);box(20.1,5,.4,20.35,2.5,13.3,plaster);box(2.6,1.6,.4,9,4.2,13.3,plaster);
 box(26,4.9,.35,17.4,2.45,21.9,plaster);for(const x of [4.6,30.2])box(.35,4.9,8.2,x,2.45,17.6,plaster);box(25.8,.25,8.6,17.4,5,17.6,plaster);
 box(24.6,.08,.06,17.4,4.65,21.6,dark);
 for(const x of [10,17.4,24.8]){const p=new THREE.PointLight('#fff0d2',19,12,1.5);p.position.set(x,4.2,17.6);scene.add(p);}
 const lines=['It began with a reservation I hadn’t','actually made. A waitlist, a change of','plans, and a wander through the galleries.','','Then the long way to dinner. Two pork','dishes, us serving each other food, and','KOI in a booth, side by side.','','Five little moments I kept.'];
 const intro=wallIntroTexture(1);
 const introMesh=mesh(new THREE.PlaneGeometry(2.9,2.9),new THREE.MeshStandardMaterial({map:intro,transparent:true,depthWrite:false,roughness:1,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}),14,2.3,13.506);introMesh.castShadow=false;introMesh.userData={kind:'intro',gallery:1};interactTargets.push(introMesh);
 box(4.6,.13,.9,17.4,.6,16,wood);for(const x of [-1.85,1.85])box(.13,.55,.66,17.4+x,.28,16,dark);
 // Doorway in the walkway's south wall, with bronze frame and wall lettering.
 for(const x of [7.58,10.42])box(.12,3.55,.18,x,1.78,11.76,bronze);box(2.96,.12,.18,9,3.5,11.76,bronze);
 label('Worth the Detour','GALLERY 01  /  FIVE MEMORIES',3.6,.9,9,4.45,11.785,Math.PI,{font:68,wallText:true});
}
function buildWorld(){
 scene=new THREE.Scene();scene.background=new THREE.Color('#d9e3e2');scene.fog=new THREE.Fog('#d9e3e2',55,120);
 camera=new THREE.PerspectiveCamera(baseFov(),innerWidth/innerHeight,.08,150);camera.rotation.order='YXZ';camera.position.set(8.3,1.7,9.4);
 scene.add(new THREE.HemisphereLight('#e6f0fa','#a18e6f',2.05));scene.add(new THREE.AmbientLight('#fff8df',.35));
 sun=new THREE.DirectionalLight('#fff4da',3.2);sun.position.set(-14,27,9);sun.target.position.set(0,0,-2);sun.castShadow=true;sun.shadow.mapSize.set(touch?1024:2048,touch?1024:2048);Object.assign(sun.shadow.camera,{left:-34,right:34,top:36,bottom:-36,near:1,far:75});sun.shadow.bias=-.00025;sun.shadow.normalBias=.035;sun.shadow.radius=3;scene.add(sun,sun.target);
 const plaster=mat('#eeeade'),stone=mat('#bdbcb0'),marble=mat('#d3d1c3',.5),dark=mat('#3d423b',.5),metal=mat('#aaa99a',.38,.7),bronze=mat('#645e49',.43,.65),white=mat('#f3efe4',.63),wood=mat('#c2a17a',.72);
 plaster.map=surfaceTexture('plaster');stone.map=surfaceTexture('stone');stone.map.wrapS=stone.map.wrapT=THREE.RepeatWrapping;stone.map.repeat.set(3,3);
 const woodTex=surfaceTexture('wood');woodTex.wrapS=woodTex.wrapT=THREE.RepeatWrapping;woodTex.repeat.set(5,5);wood.map=woodTex;
 floor(28,24,0,0,wood);floor(26,15,0,-19.5,wood);floor(8,10.5,0,17.25,marble);floor(51,13.5,0,29.25,stone);
 // The dome sits inside a quiet stone apron, surrounded by the upper walkway.
 cyl(5.8,5.8,.13,0,.02,0,marble,scene,80);cyl(4.48,4.62,.32,0,.22,0,white,scene,80);cyl(4.36,4.36,1.525,0,1.0875,0,white,scene,80);
 const dome=mesh(new THREE.SphereGeometry(4.36,80,40,0,Math.PI*2,0,Math.PI/2),white,0,1.85,0);dome.scale.y=.91;
 for(let i=0;i<12;i++){const a=i*Math.PI/6,pts=[];for(let j=0;j<=36;j++){let p=j/36*Math.PI/2;pts.push(V(Math.cos(a)*4.38*Math.sin(p),1.85+3.99*Math.cos(p),Math.sin(a)*4.38*Math.sin(p)));}mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),36,.067,7,false),white);}
 cyl(.81,.9,.22,0,5.95,0,white,scene,40);cyl(.7,.74,.75,0,6.4,0,white,scene,40);cyl(.83,.75,.18,0,6.85,0,white,scene,40);
 const louver=mat('#777b70');for(let k=0;k<12;k++){let a=k*Math.PI/6;const group=new THREE.Group();group.position.set(Math.sin(a)*.735,6.15,Math.cos(a)*.735);group.rotation.y=a;scene.add(group);for(let j=0;j<5;j++)box(.27,.045,.025,0,j*.11,0,louver,group);}
 mesh(new THREE.SphereGeometry(.83,32,12,0,Math.PI*2,0,Math.PI/2),white,0,6.93,0).scale.y=.5;
 const windowMat=mat('#373f39',.26,.13);
 for(let i=0;i<10;i++){const a=i/10*Math.PI*2,group=new THREE.Group();group.position.set(Math.sin(a)*4.38,.45,Math.cos(a)*4.38);group.rotation.y=a;scene.add(group);
  arch(1.68,2.52,0,-.07,-.02,white,group);arch(1.2,2.12,0,.07,.035,windowMat,group);archTrim(1.33,2.22,0,.02,.07,marble,group,.07);archTrim(1.03,1.96,0,.12,.08,stone,group,.026);
  for(let x of [-.29,0,.29])box(.035,1.58,.06,x,.9,.09,stone,group);for(let y of [.45,.8,1.15,1.55])box(1.07,.035,.06,0,y,.09,stone,group);for(let k=0;k<5;k++){let a2=k*Math.PI/4;rod(V(0,1.55,.09),V(Math.cos(a2)*.5,1.55+Math.sin(a2)*.5,.09),.017,stone,group);}box(1.48,.1,.22,0,0,.02,white,group);
 }
 // Glass at the dome edge, with a thin continuous dark handrail.
 const glass=new THREE.MeshPhysicalMaterial({color:'#c5ddd1',transparent:true,opacity:.17,roughness:.12,metalness:.1,side:THREE.DoubleSide,depthWrite:false});
 const radius=5.9,N=48;for(let i=0;i<N;i++){let a=i/N*Math.PI*2,b=(i+1)/N*Math.PI*2;let p=V(Math.sin(a)*radius,0,Math.cos(a)*radius),q=V(Math.sin(b)*radius,0,Math.cos(b)*radius),mid=p.clone().add(q).multiplyScalar(.5);
  const panel=box(p.distanceTo(q)-.035,1.05,.018,mid.x,.65,mid.z,glass);panel.rotation.y=Math.atan2(-(q.z-p.z),q.x-p.x);panel.castShadow=false;
  rod(V(p.x,1.24,p.z),V(q.x,1.24,q.z),.028,dark);if(i%3===0){cyl(.025,.025,1.26,p.x,.64,p.z,metal);box(.12,.05,.12,p.x,.04,p.z,metal);}
 }
 // Branching supports under the veil.
 for(const x of [-10,10])for(const z of [-7,7]){rod(V(x,0,z),V(x*.97,4.3,z*.98),.21,metal);for(const [dx,dz] of [[-3,-2.8],[3,2.8],[0,-3.2]])rod(V(x*.97,4.1,z*.98),V(x+dx,10.1,z+dz),.115,metal);cyl(.35,.45,.22,x,.1,z,marble);}
 // Perforated roof casts the characteristic dappled light.
 const veilTex=makeTexture(1024,1024,(c,w,h)=>{c.fillStyle='black';c.fillRect(0,0,w,h);c.fillStyle='white';for(let i=0;i<40;i++){c.fillRect(i*26,0,3,h);c.fillRect(0,i*26,w,3);}for(let i=0;i<4000;i++){c.save();c.translate(rnd()*w,rnd()*h);c.rotate(-.5);c.fillRect(0,0,2+rnd()*3,5+rnd()*13);c.restore();}});veilTex.wrapS=veilTex.wrapT=THREE.RepeatWrapping;veilTex.repeat.set(3,3);
 const veilMat=new THREE.MeshStandardMaterial({color:'#c6bc9e',alphaMap:veilTex,alphaTest:.5,side:THREE.DoubleSide,roughness:.7,metalness:.32});const roof=mesh(new THREE.PlaneGeometry(31,27),veilMat,0,10.25,0);roof.rotation.x=-Math.PI/2;roof.customDepthMaterial=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,alphaMap:veilTex,alphaTest:.5});
 for(let x=-14;x<=14;x+=3.5)box(.08,.14,25,x,10,0,metal);for(let z=-12;z<=12;z+=3)box(29,.14,.08,0,10,z,metal);
 // Historic inner facades: long walls, cornices and repeated windows.
 for(const x of [-14,14]){for(const z of [-6.65,6.65])box(.38,8.8,10.7,x,4.4,z,stone);box(.38,5.4,2.6,x,6.1,0,stone);box(.65,.26,24,x,7.7,0,plaster);box(.56,.18,24,x,5.3,0,plaster);
  for(let z=-9;z<=9;z+=4.5){if(z===0)continue;let g=new THREE.Group();g.position.set(x>0?13.78:-13.78,2.3,z);g.rotation.y=x>0?-Math.PI/2:Math.PI/2;scene.add(g);box(1.5,3.3,.08,0,1.65,0,dark,g);for(let dx of [-.75,-.26,.26,.75])box(.045,3.3,.1,dx,1.65,.07,plaster,g);for(let y of [.25,1.15,2.3,3.3])box(1.55,.045,.1,0,y,.08,plaster,g);box(1.78,.16,.18,0,-.08,.04,plaster,g);}
  for(let z=-11;z<=11;z+=4.4){cyl(.21,.25,5.1,x>0?13.6:-13.6,2.55,z,plaster);box(.64,.3,.6,x>0?13.6:-13.6,5.12,z,plaster);}
 }
 // North wall opens directly into the first exhibition.
 box(11.7,7,.4,-8.15,3.5,-12,plaster);box(11.7,7,.4,8.15,3.5,-12,plaster);box(4.6,3,.4,0,5.5,-12,plaster);
 for(let x of [-2.35,2.35])box(.17,4.2,.6,x,2.1,-12,bronze);box(4.85,.17,.6,0,4.2,-12,bronze);
 label('Never Enough Time','GALLERY 03  /  FIVE MEMORIES',4.4,1.05,0,5.35,-11.794,0,{font:72,wallText:true});
 label('A museum of us','TAKE YOUR TIME',3.8,1.25,-7,2.7,-11.794,0,{font:68,wallText:true});
 // South entry and a reference to the restaurant where the evening began.
 box(10,7,.4,-9,3.5,12,plaster);box(3.7,7,.4,5.85,3.5,12,plaster);box(3.7,7,.4,12.15,3.5,12,plaster);box(2.6,3.6,.4,9,5.2,12,plaster);buildSouthGallery(plaster,dark,bronze,wood);box(8,3,.4,0,5.5,12,plaster);
 function portal(x,z,ry,num,title,sub){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=ry;scene.add(g);box(2.7,3.4,.1,0,1.7,0,dark,g);for(let xx of [-1.45,1.45])box(.12,3.65,.18,xx,1.83,.02,bronze,g);box(3,.12,.18,0,3.65,.02,bronze,g);let sign=label(title,sub,2.6,.9,x,2.15,z,ry,{bg:'#353d33',ink:'#e7e2ce',font:75});sign.userData={kind:'future',name:title};interactTargets.push(sign);if(num)label(num,'',1,.45,x+Math.sin(ry)*.02,3.15,z+Math.cos(ry)*.02,ry,{bg:'#353d33',ink:'#c5ba98',font:80});}
 buildSideGallery(1,plaster,dark,bronze,wood,{gallery:2,heading:'OUR SECOND DATE',title:'The Next One',lines:['I was early and nervous, so I bought a','coffee for me and a peach tea for you.','Then I missed you walking right past.','','Sunset among the Supertrees, our first','photo, the perfect bite, dessert at MBS,','and a train I didn’t want to leave.','','Five little moments I kept.']});
 buildSideGallery(-1,plaster,dark,bronze,wood,{gallery:4,heading:'OUR LAST DAY',title:'Every Last Minute',lines:['You came early to make the most of every','last minute. Breakfast, sambal, and a','laptop you were very patient about.','','A quiet ride, a booklet saved for later,','one last hug, and a flight spent','reading every word.','','Five little moments I kept.']});
 portal(-9,11.75,Math.PI,'','National Kitchen','BY VIOLET OON');const nk=interactTargets.at(-1);nk.userData={kind:'kitchen'};
 for(let x of [-4,4]){box(.4,5,10,x,2.5,17,plaster);for(let z of [14,18,21])cyl(.15,.19,4.2,x*.92,2.1,z,marble);}
 box(8,0.25,10,0,5,17,plaster);
 // Gallery 01: warm white walls, timber floor, framed drawings and a bench.
 box(26,4.9,.35,0,2.45,-26.65,plaster);box(.35,4.9,14.6,-12.8,2.45,-19.5,plaster);box(.35,4.9,14.6,12.8,2.45,-19.5,plaster);box(26,.25,15,0,5,-19.4,plaster);
 for(let x of [-11.8,11.8])box(.06,.08,13,x,4.65,-19.5,dark);box(23,.08,.06,0,4.65,-25,dark);
 for(let x of [-8,0,8]){const p=new THREE.PointLight('#fff0d2',19,12,1.5);p.position.set(x,4.2,-20);scene.add(p);}
 const intro=wallIntroTexture(3);const introMesh=mesh(new THREE.PlaneGeometry(2.9,2.9),new THREE.MeshStandardMaterial({map:intro,transparent:true,depthWrite:false,roughness:1,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}),-5,2.3,-12.206);introMesh.rotation.y=Math.PI;introMesh.castShadow=false;introMesh.userData={kind:'intro',gallery:3};interactTargets.push(introMesh);buildTrails();
 box(4.6,.13,.9,0,.6,-21,wood);for(let x of [-1.85,1.85])box(.13,.55,.66,x,.28,-21,dark);
 const frame=mat('#473e2d',.47),paper=mat('#f4edda');
 memories.forEach((m,i)=>{const g=new THREE.Group();g.position.set(...m.pos);g.rotation.y=m.ry;scene.add(g);box(3.76,2.7,.12,0,0,0,frame,g);box(3.6,2.54,.03,0,0,.075,paper,g);// Show plain ivory paper until the drawing arrives, rather than a black rectangle.
  const artMat=new THREE.MeshBasicMaterial({color:'#e9e1cc'});loader.load(`./assets/memory-${i+1}.jpg`,tex=>{tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=8;artMat.map=tex;artMat.color.set('#ffffff');artMat.needsUpdate=true;});const picture=mesh(new THREE.PlaneGeometry(3.23,2.15),artMat,0,.02,.1,g);picture.userData={kind:'memory',index:i};artTargets.push(picture);interactTargets.push(picture);
  // Small, matte museum label mounted beside each frame, at reading height.
  const cardTex=makeTexture(768,600,(c,w,h)=>{
    c.fillStyle='#30342e';c.fillRect(0,0,w,h);
    c.textBaseline='top';c.fillStyle='#bdbfae';c.font='21px Arial';
    c.fillText(`GALLERY ${pad(galleryOf(i))}  /  ${pad(inGallery(i)+1)}`,54,55);
    function lines(text,y,font,lineHeight,color){
      c.font=font;c.fillStyle=color;let line='';
      for(const word of text.split(' ')){const candidate=line?line+' '+word:word;if(c.measureText(candidate).width>w-108&&line){c.fillText(line,54,y);y+=lineHeight;line=word;}else line=candidate;}
      if(line)c.fillText(line,54,y);return y+lineHeight;
    }
    let y=lines(m.title,113,'bold 36px Arial',44,'#f1eee3');
    y=lines('Ink on paper · A memory',y+14,'22px Arial',32,'#c0c3b4');
    // Captions are short poems: keep their line breaks, with half-height gaps between verses.
    y+=26;for(const verse of m.caption.split('\n')){if(!verse.trim()){y+=14;continue;}y=lines(verse,y,'24px Arial',30,'#e5e4d8');}
  });
  const cardBacking=box(.58,.453125,.014,2.32,1.48-m.pos[1],-.065,mat('#30342e',1),g);
  const lab=mesh(new THREE.PlaneGeometry(.58,.453125),new THREE.MeshStandardMaterial({map:cardTex,roughness:1,metalness:0}),2.32,1.48-m.pos[1],-.05,g);
  lab.castShadow=false;lab.userData={kind:'memory',index:i};cardBacking.userData={kind:'memory',index:i};interactTargets.push(lab,cardBacking);
  let lp=V(0,2.1,1.5).applyAxisAngle(V(0,1,0),m.ry).add(V(...m.pos));const spot=new THREE.SpotLight('#ffefc9',34,10,Math.PI/5,.65,1.5);spot.position.copy(lp);spot.target=picture;scene.add(spot);const fixture=cyl(.12,.12,.3,lp.x,lp.y,lp.z,dark);fixture.rotation.x=.5;
 });
 // Exterior is a compact architectural impression of the museum frontage.
 const facade=mat('#cfcdc2'),copper=mat('#91b1a0',.65,.35);for(let side of [-1,1])box(18,11,.5,side*13,5.5,22.4,facade);box(8,6.5,.5,0,7.75,22.4,facade);
 for(let x=-21;x<=21;x+=3){if(Math.abs(x)<4)continue;cyl(.24,.32,7.8,x,6.2,23.15,plaster);box(.95,.4,.95,x,10.2,23.15,plaster);box(.8,.3,.8,x,2.25,23.15,plaster);box(1.35,5,.06,x,6,22.7,dark);}
 box(45,.4,1.7,0,10.65,22.7,plaster);box(45,.25,1.3,0,11.35,22.7,plaster);label('NATIONAL GALLERY','S I N G A P O R E',7,1.2,0,6.4,22.72,0,{font:67});
 cyl(3.1,3.1,2.2,-14,12.4,19,stone,scene,48);const greenDome=mesh(new THREE.SphereGeometry(3.15,48,24,0,Math.PI*2,0,Math.PI/2),copper,-14,13.5,19);greenDome.scale.y=.9;cyl(.33,.45,.9,-14,16.6,19,stone);mesh(new THREE.SphereGeometry(.4,16,12),copper,-14,17.05,19);
 for(let i=0;i<12;i++){let a=i*Math.PI/6;rod(V(-14+Math.cos(a)*3.15,13.5,19+Math.sin(a)*3.15),V(-14+Math.cos(a)*.4,16.3,19+Math.sin(a)*.4),.025,bronze);}
 // Bollards and planted edges keep the exterior route legible.
 const green=mat('#53644a');for(let x of [-22,22]){box(2,.7,9,x,.35,29,stone);for(let z=26;z<=32;z+=1.4)mesh(new THREE.SphereGeometry(.85,12,10),green,x,1.05,z);}
 for(let x=-20;x<=20;x+=3)cyl(.1,.14,.7,x,.35,34.5,stone);
 marker=mesh(new THREE.RingGeometry(.12,.23,40),new THREE.MeshBasicMaterial({color:'#f7f0c9',transparent:true,opacity:.8,side:THREE.DoubleSide}),0,.02,0);marker.rotation.x=-Math.PI/2;marker.visible=false;marker.castShadow=false;
}

function toast(message){$('#toast').textContent=message;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),3800);}
function openDialog(id){if(id!=='#memory'){state.tour=false;$('#tourStatus').hidden=true;}state.keys.clear();state.path=[];marker&&(marker.visible=false);$(id).showModal();}
function hasDialog(){return !!document.querySelector('dialog[open]');}
function updateSeen(){document.querySelectorAll('.viewed-count').forEach(e=>{const g=+(e.dataset.gallery||1);const n=[...state.seen].filter(i=>i<memories.length&&galleryOf(i)===g).length;e.textContent=`${n} OF 5 MEMORIES VISITED`;});}
function openMemory(i){state.current=Math.max(0,Math.min(memories.length-1,i));const g=galleryOf(state.current),k=inGallery(state.current);const m=memories[state.current];state.seen.add(state.current);try{localStorage.setItem('detour-seen-v1',JSON.stringify([...state.seen]));}catch{}updateSeen();$('#memoryImage').src=`./assets/memory-${state.current+1}.jpg`;$('#memoryImage').alt=m.alt;$('#memoryNumber').textContent=`GALLERY ${pad(g)} · MEMORY ${pad(k+1)} / 05`;$('#memoryGallery').textContent=galleries[g].title;$('#memoryTitle').textContent=m.title;$('#memoryCaption').textContent=m.caption;if(!$('#memory').open)openDialog('#memory');}
function start(){state.started=true;$('#welcome').hidden=true;$('#hud').hidden=false;canvas.focus();if(!state.entered){state.entered=true;setView(0,31,0,.06);if(touch)$('#tourChoice').hidden=false;else toast('Walk in whenever you’re ready.');}}
function setView(x,z,yaw,pitch=0){state.area=undefined;hideTrail();gait.phase=0;gait.intensity=0;camera.position.set(x,1.7,z);state.yaw=state.targetYaw=yaw;state.pitch=state.targetPitch=pitch;state.path=[];marker.visible=false;}
function go(where){document.querySelectorAll('dialog[open]').forEach(d=>d.close());autopilotOff();state.entered=true;if(!state.started)start();state.tour=false;$('#tourStatus').hidden=true;if(where==='gallery'){setView(9,14.4,Math.PI,.015);toast('Gallery 01 · Five little moments I kept.');}else if(where==='gallery2'){setView(17.6,0,-Math.PI/2,.015);toast('Gallery 02 · Five little moments I kept.');}else if(where==='gallery3'){setView(0,-15,0,.015);toast('Gallery 03 · Five little moments I kept.');}else if(where==='gallery4'){setView(-17.6,0,Math.PI/2,.015);toast('Gallery 04 · Five little moments I kept.');}else if(where==='outside'){setView(8,32,.43,.13);}else{setView(8.3,9.4,.62,.04);}}
function interact(obj){const d=obj.userData;if(d.kind==='memory')openMemory(d.index);else if(d.kind==='intro')openDialog(d.gallery>1?`#story${d.gallery}`:'#story');else if(d.kind==='kitchen')toast('The evening began here—with a waitlist instead of a reservation.');else toast(`${d.name}: a story still to come.`);}
function beginTour(g=1){autopilotOff();document.querySelectorAll('dialog[open]').forEach(d=>d.close());go(g>1?`gallery${g}`:'gallery');state.tour=true;state.tourIndex=galleries[g].start;$('#tourStatus').hidden=false;nextTour();}
function nextTour(){if(!state.tour)return;const m=memories[state.tourIndex];$('#tourText').textContent=`A gentle tour · ${inGallery(state.tourIndex)+1} of 5`;state.path=findPath(camera.position,m.view);state.tourPending=true;}
// Autopilot: flies between galleries, walks within them, reads each wall introduction first,
// then eases up to every drawing so it ends centred, as a visitor would.
// On narrow (portrait) screens, stand closer so the work fills the width.
const narrow=()=>innerWidth<innerHeight;
const standPoint=i=>standPointFor(memories[i].pos,memories[i].ry,narrow()?3.7:4.2)||memories[i].view;
const introSpots={1:{pos:[14,2.3,13.506],ry:0},2:{pos:[16.306,2.3,-5],ry:Math.PI/2},3:{pos:[-5,2.3,-12.206],ry:Math.PI},4:{pos:[-16.306,2.3,5],ry:-Math.PI/2}};
const introStand=g=>standPointFor(introSpots[g].pos,introSpots[g].ry,narrow()?2.6:4);
const wrapAngle=a=>Math.atan2(Math.sin(a),Math.cos(a));
const smoothstep=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
const lookAngles=(from,look)=>{const dx=look[0]-from.x,dz=look[2]-from.z;return {yaw:Math.atan2(-dx,-dz),pitch:Math.atan2(look[1]-1.7,Math.hypot(dx,dz))};};
function setAutoButton(on){$('#autopilotBtn').setAttribute('aria-pressed',String(on));$('#autopilotBtn').classList.toggle('on',on);}
function hidePrompt(){$('#autoPrompt').hidden=true;document.body.classList.remove('prompting');}
function showPrompt(kicker,title,text,primary,secondary,onPrimary,onSecondary){
 $('#autoKicker').textContent=kicker;$('#autoTitle').textContent=title;$('#autoText').textContent=text;
 $('#autoPrimary').textContent=primary;$('#autoPrimary').onclick=onPrimary;
 $('#autoSecondary').textContent=secondary;$('#autoSecondary').onclick=onSecondary;$('#autoSecondary').hidden=!secondary;
 $('#autoPrompt').hidden=false;document.body.classList.add('prompting');
}
// Round off route corners (Chaikin), keeping only shortcuts that stay clear of walls.
function smoothRoute(pts){
 for(let pass=0;pass<2;pass++){const out=[pts[0]];for(let k=0;k<pts.length-1;k++){const a=pts[k],b=pts[k+1];if(k>0)out.push({x:a.x*.75+b.x*.25,z:a.z*.75+b.z*.25});if(k<pts.length-2)out.push({x:a.x*.25+b.x*.75,z:a.z*.25+b.z*.75});}out.push(pts.at(-1));
  if(out.every((q,k)=>!k||hasClearPath(out[k-1],q)))pts=out;else break;}
 return pts;
}
function planMove(dest,look,fly){
 const here={x:camera.position.x,z:camera.position.z},path=findPath(here,dest);
 const pts=smoothRoute([here,...(path.length?path:[dest])]),cum=[0];
 for(let k=1;k<pts.length;k++)cum.push(cum[k-1]+Math.hypot(pts[k].x-pts[k-1].x,pts[k].z-pts[k-1].z));
 state.mover={pts,cum,len:cum.at(-1),s:0,v:0,fly,look};state.auto='moving';state.path=[];marker.visible=false;
}
function pointAt(m,s){s=Math.max(0,Math.min(m.len,s));let k=1;while(k<m.cum.length-1&&m.cum[k]<s)k++;const a=m.pts[k-1],b=m.pts[k],t=(s-m.cum[k-1])/Math.max(1e-6,m.cum[k]-m.cum[k-1]);return {x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t};}
function autoGoTo(target){
 // target: {kind:'intro',g} or {kind:'art',i}. Fly whenever the target is in another room.
 state.autoTarget=target;hidePrompt();
 const dest=target.kind==='intro'?introStand(target.g):standPoint(target.i);
 const look=target.kind==='intro'?introSpots[target.g].pos:[memories[target.i].pos[0],memories[target.i].pos[1]+.02,memories[target.i].pos[2]];
 const g=target.kind==='intro'?target.g:galleryOf(target.i);
 planMove(dest,look,roomAt(camera.position.x,camera.position.z)!==g);
}
function autopilotOn(){
 if(!state.started)start();$('#tourChoice').hidden=true;$('#stickHint').hidden=true;
 state.tour=false;$('#tourStatus').hidden=true;
 let best=0,bestLen=Infinity;const here={x:camera.position.x,z:camera.position.z};
 memories.forEach((m,i)=>{const p=standPoint(i),path=findPath(here,p);if(!path.length&&Math.hypot(p.x-here.x,p.z-here.z)>.05)return;let len=0,a=here;for(const q of path){len+=Math.hypot(q.x-a.x,q.z-a.z);a=q;}if(len<bestLen){bestLen=len;best=i;}});
 setAutoButton(true);toast('Autopilot on. Walk or click the floor any time to take over.');
 const g=galleryOf(best);
 // Arriving from outside a gallery? Read its wall introduction first.
 autoGoTo(roomAt(camera.position.x,camera.position.z)===g?{kind:'art',i:best}:{kind:'intro',g});
}
function autopilotOff(message){
 if(!state.auto)return;state.auto=null;state.mover=null;state.flying=false;state.autoLift=0;if(camera.fov!==baseFov()){camera.fov=baseFov();camera.updateProjectionMatrix();}state.path=[];marker.visible=false;hidePrompt();setAutoButton(false);if(message)toast(message);
}
function autoArrived(){
 const t=state.autoTarget;state.auto='arrived';
 if(t.kind==='intro'){const g=t.g;showPrompt(`AUTOPILOT  ·  GALLERY ${pad(g)}  ·  INTRODUCTION`,galleries[g].title,'Read the wall, then walk on to the first drawing.','Continue →','Read the full story',()=>autoGoTo({kind:'art',i:galleries[g].start}),()=>openDialog(g>1?`#story${g}`:'#story'));return;}
 const i=t.i,g=galleryOf(i),k=inGallery(i);
 showPrompt(`AUTOPILOT  ·  GALLERY ${pad(g)}  ·  ${k+1} OF 5`,memories[i].title,'Take your time.','Continue →','Read this memory',autoContinue,()=>openMemory(i));
}
function autoContinue(){
 const i=state.autoTarget.i,g=galleryOf(i);
 if(inGallery(i)<4){autoGoTo({kind:'art',i:i+1});return;}
 state.auto='gallery';
 if(g<4)showPrompt(`GALLERY ${pad(g)}  ·  ALL FIVE SEEN`,`Walk on to Gallery ${pad(g+1)}?`,galleries[g+1].title,'Yes, take me there →','Not yet',()=>autoGoTo({kind:'intro',g:g+1}),()=>autopilotOff('Autopilot off. Turn it on again whenever you like.'));
 else showPrompt('ALL FOUR GALLERIES','That’s every memory.','Thank you for taking your time.','Take me to the way out →','Stay here',()=>{hidePrompt();state.autoTarget={kind:'exit'};planMove({x:0,z:16},null,true);},()=>autopilotOff());
}
function updateAutopilot(dt){
 const m=state.mover;
 if(state.auto==='moving'&&m){
  const vmax=m.fly?13:2.2,acc=m.fly?7:1.3,remaining=m.len-m.s;
  const cap=Math.min(vmax,Math.sqrt(2*acc*Math.max(0,remaining))+.05);
  m.v=Math.min(cap,m.v+acc*dt);m.s=Math.min(m.len,m.s+m.v*dt);
  const p=pointAt(m,m.s);camera.position.x=p.x;camera.position.z=p.z;
  const progress=m.len>0?m.s/m.len:1,calm=reduced||!$('#walkingMotion').checked;state.flying=m.fly;state.autoLift=m.fly&&!calm?Math.sin(Math.PI*progress)*1.0:0;
  const fov=baseFov()+(m.fly&&!calm?9*Math.sin(Math.PI*progress):0);if(Math.abs(camera.fov-fov)>.01){camera.fov=fov;camera.updateProjectionMatrix();}
  // Look where you're going, then let the gaze drift to the work over the last few metres.
  const ahead=pointAt(m,m.s+Math.max(2.5,m.v*.7)),dx=ahead.x-p.x,dz=ahead.z-p.z;
  let yaw=Math.hypot(dx,dz)>.05?Math.atan2(-dx,-dz):state.targetYaw,pitch=m.fly?-.02:.02;
  if(m.look){const a=lookAngles(p,m.look),w=smoothstep((5.5-remaining)/4.5);yaw+=wrapAngle(a.yaw-yaw)*w;pitch+=(a.pitch-pitch)*w;}
  const k=1-Math.exp(-dt*(m.fly?2.6:3.2));state.targetYaw+=wrapAngle(yaw-state.targetYaw)*k;state.targetPitch+=(pitch-state.targetPitch)*k;
  if(m.s>=m.len-1e-4){state.flying=false;state.autoLift=0;if(camera.fov!==baseFov()){camera.fov=baseFov();camera.updateProjectionMatrix();}
   if(m.look)state.auto='settling';else{autopilotOff('Thank you for visiting.');}}
 }
 if(state.auto==='settling'){
  const a=lookAngles(camera.position,m.look),k=1-Math.exp(-dt*3);
  const dy=wrapAngle(a.yaw-state.targetYaw),dp=a.pitch-state.targetPitch;
  state.targetYaw+=dy*k;state.targetPitch+=dp*k;
  if(Math.abs(dy)<.004&&Math.abs(dp)<.004&&Math.abs(wrapAngle(state.targetYaw-state.yaw))<.004){state.targetYaw+=dy;state.targetPitch+=dp;autoArrived();}
 }
}
function closeMenuIfOpen(){const menu=$('#galleryMenu');if(menu.classList.contains('open')){menu.classList.remove('open');$('#galleryShortcut').setAttribute('aria-expanded','false');}}
// Touch controls in the style of mobile games: a floating joystick under the left thumb,
// swipe anywhere else to look, tap to walk or to open a drawing.
function wireTouch(){
 const zone=$('#stickZone'),base=$('#stickBase'),knob=$('#stickKnob');let id=null,ox=0,oy=0,moved=0,t0=0,last=null;
 const reset=()=>{id=null;state.stick=null;zone.classList.remove('active');base.style.transform='';knob.style.transform='';};
 zone.addEventListener('pointerdown',e=>{if(!state.started||hasDialog()||id!==null)return;e.preventDefault();closeMenuIfOpen();id=e.pointerId;zone.setPointerCapture(id);ox=e.clientX;oy=e.clientY;moved=0;t0=performance.now();last=e;
  const r=zone.getBoundingClientRect();base.style.transform=`translate(${ox-r.left}px,${oy-r.top}px)`;zone.classList.add('active');});
 zone.addEventListener('pointermove',e=>{if(e.pointerId!==id)return;last=e;const dx=e.clientX-ox,dy=e.clientY-oy;moved=Math.max(moved,Math.hypot(dx,dy));const v=stickVector(dx,dy);knob.style.transform=`translate(${v.knobX}px,${v.knobY}px)`;
  if(v.mag>0){if(!state.stick||!state.stick.mag){state.path=[];marker.visible=false;if(state.auto)autopilotOff('Autopilot paused. Tap Autopilot to carry on.');if(state.tour){state.tour=false;$('#tourStatus').hidden=true;}state.coached=true;$('#stickHint').hidden=true;}}
  state.stick=v;});
 const end=e=>{if(e.pointerId!==id)return;const tap=moved<12&&performance.now()-t0<350;reset();if(tap&&e.type==='pointerup')clickWorld(e);};
 zone.addEventListener('pointerup',end);zone.addEventListener('pointercancel',end);
 document.addEventListener('pointerdown',e=>{if(!e.target.closest('#galleryMenu'))closeMenuIfOpen();});
 $('#tourChoiceAuto').onclick=()=>{$('#tourChoice').hidden=true;autopilotOn();};
 $('#tourChoiceSelf').onclick=()=>{$('#tourChoice').hidden=true;if(innerHeight>innerWidth)setTimeout(()=>toast('Tip: turn your phone sideways for a wider view.'),6400);if(touch&&!state.coached){$('#stickHint').hidden=false;setTimeout(()=>$('#stickHint').hidden=true,6000);}};
}
function wireUI(){
 $('#walkingMotion').checked=!reduced;
 const introButton=document.createElement('button');introButton.className='text-button';introButton.style.marginTop='18px';introButton.textContent='Read the gallery introduction ↗';introButton.onclick=()=>{$('#directory').close();openDialog('#story');};$('#directory .active').after(introButton);[2,3,4].forEach(g=>{const b=introButton.cloneNode(true);b.onclick=()=>{$('#directory').close();openDialog(`#story${g}`);};$(`#directory [data-go="gallery${g}"]`).after(b);});$('#storyMemories').onclick=()=>{$('#story').close();openMemory(0);};$('#enter').onclick=start;$('#home').onclick=()=>{autopilotOff();$('#welcome').hidden=false;$('#hud').hidden=true;state.started=false;state.path=[];state.keys.clear();state.tour=false;$('#tourStatus').hidden=true;};$('#directoryBtn').onclick=()=>openDialog('#directory');$('#helpBtn').onclick=()=>openDialog('#help');const menu=$('#galleryMenu'),setMenu=open=>{menu.classList.toggle('open',open);$('#galleryShortcut').setAttribute('aria-expanded',String(open||menu.matches(':hover')));};$('#galleryShortcut').onclick=()=>setMenu(!menu.classList.contains('open'));menu.addEventListener('mouseenter',()=>$('#galleryShortcut').setAttribute('aria-expanded','true'));menu.addEventListener('mouseleave',()=>setMenu(false));menu.addEventListener('keydown',e=>{if(e.key==='Escape'){setMenu(false);canvas.focus();}});menu.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>{setMenu(false);b.blur();canvas.focus();}));
 document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>go(b.dataset.go));document.querySelectorAll('dialog .close').forEach(b=>b.onclick=()=>b.closest('dialog').close());
 document.querySelectorAll('dialog').forEach(d=>{d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}});d.addEventListener('close',()=>{state.keys.clear();canvas.focus();});});
 $('#interact').onclick=()=>state.near&&interact(state.near);
 $('#autopilotBtn').onclick=()=>state.auto?autopilotOff('Autopilot off. Turn it on again whenever you like.'):autopilotOn();$('#autoStop').onclick=()=>autopilotOff('Autopilot off. Turn it on again whenever you like.');$('#guided').onclick=()=>beginTour(1);[2,3,4].forEach(g=>{$(`#guided${g}`).onclick=()=>beginTour(g);$(`#readAll${g}`).onclick=()=>{$('#help').close();state.tour=false;openMemory(galleries[g].start);};$(`#storyMemories${g}`).onclick=()=>{$(`#story${g}`).close();openMemory(galleries[g].start);};});$('#stopTour').onclick=()=>{state.tour=false;state.path=[];$('#tourStatus').hidden=true;};$('#readAll').onclick=()=>{$('#help').close();state.tour=false;openMemory(0);};$('#fallbackRead').onclick=()=>openMemory(0);
 $('#memory').addEventListener('close',()=>{if(state.tour){if(inGallery(state.tourIndex)<4){state.tourIndex++;nextTour();}else{state.tour=false;$('#tourStatus').hidden=true;toast('Five moments. Thank you for being part of them.');}}});
 $('#sound').onchange=e=>{state.sound=e.target.checked;if(state.sound){try{footAudio??=new AudioContext();footAudio.resume();}catch{state.sound=false;e.target.checked=false;}}};
 addEventListener('keydown',e=>{if(hasDialog())return;const k=e.key.toLowerCase();if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright',' '].includes(k)){if(!state.started)return;e.preventDefault();state.keys.add(k);if(k!==' '){state.path=[];if(state.auto)autopilotOff('Autopilot paused. Turn it on again any time.');}if(state.tour){state.tour=false;$('#tourStatus').hidden=true;}}if(k==='m'){e.preventDefault();openDialog('#directory');}if(k==='p'&&state.started){e.preventDefault();state.auto?autopilotOff('Autopilot off. Turn it on again whenever you like.'):autopilotOn();}if(k==='enter'&&!$('#autoPrompt').hidden&&document.activeElement?.closest?.('#autoPrompt')==null){e.preventDefault();$('#autoPrimary').click();}if(k==='e'&&state.started&&state.near)interact(state.near);});
 addEventListener('keyup',e=>state.keys.delete(e.key.toLowerCase()));addEventListener('blur',()=>state.keys.clear());document.addEventListener('visibilitychange',()=>{state.keys.clear();clock?.getDelta();});
 canvas.addEventListener('pointerdown',e=>{if(!state.started||hasDialog()||(state.drag&&e.pointerId!==state.dragId))return;closeMenuIfOpen();state.dragId=e.pointerId;state.drag=true;state.moved=0;state.pointerX=e.clientX;state.pointerY=e.clientY;canvas.setPointerCapture(e.pointerId);});
 canvas.addEventListener('pointermove',e=>{if(!state.drag||e.pointerId!==state.dragId)return;const dx=e.clientX-state.pointerX,dy=e.clientY-state.pointerY;state.pointerX=e.clientX;state.pointerY=e.clientY;state.moved+=Math.abs(dx)+Math.abs(dy);const k=e.pointerType==='touch'?1.35:1,look=lookFromDrag(state.targetYaw,state.targetPitch,dx*k,dy*k);state.targetYaw=look.yaw;state.targetPitch=look.pitch;});
 canvas.addEventListener('pointerup',e=>{if(!state.drag||e.pointerId!==state.dragId)return;state.drag=false;if(state.moved<(e.pointerType==='touch'?12:7))clickWorld(e);});canvas.addEventListener('pointercancel',e=>{if(e.pointerId===state.dragId)state.drag=false;});
 wireTouch();
 addEventListener('resize',()=>{if(!renderer)return;camera.aspect=innerWidth/innerHeight;if(!state.flying)camera.fov=baseFov();camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});updateSeen();
}
const ray=new THREE.Raycaster();
function clickWorld(e){ray.setFromCamera(new THREE.Vector2(e.clientX/innerWidth*2-1,-e.clientY/innerHeight*2+1),camera);let arts=ray.intersectObjects(interactTargets);const solid=ray.intersectObjects(worldMeshes.filter(o=>!o.material.transparent))[0];if(arts[0]&&arts[0].distance<16&&(!solid||solid.distance>=arts[0].distance-.04)){interact(arts[0].object);return;}const hit=ray.intersectObjects(floorTargets)[0];if(!hit||(solid&&solid.distance<hit.distance-.04))return;const p=hit.point;if(!walkable(p.x,p.z)){toast('Try a little further along the walkway.');return;}if(state.auto)autopilotOff('Autopilot paused. Turn it on again any time.');state.path=findPath(camera.position,p);if(state.path.length){marker.position.set(p.x,.03,p.z);marker.visible=true;state.tour=false;$('#tourStatus').hidden=true;}else toast('You’re already here.');}
function footstep(time){if(!state.sound||!footAudio||time-lastFoot<.24)return;lastFoot=time;const gain=footAudio.createGain(),osc=footAudio.createOscillator();osc.type='sine';osc.frequency.setValueAtTime(100,footAudio.currentTime);osc.frequency.exponentialRampToValueAtTime(42,footAudio.currentTime+.09);gain.gain.setValueAtTime(.035,footAudio.currentTime);gain.gain.exponentialRampToValueAtTime(.0001,footAudio.currentTime+.12);osc.connect(gain).connect(footAudio.destination);osc.start();osc.stop(footAudio.currentTime+.13);}
function move(dx,dz){const p=camera.position,bx=p.x,bz=p.z;if(walkable(p.x+dx,p.z))p.x+=dx;if(walkable(p.x,p.z+dz))p.z+=dz;return Math.hypot(p.x-bx,p.z-bz)>.0001;}
function update(dt,time){
 if(!state.started||hasDialog())return;
 const beforeX=camera.position.x,beforeZ=camera.position.z;
 let moving=false;const speed=WALK_SPEED*(1+.035*Math.cos(gait.phase))*dt;
 let {forward:f,sideways:s}=movementAxes(state.keys),analog=1,pace=walkingPace(state.keys);
 if(state.stick&&state.stick.mag>0){f=-state.stick.y;s=state.stick.x;analog=Math.min(1,state.stick.mag*1.1);pace=1;}
 if(f||s){const keyboardSpeed=speed*pace*analog;let len=Math.hypot(f,s);moving=move((-Math.sin(state.yaw)*f+Math.cos(state.yaw)*s)*keyboardSpeed/len,(-Math.cos(state.yaw)*f-Math.sin(state.yaw)*s)*keyboardSpeed/len);marker.visible=false;}
 if(state.path.length){const p=state.path[0],dx=p.x-camera.position.x,dz=p.z-camera.position.z,d=Math.hypot(dx,dz);if(d<.015)state.path.shift();else{const stride=Math.min(speed,d);moving=move(dx/d*stride,dz/d*stride);if(!state.drag){const look=routeLookAhead(camera.position,state.path),lx=look.x-camera.position.x,lz=look.z-camera.position.z;if(Math.hypot(lx,lz)>.08){const desired=Math.atan2(-lx,-lz),turn=Math.atan2(Math.sin(desired-state.targetYaw),Math.cos(desired-state.targetYaw));state.targetYaw+=Math.max(-dt*.85,Math.min(dt*.85,turn*(1-Math.exp(-dt*2.5))));}}}}else{marker.visible=false;updateAutopilot(dt);if(state.tour&&state.tourPending){state.tourPending=false;const m=memories[state.tourIndex];state.targetYaw=Math.atan2(camera.position.x-m.pos[0],camera.position.z-m.pos[2]);state.yaw=state.targetYaw;openMemory(state.tourIndex);}}
 const distance=Math.hypot(camera.position.x-beforeX,camera.position.z-beforeZ);
 const strideMotion=advanceGait(gait,state.flying?0:distance,dt,$('#walkingMotion').checked&&!state.flying);
 if(strideMotion.footfall)footstep(time);
 camera.position.y=1.7+strideMotion.height+(state.autoLift||0);
 const smooth=$('#gentle').checked&&!reduced?Math.min(1,dt*16):1;state.yaw+=(state.targetYaw-state.yaw)*smooth;state.pitch+=(state.targetPitch-state.pitch)*smooth;camera.rotation.set(state.pitch+strideMotion.pitch,state.yaw,strideMotion.roll,'YXZ');
 const z=camera.position.z,room=roomAt(camera.position.x,z),inG1=room===1,inG2=room===2,inG3=room===3,inG4=room===4,inside=room>0;let title=inG4?'Every Last Minute':inG3?'Never Enough Time':inG2?'The Next One':inG1?'Worth the Detour':z>22?'Outside the Gallery':z>12?'The entrance hall':'The dome walkway';$('#locationTitle').textContent=title;$('#locationKicker').textContent=inG4?'GALLERY 04':inG3?'GALLERY 03':inG2?'GALLERY 02':inG1?'GALLERY 01':'THE MUSEUM';$('#locationSub').textContent=inside?'Five little moments I kept.':'A little room to wander.';
 const area=room||(z>22.6?-1:z>12?-2:0);if(state.area!==undefined&&area!==state.area){if(room)hideTrail();else if(area===0&&state.area>0&&!state.auto){showTrail(state.area);toast(state.area<4?`Gallery ${pad(state.area+1)} is next, just to your right.`:'That’s all four. The way out is just ahead.');}else if(area===0&&state.area===-2&&!state.walkedIn){state.walkedIn=true;if(!state.auto)showTrail(0);if(!state.auto)toast('Gallery 01 is on your right, beside the way you came in.');}}state.area=area;updateTrail(dt);const here=inG4?'gallery4':inG3?'gallery3':inG2?'gallery2':inG1?'gallery':z<=12?'walkway':'';if(here!==state.here){state.here=here;document.querySelectorAll('#galleryOptions [data-go]').forEach(b=>b.toggleAttribute('aria-current',b.dataset.go===here));}
 ray.setFromCamera(new THREE.Vector2(0,0),camera);const hits=ray.intersectObjects(interactTargets);state.near=hits[0]&&hits[0].distance<5.5?hits[0].object:null;$('#interact').hidden=!state.near||!!state.auto;if(state.near)$('#interactText').textContent=state.near.userData.kind==='memory'?'Read this memory':'Take a closer look';
}
function loop(){frameId=requestAnimationFrame(loop);const raw=clock.getDelta(),dt=Math.min(raw,.05);update(dt,clock.elapsedTime);renderer.render(scene,camera);adaptResolution(raw);}
function adaptResolution(raw){const p=state.perf||(state.perf={t:0,n:0,sum:0});if(document.hidden||raw>.5)return;p.t+=raw;p.n++;p.sum+=raw;if(p.t<2)return;const avg=p.sum/p.n;p.t=p.n=p.sum=0;let r=state.pixelRatio;if(avg>1/38&&r>.75)r=Math.max(.75,r-.25);else if(avg<1/57&&r<state.pixelCap)r=Math.min(state.pixelCap,r+.25);if(r!==state.pixelRatio){state.pixelRatio=r;renderer.setPixelRatio(r);renderer.setSize(innerWidth,innerHeight);}}
function fail(error){console.error(error);$('#loading').hidden=true;$('#welcome').hidden=true;$('#hud').hidden=true;$('#fallback').hidden=false;}
wireUI();
try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});renderer.setSize(innerWidth,innerHeight);state.pixelCap=touch?Math.min(devicePixelRatio,1.5):Math.min(devicePixelRatio,1.65);state.pixelRatio=state.pixelCap;renderer.setPixelRatio(state.pixelRatio);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1;renderer.outputColorSpace=THREE.SRGBColorSpace;buildWorld();camera.rotation.set(state.pitch,state.yaw,0,'YXZ');clock=new THREE.Clock();loop();setTimeout(()=>{$('#loading').style.opacity='0';setTimeout(()=>$('#loading').hidden=true,750);},500);canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(frameId);fail(new Error('WebGL context lost'));});}catch(error){fail(error);}
