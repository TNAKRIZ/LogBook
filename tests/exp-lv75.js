// Harry's Lv.75 screens (Nov 15): the thousands comma read as a space ("177 807[6 59/") lost the first group, and a garbled %
// ("6.60%" → "[6807]") that would put the EXP past a million outvoted the exact number on screen. Strings + real crops.
const {chromium}=require('playwright');
const BASE=process.env.LB_BASE||'http://localhost:8123';
const CROPS=[['real-exp-75a.png',177881,6.6],['real-exp-75b.png',191775,7.12],['real-exp-75c.png',202040,7.5],['real-exp-75d.png',207176,7.69]];
(async()=>{const b=await chromium.launch();let pass=0,total=0;const ok=(c,l,g)=>{total++;if(c)pass++;else console.log('  ✗',l,JSON.stringify(g));};
const ctx=await b.newContext();await ctx.addInitScript(()=>{window.LB_OCR={src:'/node_modules/tesseract.js/dist/tesseract.min.js',workerPath:'/node_modules/tesseract.js/dist/worker.min.js',corePath:'/node_modules/tesseract.js-core',langPath:'/node_modules/@tesseract.js-data/eng/4.0.0_best_int'};});
const p=await ctx.newPage();p.on('pageerror',e=>console.log('ERR',e.message));await p.goto(BASE+'/index.html');await p.waitForTimeout(600);
const s=await p.evaluate(()=>{const o={};for(const h of [74,75]){OCR._setHint(h);
  for(const t of ['177 807[6 59/:','175 811[6 53/:','172 847[6 42/:','177881 [6807]','177,881 [6.60%]','[82.30%]','4065 2 28/']){const v=OCR._parseExp(t);o[h+'|'+t]=OCR._fromPct(v&&{...v});}}return o;});
for(const h of [74,75]){
  ok(s[h+'|177 807[6 59/:']?.exp===177807&&s[h+'|177 807[6 59/:']?.pct===6.59,`${h}: comma read as space`,s[h+'|177 807[6 59/:']);
  ok(s[h+'|175 811[6 53/:']?.exp===175811,`${h}: comma read as space (2)`,s[h+'|175 811[6 53/:']);
  ok(s[h+'|177881 [6807]']?.exp===177881&&!s[h+'|177881 [6807]']?.est,`${h}: garbled % does not outvote the number`,s[h+'|177881 [6807]']);
  ok(s[h+'|177,881 [6.60%]']?.exp===177881&&s[h+'|177,881 [6.60%]']?.pct===6.6,`${h}: clean read`,s[h+'|177,881 [6.60%]']);
  ok(s[h+'|[82.30%]']?.est&&s[h+'|[82.30%]']?.pct===82.3,`${h}: % only past a million still estimates`,s[h+'|[82.30%]']);}
// the real HUD crops, read the way the tracker reads them
for(const [f,want,pct] of CROPS){const r=await p.evaluate(async([f])=>{const im=await loadImg('fixtures/'+f);const cv=document.createElement('canvas');cv.width=im.width;cv.height=im.height;const g=cv.getContext('2d');
    const d=()=>{g.drawImage(im,0,0);requestAnimationFrame(d);};d();stream=cv.captureStream(5);video.srcObject=stream;video.play();await new Promise(r=>setTimeout(r,500));
    await put('kv',{exp:{x:8/260,y:4/40,w:248/260,h:32/40},meso:null,who:null,map:null},'ocrRegions');await OCR.init();const out=[];for(const L of [74,75]){const x=await OCR._readNow(L);out.push({L,exp:x.exp,raw:x.rawExp});}return out;},[f]);
  for(const x of r)ok(x.exp&&!x.exp.est&&Math.abs(x.exp.exp-want)<=want*0.002,`${f} at Lv${x.L} → ${want}`,x);}
console.log(pass===total?`PASS exp-lv75 ${pass}/${total}`:`FAIL exp-lv75 ${pass}/${total}`);await b.close();process.exit(pass===total?0:1);})();
