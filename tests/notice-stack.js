// Bottom-right notices: counts each message once while the stack scrolls, repeats itself and fades.
// Draws the notice stack onto a real 2560×1440 screen (notice area blacked out) frame by frame.
const {chromium}=require('playwright');
const BASE=process.env.LB_BASE||'http://localhost:8123';
(async()=>{const b=await chromium.launch();const ctx=await b.newContext();
await ctx.addInitScript(()=>{window.LB_OCR={src:'/node_modules/tesseract.js/dist/tesseract.min.js',workerPath:'/node_modules/tesseract.js/dist/worker.min.js',corePath:'/node_modules/tesseract.js-core',langPath:'/node_modules/@tesseract.js-data/eng/4.0.0_best_int'};});
const p=await ctx.newPage();p.on('pageerror',e=>console.log('ERR',e.message));await p.goto(BASE+'/index.html');await p.waitForTimeout(600);
const res=await p.evaluate(async()=>{
  const im=await loadImg('fixtures/real-full-70.png');const cv=document.createElement('canvas');cv.width=im.width;cv.height=im.height;const g=cv.getContext('2d');
  let stack=[];   // oldest first: {t, c}  c = colour
  const W='#ffffff',Y='#e8e070',DIM='#8c8c8c';
  const draw=()=>{g.drawImage(im,0,0);g.fillStyle='#000';g.fillRect(1840,960,720,215);g.font='18px Arial';g.textAlign='right';g.textBaseline='middle';
    stack.forEach((l,i)=>{g.fillStyle=l.c;g.fillText(l.t,2548,1146-(stack.length-1-i)*26);});};
  const loop=()=>{draw();requestAnimationFrame(loop);};loop();
  stream=cv.captureStream(5);video.srcObject=stream;video.play();await new Promise(r=>setTimeout(r,600));
  await OCR.init();await OCR.autoFind(true);OCR.reset();OCR._msgReset(true);
  const E=n=>({t:`You received EXP (+${n})`,c:Y}),B=n=>({t:`Bonus EXP for PARTY (+${n})`,c:Y}),M=n=>({t:`You have gained mesos (+${n})`,c:W}),I=(s,c)=>({t:`${s} x1 earned. (${c})`,c:W});
  const add=(...ls)=>{stack.push(...ls);while(stack.length>6)stack.shift();};
  const tick=async()=>{await new Promise(r=>setTimeout(r,450));await OCR._msgTick();};
  const out=[];const snap=tag=>{const m=OCR.msgState();out.push({tag,exp:m.exp,party:m.party,kills:m.kills,meso:m.meso,items:JSON.stringify(m.items)});};
  add(M(99));await tick();snap('already on screen → not counted');                 // baseline
  add(E(40),B(12));await tick();snap('kill 1');
  await tick();snap('nothing new');
  add(E(40),B(12));await tick();snap('kill 2 (same text again)');
  add(M(22),I('Rib','Etc'));await tick();snap('pickup');
  add(E(40),B(12));await tick();snap('kill 3, stack full: top scrolls away');
  stack[0].c=DIM;stack[1].c=DIM;await tick();snap('top lines fade');
  // stack is now 40,12 | 22,Rib | 40,12 with the oldest two dim; push a pair → the same texts again, only brightness tells
  add(E(40),B(12));await tick();snap('kill 4 — same-looking stack');
  add(M(23));await tick();snap('meso');
  add(I('Dark Scroll for Shield','Use'));await tick();snap('rare: '+(document.querySelector('#rareToast div')?.textContent||'no alert'));
  return out;});
for(const r of res)console.log(r.tag.padEnd(36),JSON.stringify(r));
const last=res[res.length-2],want={exp:160,party:48,kills:4,meso:45};let ok=true;
for(const k in want)if(last[k]!==want[k]){ok=false;console.log('FAIL',k,last[k],'want',want[k]);}
if(!/Rib/.test(last.items)){ok=false;console.log('FAIL items',last.items);}
if(!/Scroll/.test(res[res.length-1].tag)){ok=false;console.log('FAIL rare alert',res[res.length-1].tag);}
console.log(ok?'PASS notice-stack':'FAIL notice-stack');await b.close();process.exit(ok?0:1);})();
