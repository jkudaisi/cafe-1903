import {rig,canvasTex,envMap} from './rig.js';
import * as THREE from 'three';
const S=window.SITE;
// bell sound (WebAudio, only after a tap)
let ac=null;const ding=()=>{if(!ac)return;const t=ac.currentTime;const out=ac.createGain();out.gain.value=.35;out.connect(ac.destination);
 for(const [f,a,d] of[[523,1,2.6],[1046,.5,1.8],[1254,.35,1.4],[1568,.25,1],[2093,.15,.7]]){const o=ac.createOscillator(),g=ac.createGain();o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(a,t+.005);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g).connect(out);o.start(t);o.stop(t+d)}};
let bellImpulse=0;
const ringBtn=document.getElementById('ring');
ringBtn&&ringBtn.addEventListener('click',()=>{try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();ac.resume()}catch(e){}bellImpulse=1;ding();ringBtn.animate([{transform:'rotate(-4deg)'},{transform:'rotate(4deg)'},{transform:'none'}],{duration:300})});
addEventListener('step',e=>{if(e.detail===1){bellImpulse=1;ding()}});
const cv=document.getElementById('scene');
if(cv&&!S.lite){
const keys=[
 {p:[12,4.6,24],l:[0,6,0]},
 {p:[4.2,10.8,9.5],l:[0,11.4,0]},
 {p:[-3.2,2.7,10],l:[-3.2,2.6,0]},
 {p:[-3.2,2.3,-1.4],l:[-3.3,1.6,-7]},
 {p:[0.6,2.1,-2.6],l:[2.4,1.25,-6.2]},
];
const A=rig(cv,{keys,fov:46,bg:0x1b2233,fog:new THREE.Fog(0x1b2233,30,90),exposure:1.05});
const {scene}=A;const ENV=envMap(THREE,A.r);
const M=(c,o={})=>new THREE.MeshStandardMaterial({color:c,roughness:.8,...o});
const add=(g,m,x,y,z,par=scene,sh=true)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=sh;o.receiveShadow=true;par.add(o);return o};
const box=(w,h,d)=>new THREE.BoxGeometry(w,h,d);
const brick=canvasTex(THREE,256,256,(g,w,h)=>{g.fillStyle='#d8cbb5';g.fillRect(0,0,w,h);const bh=16,bw=48;for(let r=0;r<h/bh;r++)for(let c=-1;c<w/bw+1;c++){const x=c*bw+(r%2?bw/2:0);g.fillStyle=`hsl(${8+Math.random()*8},${45+Math.random()*12}%,${30+Math.random()*9}%)`;g.fillRect(x+1.5,r*bh+1.5,bw-3,bh-3)}},[1,1]);
brick.repeat.set(.42,.42);
const brickM=M(0xffffff,{map:brick,roughness:.9}),cream=M(0xefe5d2,{roughness:.6}),red=M(0xb3261e,{roughness:.45}),brass=M(0xc79a3e,{metalness:.9,roughness:.28,envMap:ENV}),glass=M(0xffd391,{emissive:0xffa64d,emissiveIntensity:1.1,roughness:.3});
// ground
const gr=add(new THREE.PlaneGeometry(200,200),M(0x2a2a2c,{roughness:1}),0,0,0,scene,false);gr.rotation.x=-Math.PI/2;
add(box(60,.12,7),M(0x8d877c),0,.06,4.2,scene,false);// sidewalk
add(box(60,.02,10),M(0x1f1f22,{roughness:.6}),0,.01,12.6,scene,false);
for(let x=-28;x<30;x+=4)add(box(2,.03,.15),M(0xe6d38a),x,.03,12.6,scene,false);
// facade shape with arched bay holes + upper windows
const FW=14,FH=9;const sh=new THREE.Shape();sh.moveTo(-FW/2,0);sh.lineTo(FW/2,0);sh.lineTo(FW/2,FH);sh.lineTo(-FW/2,FH);sh.lineTo(-FW/2,0);
const arch=(cx,w,h0,y0=0)=>{const p=new THREE.Path();p.moveTo(cx-w/2,y0);p.lineTo(cx-w/2,y0+h0);p.absarc(cx,y0+h0,w/2,Math.PI,0,true);p.lineTo(cx+w/2,y0);p.lineTo(cx-w/2,y0);return p};
const BAYS=[-3.2,3.2],BW=3.6,BH=4.0;
BAYS.forEach(x=>sh.holes.push(arch(x,BW,BH)));
const UW=[-4.6,-1.55,1.55,4.6];UW.forEach(x=>sh.holes.push(arch(x,1.1,.9,7.1)));
const fac=new THREE.Mesh(new THREE.ExtrudeGeometry(sh,{depth:.6,bevelEnabled:false,curveSegments:24}),brickM);fac.castShadow=fac.receiveShadow=true;scene.add(fac);
// trim: cornice, sign band, sills, arch keystones
add(box(FW+.6,.5,1),cream,0,FH+.1,.3);add(box(FW+.3,.2,.9),cream,0,FH-.3,.3);
const sign=canvasTex(THREE,1024,128,(g,w,h)=>{g.fillStyle='#1c1714';g.fillRect(0,0,w,h);g.strokeStyle='#c79a3e';g.lineWidth=6;g.strokeRect(10,10,w-20,h-20);g.fillStyle='#f3ead8';g.font='600 74px "Bodoni Moda", Georgia, serif';g.textAlign='center';g.textBaseline='middle';g.fillText('CAFÉ  ·  1903  ·  ESPRESSO',w/2,h/2+4)});
add(box(9,1,.12),M(0xffffff,{map:sign,roughness:.5,emissive:0xffffff,emissiveMap:sign,emissiveIntensity:.35}),0,6.15,.66);
for(const x of BAYS){const k=add(box(.5,.7,.2),cream,x,BH+BW/2+.1,.66)}
for(const x of UW){add(box(1.4,.14,.8),cream,x,7.05,.5);add(box(1.1,1.5,.05),glass,x,7.6,.15,scene,false)}
// transoms (arched glass) above bay doors
for(const x of BAYS){const s2=new THREE.Shape();s2.moveTo(-BW/2,0);s2.absarc(0,0,BW/2,Math.PI,0,true);s2.lineTo(-BW/2,0);
 add(new THREE.ShapeGeometry(s2,24),glass,x,BH,.3,scene,false);for(let k=1;k<4;k++){const b=add(box(.05,BW/2,.06),cream,x,BH+BW/4,.33,scene,false);b.rotation.z=(k-2)*.7;b.position.x=x+Math.sin(-(k-2)*.7)*BW/4;b.position.y=BH+Math.cos((k-2)*.7)*BW/4}}
