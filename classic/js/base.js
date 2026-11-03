(()=>{
const TOUCH=matchMedia('(hover:none),(pointer:coarse)').matches;
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const root=document.documentElement;root.classList.toggle('touch',TOUCH);
const q=new URLSearchParams(location.search);
const lite=(()=>{if(q.has('lite'))return true;try{const c=document.createElement('canvas');if(!(c.getContext('webgl2')||c.getContext('webgl')))return true}catch(e){return true}
 const mem=navigator.deviceMemory,cores=navigator.hardwareConcurrency;
 return TOUCH&&((mem&&mem<=2)||(cores&&cores<=2)||(navigator.connection&&navigator.connection.saveData))})();
if(lite)root.classList.add('lite');
const S=window.SITE={TOUCH,RM,lite,progress:0,step:0};
gsap.registerPlugin(ScrollTrigger);ScrollTrigger.config({ignoreMobileResize:true});
let lenis=null;
if(!TOUCH&&!RM&&window.Lenis){lenis=new Lenis({lerp:.1,smoothWheel:true});lenis.on('scroll',ScrollTrigger.update);gsap.ticker.add(t=>lenis.raf(t*1000));gsap.ticker.lagSmoothing(0)}
S.lenis=lenis;
const go=(y)=>lenis?lenis.scrollTo(y,{duration:1.2}):scrollTo({top:y,behavior:RM?'auto':'smooth'});
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const id=a.getAttribute('href');const t=id==='#'?document.body:document.querySelector(id);if(!t)return;e.preventDefault();go(t.getBoundingClientRect().top+scrollY-(id==='#top'?0:56))}));
const walk=document.getElementById('walk'),caps=[...document.querySelectorAll('.cap')],N=caps.length;
const dotsEl=document.querySelector('.dots');
if(dotsEl){dotsEl.innerHTML=caps.map((c,i)=>`<button aria-label="${c.dataset.label||('Step '+(i+1))}"><i></i></button>`).join('');
 [...dotsEl.children].forEach((b,i)=>b.onclick=()=>{const span=walk.offsetHeight-innerHeight;go(walk.offsetTop+span*((i+.5)/N))})}
const hint=document.querySelector('.hint');
function setStep(i){if(i===S.step&&caps[i].classList.contains('on'))return;S.step=i;caps.forEach((c,j)=>{c.classList.toggle('on',j===i);c.setAttribute('aria-hidden',j!==i)});
 if(dotsEl)[...dotsEl.children].forEach((b,j)=>b.classList.toggle('on',j===i));dispatchEvent(new CustomEvent('step',{detail:i}))}
setStep(0);
ScrollTrigger.create({trigger:walk,start:'top top',end:'bottom bottom',onUpdate:s=>{S.progress=s.progress;setStep(Math.min(N-1,Math.floor(s.progress*N)));hint&&hint.classList.toggle('gone',s.progress>.03)}});
const hdr=document.querySelector('.hdr');let tick=false;
const onScroll=()=>{tick=false;hdr.classList.toggle('solid',scrollY>walk.offsetHeight-innerHeight-10)};
addEventListener('scroll',()=>{if(!tick){tick=true;requestAnimationFrame(onScroll)}},{passive:true});onScroll();
if(!RM)gsap.utils.toArray('.rv').forEach(el=>gsap.from(el,{y:34,opacity:0,duration:.9,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 90%',once:true}}));
const d=new Date().getDay();document.querySelectorAll('.hours tr[data-d]').forEach(r=>r.classList.toggle('today',+r.dataset.d===d));
})();
