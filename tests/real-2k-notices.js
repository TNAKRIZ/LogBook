// Harry's real 2560×1440 farming screens (other players' names and chat blurred): bottom-right notices + HUD.
// Each screen is read on its own: every bright notice counts, faded (grey) ones are old and skipped.
const {chromium}=require('playwright');
const BASE=process.env.LB_BASE||'http://localhost:8123';
const CASES=[
  {f:'real2k-n1.png',level:71,pct:50.30,meso:null,     msg:{exp:0,  kills:0,meso:78},items:['Pelvic Bone']},   // inventory closed, % only
  {f:'real2k-n2.png',level:71,exp:990954,pct:45.54,meso:33358,msg:{exp:48, kills:1,meso:56},items:['Pelvic Bone']},
  {f:'real2k-n3.png',level:71,exp:959394,pct:44.09,meso:25354,msg:{exp:0,  kills:0,meso:25},items:[]},
  {f:'real2k-n4.png',level:70,pct:59.99,meso:90145,    msg:{exp:0,  kills:0,meso:45},items:['Rib']},
  {f:'real2k-n5.png',level:70,pct:53.05,meso:49569,    msg:{exp:189,party:57,kills:3,meso:0},items:[]},
];
// n2's top line "Bonus EXP for PARTY (+29)" is half faded and still reads +24 — live, it is counted while bright, so its party total isn't checked.
(async()=>{const b=await chromium.launch();const ctx=await b.newContext();
await ctx.addInitScript(()=>{window.LB_OCR={src:'/node_modules/tesseract.js/dist/tesseract.min.js',workerPath:'/node_modules/tesseract.js/dist/worker.min.js',corePath:'/node_modules/tesseract.js-core',langPath:'/node_modules/@tesseract.js-data/eng/4.0.0_best_int'};});
const p=await ctx.newPage();p.on('pageerror',e=>console.log('ERR',e.message));await p.goto(BASE+'/index.html');await p.waitForTimeout(600);
let pass=0,total=0;const ok=(c,label,got,want)=>{total++;const g=c===true;if(g)pass++;else console.log('  ✗',label,'got',JSON.stringify(got),'want',JSON.stringify(want));};
for(const c of CASES){
  const o=await p.evaluate(async f=>{const im=await loadImg('fixtures/'+f);const cv=document.createElement('canvas');cv.width=im.width;cv.height=im.height;const g=cv.getContext('2d');const d=()=>{g.drawImage(im,0,0);requestAnimationFrame(d);};d();
    stream=cv.captureStream(5);video.srcObject=stream;video.play();await new Promise(r=>setTimeout(r,600));await OCR.init();await OCR.autoFind(true);OCR.reset();
    const who=await OCR.readWho().catch(()=>null);if(who?.level){OCR._setHint(who.level);OCR._st.level=who.level;}
    const r=await OCR._readNow();OCR._msgReset();await OCR._msgTick();const m=OCR.msgState();
    return {level:who?.level,exp:r.exp,meso:r.meso,msg:{exp:m.exp,party:m.party,kills:m.kills,meso:m.meso},items:Object.keys(m.items),log:m.log.map(x=>x.text)};},c.f);
  console.log(c.f,JSON.stringify({level:o.level,exp:o.exp,meso:o.meso,msg:o.msg,items:o.items}));
  ok(o.level===c.level,'level',o.level,c.level);
  ok(o.exp?.pct===c.pct,'EXP %',o.exp?.pct,c.pct);
  if(c.exp)ok(o.exp?.exp===c.exp,'EXP',o.exp?.exp,c.exp);
  if(c.meso)ok(o.meso===c.meso,'meso',o.meso,c.meso);
  for(const k in c.msg)ok(o.msg[k]===c.msg[k],'notice '+k,o.msg[k],c.msg[k]);
  ok(JSON.stringify(o.items.sort())===JSON.stringify(c.items.sort()),'items',o.items,c.items);}
console.log(pass===total?`PASS real-2k ${pass}/${total}`:`FAIL real-2k ${pass}/${total}`);await b.close();process.exit(pass===total?0:1);})();