// doors: 2 leaves per bay, hinged at outer edges, opening inward
const leaves=[];const leafGeo=box(BW/2-.04,BH-.05,.14);
const mkLeaf=(x,side)=>{const piv=new THREE.Group();piv.position.set(x+side*BW/2,0,.3);scene.add(piv);
 const lw=BW/2-.04;const lf=add(leafGeo,red,-side*lw/2,BH/2,0,piv);
 for(let r=0;r<2;r++)for(let c=0;c<2;c++)add(box(lw/2-.18,.62,.05),glass,-side*(lw/4+c*lw/2)+side*0,2.6+r*.72,.08,piv,false);
 add(box(lw-.2,.06,.04),cream,-side*lw/2,1.75,.09,piv,false);add(box(lw-.3,1.2,.03),M(0x8f1d17,{roughness:.5}),-side*lw/2,1,.085,piv,false);
 add(new THREE.SphereGeometry(.06,10,8),brass,-side*(lw-.15),1.6,.12,piv,false);
 piv.userData.side=side;leaves.push(piv)};
for(const x of BAYS){mkLeaf(x,-1);mkLeaf(x,1)}
// bell tower
const tw=new THREE.Group();tw.position.set(0,FH+.35,-.6);scene.add(tw);
add(box(3,.4,3),cream,0,.2,0,tw);
for(const [a,b] of[[-1,-1],[-1,1],[1,-1],[1,1]])add(box(.4,2.6,.4),brickM,a*1.25,1.7,b*1.25,tw);
add(box(3.2,.4,3.2),cream,0,3.2,0,tw);
const pyr=add(new THREE.ConeGeometry(2.4,2.2,4),M(0x2c3a3a,{roughness:.6,metalness:.3}),0,4.5,0,tw);pyr.rotation.y=Math.PI/4;
add(new THREE.CylinderGeometry(.03,.03,1.2,6),brass,0,6,0,tw);add(new THREE.SphereGeometry(.12,10,8),brass,0,5.55,0,tw);
const bellPiv=new THREE.Group();bellPiv.position.set(0,2.85,0);tw.add(bellPiv);
add(box(2.6,.14,.14),M(0x3a2a1e),0,0,0,bellPiv);
const prof=[[0,-.02],[.2,-.02],[.32,-.2],[.4,-.55],[.5,-.95],[.66,-1.12],[.68,-1.2],[.6,-1.22],[.46,-1.0],[.36,-.6],[.26,-.25],[.0,-.2]].map(([x,y])=>new THREE.Vector2(x,y));
const bell=add(new THREE.LatheGeometry(prof,40),new THREE.MeshStandardMaterial({color:0xc79a3e,metalness:1,roughness:.22,envMap:ENV,side:THREE.DoubleSide}),0,0,0,bellPiv);
const clap=add(new THREE.SphereGeometry(.11,12,10),M(0x3a2a1e,{metalness:.6}),0,-1.05,0,bellPiv);
const bellL=new THREE.PointLight(0xffc27a,6,6,1.6);bellL.position.set(0,1.4,1.6);tw.add(bellL);
// neighbor buildings
for(const [x,w,h,c] of[[-13,10,7,0x5a4a3e],[13.5,11,6,0x4a4e57],[-24,9,10,0x6b4b3a],[25,10,8,0x3e3a36]]){add(box(w,h,10),M(c,{roughness:.9}),x,h/2,-4.6);for(let k=0;k<3;k++)add(box(1,1.2,.05),M(0xffe1a8,{emissive:0xffb24d,emissiveIntensity:.7}),x-w/3+k*w/3,h-1.8,.42,scene,false)}
// patio tables (right side) + string lights
const wood=M(0x4a2f1e,{roughness:.6});
for(const [x,z] of[[8.5,3],[10.5,4.6],[8.6,6.2]]){add(new THREE.CylinderGeometry(.5,.5,.05,20),M(0x1c1c1c,{metalness:.5,roughness:.4}),x,.78,z);add(new THREE.CylinderGeometry(.04,.05,.76,8),M(0x1c1c1c),x,.39,z);
 for(const a of[0,Math.PI]){add(new THREE.CylinderGeometry(.2,.2,.04,14),wood,x+Math.cos(a)*.75,.46,z+Math.sin(a)*.75)}}
