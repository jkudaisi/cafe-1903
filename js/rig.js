// shared three.js rig: renderer, camera path, visibility-gated loop
import * as THREE from 'three';
export function rig(canvas,{keys,fov=45,bg=null,fog=null,exposure=1}){
 const S=window.SITE;
 const r=new THREE.WebGLRenderer({canvas,antialias:!S.TOUCH,alpha:false,powerPreference:'high-performance'});
 r.setPixelRatio(Math.min(devicePixelRatio,1.25));r.outputColorSpace=THREE.SRGBColorSpace;r.toneMapping=THREE.ACESFilmicToneMapping;r.toneMappingExposure=exposure;
 r.shadowMap.enabled=!S.TOUCH;r.shadowMap.type=THREE.PCFSoftShadowMap;
 const scene=new THREE.Scene();if(bg!==null)scene.background=new THREE.Color(bg);if(fog)scene.fog=fog;
 const cam=new THREE.PerspectiveCamera(fov,1,.05,200);
 const P=new THREE.CatmullRomCurve3(keys.map(k=>new THREE.Vector3(...k.p)),false,'centripetal');
 const L=new THREE.CatmullRomCurve3(keys.map(k=>new THREE.Vector3(...k.l)),false,'centripetal');
 const n=keys.length;let sp=0;const look=new THREE.Vector3();const mouse={x:0,y:0,tx:0,ty:0};
 if(!S.TOUCH)addEventListener('pointermove',e=>{mouse.tx=e.clientX/innerWidth-.5;mouse.ty=e.clientY/innerHeight-.5},{passive:true});
 const ease=f=>f<.5?4*f*f*f:1-Math.pow(-2*f+2,3)/2;
 function size(){const w=canvas.clientWidth,h=canvas.clientHeight;if(!w||!h)return;r.setSize(w,h,false);cam.aspect=w/h;cam.fov=w/h<.8?fov+16:fov;cam.updateProjectionMatrix()}
 new ResizeObserver(size).observe(canvas);size();
 let vis=true;new IntersectionObserver(([e])=>vis=e.isIntersecting).observe(canvas);
 const api={THREE,r,scene,cam,clock:new THREE.Clock(),onFrame:[],t:0,size};
 // progress -> eased curve param with dwell at each key
 function param(p){const seg=p*(n-1)*1.0;const s=Math.min(n-2,Math.floor(seg));const f=Math.min(1,seg-s);
  const dwell=.28;const g=f<dwell?0:f>1-dwell?1:ease((f-dwell)/(1-2*dwell));return (s+g)/(n-1)}
 (function loop(){requestAnimationFrame(loop);if(!vis||document.hidden)return;const dt=Math.min(.05,api.clock.getDelta());api.t+=dt;
  // map step-based progress so each caption's middle = its key
  const raw=S.progress;const target=Math.min(1,Math.max(0,(raw*n-.5)/(n-1)));
  sp+=(target-sp)*(S.RM?1:Math.min(1,dt*4));
  const u=param(sp);P.getPoint(u,cam.position);L.getPoint(u,look);
  mouse.x+=(mouse.tx-mouse.x)*.05;mouse.y+=(mouse.ty-mouse.y)*.05;
  cam.position.x+=mouse.x*.35;cam.position.y-=mouse.y*.2;cam.lookAt(look);
  api.u=u;api.sp=sp;for(const f of api.onFrame)f(dt,u);r.render(scene,cam)})();
 return api;
}
export function canvasTex(THREE,w,h,draw,rep){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;if(rep){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(...rep)}return t}
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
export function envMap(THREE,r){const pm=new THREE.PMREMGenerator(r);const t=pm.fromScene(new RoomEnvironment(),.04).texture;pm.dispose();return t}
