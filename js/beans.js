import * as THREE from 'three';
const S=window.SITE;const cv=document.getElementById('beans');
if(cv&&!S.lite&&!S.RM){
 const r=new THREE.WebGLRenderer({canvas:cv,alpha:true,antialias:!S.TOUCH});
 r.setPixelRatio(Math.min(devicePixelRatio,1.25));r.outputColorSpace=THREE.SRGBColorSpace;r.toneMapping=THREE.ACESFilmicToneMapping;
 const scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(35,1,.1,100);cam.position.z=20;
 scene.add(new THREE.HemisphereLight(0xfff1e0,0x3a2010,1.4));const d=new THREE.DirectionalLight(0xffffff,2.2);d.position.set(4,8,6);scene.add(d);
 // real 3D bean: ellipsoid with a centre groove
 const g=new THREE.SphereGeometry(.5,24,16);const p=g.attributes.position,v=new THREE.Vector3();
 for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);v.x*=.78;v.y*=.5;v.z*=1.05;if(v.y>0){const k=Math.exp(-Math.pow(v.x/.07,2));v.y-=.16*k*(v.y/.25);v.x*=1+.1*(1-k)}p.setXYZ(i,v.x,v.y,v.z)}g.computeVertexNormals();
 const m=new THREE.MeshStandardMaterial({color:0x4a2614,roughness:.38,metalness:.05});
 const N=S.TOUCH?22:60;const mesh=new THREE.InstancedMesh(g,m,N);scene.add(mesh);
 const B=[];let W=10,H=10,K=1;
 const reset=(b,top)=>{b.x=(W<H?(Math.random()-.5)*W*.9:(Math.random()-.25)*W*.45);b.y=top?H/2+Math.random()*H*1.2:(Math.random()-.5)*H;b.z=(Math.random()-.5)*8;b.v=1.5+Math.random()*2;b.rx=Math.random()*6;b.ry=Math.random()*6;b.sx=(Math.random()-.5)*3;b.sy=(Math.random()-.5)*3;b.s=.5+Math.random()*.45};
 const size=()=>{const w=cv.clientWidth,h=cv.clientHeight;if(!w)return;r.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();H=2*Math.tan(cam.fov*Math.PI/360)*20;W=H*cam.aspect;K=cam.aspect<1?.5:1};
 new ResizeObserver(size).observe(cv);size();for(let i=0;i<N;i++){B.push({});reset(B[i],false)}
 let vis=true;new IntersectionObserver(([e])=>vis=e.isIntersecting).observe(cv);
 const o=new THREE.Object3D();let lp=0,t0=performance.now();
 r.setAnimationLoop(()=>{const now=performance.now(),dt=Math.min(.05,(now-t0)/1000);t0=now;if(!vis||document.hidden)return;
  const pr=S.progress,vel=Math.abs(pr-lp)/Math.max(dt,.001);lp=pr;
  // density: full rain in BEANS/GRIND, sparse after; bell burst rains again
  const want=pr<.3?.55:pr<.45?.55-(pr-.3)*3:.1;S.burst*=.985;const dens=Math.min(1,want+S.burst);
  const active=Math.round(N*dens);
  for(let i=0;i<N;i++){const b=B[i];b.y-=(b.v+vel*6)*dt*(1+S.burst);b.rx+=b.sx*dt;b.ry+=b.sy*dt;if(b.y<-H/2-1)reset(b,true);
   o.position.set(b.x,b.y,b.z);o.rotation.set(b.rx,b.ry,0);o.scale.setScalar(i<active?b.s*K:0);o.updateMatrix();mesh.setMatrixAt(i,o.matrix)}
  mesh.instanceMatrix.needsUpdate=true;r.render(scene,cam)});
}