const bulbs=new THREE.Group();scene.add(bulbs);const bm=M(0xfff0c8,{emissive:0xffc070,emissiveIntensity:2.2});
for(let k=0;k<14;k++){const t=k/13;add(new THREE.SphereGeometry(.07,8,6),bm,6.6+t*6,3.4-Math.sin(t*Math.PI)*.6,1.4+t*5,bulbs,false)}
// lamp post
add(new THREE.CylinderGeometry(.07,.1,4.4,8),M(0x111111),-8,2.2,6.8);add(new THREE.SphereGeometry(.28,12,10),glass,-8,4.5,6.8,scene,false);
const lpl=new THREE.PointLight(0xffb46a,14,14,1.5);lpl.position.set(-8,4.3,6.8);scene.add(lpl);
// interior
const IW=13.4,ID=14,IH=8.6;const inn=new THREE.Group();scene.add(inn);
const chk=canvasTex(THREE,128,128,(g)=>{for(let i=0;i<4;i++)for(let j=0;j<4;j++){g.fillStyle=(i+j)%2?'#efe6d4':'#2b2420';g.fillRect(i*32,j*32,32,32)}},[14,14]);
const fl=add(new THREE.PlaneGeometry(IW,ID),M(0xffffff,{map:chk,roughness:.35}),0,.01,-ID/2,inn,false);fl.rotation.x=-Math.PI/2;
const plaster=M(0xe9dcc4,{roughness:.95});
const wL=add(new THREE.PlaneGeometry(ID,IH),plaster,-IW/2,IH/2,-ID/2,inn,false);wL.rotation.y=Math.PI/2;
const wR=add(new THREE.PlaneGeometry(ID,IH),plaster,IW/2,IH/2,-ID/2,inn,false);wR.rotation.y=-Math.PI/2;
add(new THREE.PlaneGeometry(IW,IH),M(0x6b3a2a,{map:brick,roughness:.9}),0,IH/2,-ID,inn,false);
const ce=add(new THREE.PlaneGeometry(IW,ID),M(0x2a211c),0,IH,-ID/2,inn,false);ce.rotation.x=Math.PI/2;
for(let z=-1;z>-ID;z-=2)add(box(IW,.3,.3),M(0x3a2a1e),0,IH-.15,z,inn,false);
// glass garage doors on right wall (all-season room)
for(const z of[-4,-8.2,-12]){add(box(.05,4,3.6),M(0x9fb4c8,{emissive:0x24344a,emissiveIntensity:.6,roughness:.1,metalness:.3}),IW/2-.05,2.2,z,inn,false);for(let k=1;k<4;k++)add(box(.08,.05,3.6),M(0x222222),IW/2-.08,.2+k*1,z,inn,false)}
// espresso counter
const ctr=new THREE.Group();ctr.position.set(-3.3,0,-6.6);inn.add(ctr);
add(box(6,1.05,1),M(0x1c2a24,{roughness:.45}),0,.525,0,ctr);add(box(6.2,.08,1.15),M(0xf1ece4,{roughness:.15}),0,1.09,0,ctr);
for(let k=-2;k<=2;k++)add(box(.9,.7,.03),M(0x223a30,{roughness:.4}),k*1.15,.55,.51,ctr,false);
// espresso machine (chrome, two groups)
const em=new THREE.Group();em.position.set(-.4,1.13,-.15);ctr.add(em);const chrome=M(0xdedede,{metalness:1,roughness:.18,envMap:ENV});
add(box(1.6,.75,.6),chrome,0,.375,0,em);add(box(1.64,.08,.64),M(0x111111),0,.79,0,em);add(box(1.4,.04,.4),red,0,.6,.31,em,false);
for(const s of[-.45,.45]){add(new THREE.CylinderGeometry(.08,.1,.12,16),chrome,s,.25,.33,em);const h=add(box(.05,.05,.38),M(0x111111),s,.2,.5,em);add(new THREE.CylinderGeometry(.06,.045,.09,14),M(0xffffff,{roughness:.3}),s,.05,.38,em)}
for(let k=0;k<6;k++)add(new THREE.CylinderGeometry(.06,.05,.1,14),M(0xffffff,{roughness:.3}),-.6+k*.24,.86,.05,em);
const cupHero=add(new THREE.CylinderGeometry(.09,.07,.13,18),M(0xffffff,{roughness:.25}),1.4,1.19,.25,ctr);add(new THREE.CylinderGeometry(.16,.16,.015,20),M(0xffffff,{roughness:.25}),1.4,1.13,.25,ctr);
add(new THREE.CylinderGeometry(.08,.08,.01,18),M(0x6b3a1e,{roughness:.2}),1.4,1.255,.25,ctr,false);
// grinder
add(box(.35,.5,.35),M(0x222222,{metalness:.5,roughness:.3}),1.9,1.38,-.2,ctr);add(new THREE.ConeGeometry(.2,.35,16),M(0x9a7a56,{transparent:true,opacity:.7}),1.9,1.8,-.2,ctr);
// back menu board
const mb=canvasTex(THREE,1024,640,(g,w,h)=>{g.fillStyle='#1c1714';g.fillRect(0,0,w,h);g.strokeStyle='#c79a3e';g.lineWidth=8;g.strokeRect(14,14,w-28,h-28);g.fillStyle='#c79a3e';g.font='700 34px Archivo, sans-serif';g.textAlign='center';g.fillText('E S P R E S S O   ·   I L L Y',w/2,84);
 g.fillStyle='#f3ead8';g.font='500 46px "Bodoni Moda", Georgia, serif';g.textAlign='left';['Espresso','Americano','Macchiato','Cortado'].forEach((t,i)=>g.fillText(t,80,170+i*96));['Cappuccino','Latte','Iced options','Dulce pastries'].forEach((t,i)=>g.fillText(t,560,170+i*96))});
add(new THREE.PlaneGeometry(5,3.1),M(0xffffff,{map:mb,emissive:0xffffff,emissiveMap:mb,emissiveIntensity:.25,roughness:.6}),-3.3,4.1,-ID+.05,inn,false);
add(box(6,.08,.5),wood,-3.3,2.3,-ID+.3,inn);for(let k=0;k<8;k++)add(new THREE.CylinderGeometry(.09,.09,.32,12),M([0xc79a3e,0x2b2b2b,0xb3261e][k%3],{metalness:.4,roughness:.4}),-6+k*.75,2.5,-ID+.3,inn);
// pastry case
const pc=new THREE.Group();pc.position.set(2.4,0,-6.6);inn.add(pc);
add(box(2.6,.9,1),M(0x1c2a24,{roughness:.45}),0,.45,0,pc);add(box(2.6,.06,1),M(0xf1ece4,{roughness:.2}),0,.93,0,pc);
add(box(2.5,.7,.9),new THREE.MeshPhysicalMaterial({color:0xffffff,transmission:.95,roughness:.04,transparent:true,opacity:.25}),0,1.31,0,pc,false);
const caseL=new THREE.PointLight(0xfff1d6,3,3,1.5);caseL.position.set(0,1.55,0);pc.add(caseL);
const pm=[M(0xd9a35f),M(0xc58b48),M(0xe8cf9a)];
for(let k=0;k<5;k++){const b=add(box(.36,.07,.1),pm[0],-1+k*.22,1.0,-.2,pc);b.rotation.y=.3}// biscotti
for(let k=0;k<4;k++){add(new THREE.CylinderGeometry(.12,.12,.04,18),pm[1],-.9+k*.32,1.0,.2,pc)}// cookies
for(let k=0;k<3;k++){const s=add(new THREE.ConeGeometry(.17,.14,3),pm[2],.55+k*.3,1.03,-.1,pc);s.rotation.y=k}// scones
// communal table
add(box(4.4,.1,1.4),wood,4,1,-10);for(const [a,b] of[[-2,-.55],[2,-.55],[-2,.55],[2,.55]])add(box(.1,1,.1),wood,4+a,.5,-10+b);
for(let k=0;k<4;k++)for(const s of[-1,1]){add(new THREE.CylinderGeometry(.2,.2,.06,14),M(0x1c1c1c,{metalness:.5}),2.6+k*.95,.72,-10+s*1.05);add(new THREE.CylinderGeometry(.03,.03,.7,6),M(0x1c1c1c),2.6+k*.95,.36,-10+s*1.05)}
// pendants
const pend=[];for(const [x,z] of[[-5,-6.6],[-3.3,-6.6],[-1.6,-6.6],[2.4,-6.6],[3,-10],[5,-10]]){add(new THREE.CylinderGeometry(.01,.01,IH-3.4,4),M(0x111111),x,3.4+(IH-3.4)/2,z,inn,false);add(new THREE.ConeGeometry(.3,.3,20,1,true),brass,x,3.3,z,inn,false);add(new THREE.SphereGeometry(.09,10,8),M(0xfff0c8,{emissive:0xffc070,emissiveIntensity:2.5}),x,3.15,z,inn,false)}
for(const [x,z] of[[-3.3,-6],[3,-9],[2.4,-5.5]]){const l=new THREE.PointLight(0xffc27a,S.TOUCH?16:22,10,1.3);l.position.set(x,3,z);inn.add(l);pend.push(l)}
// lights
scene.add(new THREE.HemisphereLight(0x8fa6d8,0x2a1e18,.6));
const moon=new THREE.DirectionalLight(0xc6d2ff,1.3);moon.position.set(14,20,18);moon.castShadow=true;moon.shadow.mapSize.set(1024,1024);Object.assign(moon.shadow.camera,{left:-16,right:16,top:16,bottom:-16});scene.add(moon);
const doorL=new THREE.PointLight(0xffb86b,12,10,1.4);doorL.position.set(-3.2,4,3);scene.add(doorL);const doorR=doorL.clone();doorR.position.x=3.2;scene.add(doorR);
// steam
const steamM=new THREE.SpriteMaterial({map:canvasTex(THREE,64,64,(g)=>{const r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,'rgba(255,255,255,.6)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,64,64)}),transparent:true,depthWrite:false});
const steam=[0,1,2].map(k=>{const s=new THREE.Sprite(steamM.clone());s.scale.setScalar(.22);s.userData.o=k/3;scene.add(s);return s});
let ang=0,vel=0;
const sm=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t)};
A.onFrame.push((dt,u)=>{const t=A.t;
 if(bellImpulse){vel+=bellImpulse*3.2;bellImpulse=0}
 vel+=(-ang*26-vel*1.4)*dt;ang+=vel*dt;bellPiv.rotation.x=ang*.6;clap.position.z=-Math.sin(ang*.6)*.12;
 const o=sm(.36,.58,u);for(const l of leaves)l.rotation.y=-l.userData.side*o*1.45;
 for(const s of steam){const f=(t*.35+s.userData.o)%1;s.position.set(-3.3+1.4+Math.sin(t+f*5)*.03,1.33+f*.5,-6.6+.25);s.material.opacity=Math.sin(f*Math.PI)*.55}
 bulbs.children.forEach((b,i)=>b.material.emissiveIntensity=2+Math.sin(t*2+i)*.3);
});
}
