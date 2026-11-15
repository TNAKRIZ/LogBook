// Harry, Nov 15: 6-digit Meso (281,786) read as 17 / 222 / 303 — by Meso digit shapes the page had learned from wrong reads.
// The crops are the reads the tracker turned down (kept by the "💾 เก็บภาพทดสอบ" file). Checks: a fresh page reads them all;
// old learned Meso shapes are dropped once; templates never set the value at the start of a round or with a different digit count;
// a learned set built from a WRONG value can't make the next read short.
const {chromium}=require('playwright');
const BASE=process.env.LB_BASE||'http://localhost:8123';
const F=[281443,281786,281898,281978,282841];
(async()=>{const b=await chromium.launch();let pass=0,total=0;const ok=(c,l,g)=>{total++;if(c)pass++;else console.log('  ✗',l,JSON.stringify(g));};
async function page(pre){const ctx=await b.newContext();await ctx.addInitScript(()=>{window.LB_OCR={src:'/node_modules/tesseract.js/dist/tesseract.min.js',workerPath:'/node_modules/tesseract.js/dist/worker.min.js',corePath:'/node_modules/tesseract.js-core',langPath:'/node_modules/@tesseract.js-data/eng/4.0.0_best_int'};});
  const p=await ctx.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));await p.goto(BASE+'/index.html');await p.waitForTimeout(500);
  if(pre){await p.evaluate(pre);await p.reload();await p.waitForTimeout(500);}return {p,ctx};}
const setImg=(p,v)=>p.evaluate(async v=>{const im=await loadImg('fixtures/real-meso6-'+v+'.png');window.__im=im;if(!window.__cv){const cv=window.__cv=document.createElement('canvas');cv.width=im.width;cv.height=im.height;const g=cv.getContext('2d');
    const d=()=>{g.drawImage(window.__im,0,0);requestAnimationFrame(d);};d();stream=cv.captureStream(5);video.srcObject=stream;video.play();await new Promise(r=>setTimeout(r,500));
    await put('kv',{exp:null,meso:{x:40.5/351,y:11.6/52,w:270/351,h:28.8/52},who:null,map:null},'ocrRegions');await OCR.init();}else await new Promise(r=>setTimeout(r,400));},v);
// 1. fresh page: every crop
{const {p,ctx}=await page();for(const v of F){await setImg(p,v);const r=await p.evaluate(()=>OCR._readNow(75).then(x=>({m:x.meso,raw:x.rawMeso})));ok(r.m===v,`fresh read ${v}`,r);}
 // 2. a template set learned from a WRONG value (shifted digits): at the start (no value yet) it is not used at all
 await setImg(p,281786);await p.evaluate(async()=>{await OCR.learnMeso(303303);});   // a value that is not on screen: must not learn
 const n0=await p.evaluate(()=>Object.keys(OCR._tpl()?.meso||{}).length);ok(n0===0,'a value not on screen is not learned',n0);
 await p.evaluate(async()=>{const r=await OCR._readNow(75);const x=r.listMeso.find(v=>v.gAll?.length===6);if(x)await OCR._tplLearn('meso',x.gAll,'303303');});
const r0=await p.evaluate(()=>{OCR._st.meso=null;return OCR._readNow(75).then(x=>({m:x.meso,raw:x.rawMeso}));});ok(r0.m===281786&&!/tpl/.test(r0.raw),'start of round: Tesseract, not templates',r0);
 const r1=await p.evaluate(()=>{OCR._st.meso=28178;return OCR._readNow(75).then(x=>({m:x.meso,raw:x.rawMeso}));});ok(r1.m===281786&&!/tpl/.test(r1.raw),'different digit count: Tesseract',r1);
 ok(!p.errs.length,'no page errors',p.errs);await ctx.close();}
// 3. Meso shapes stored by an older version are dropped once on load; EXP shapes stay
{const {p,ctx}=await page(async()=>{await put('kv',{meso:{'3':[{b:'0'.repeat(96),a:0.5}],'0':[{b:'1'.repeat(96),a:0.5}],'2':[{b:'01'.repeat(48),a:0.5}]},exp:{'1':[{b:'0'.repeat(96),a:0.3}]}},'digitTpl2');});
 await setImg(p,282841);await p.evaluate(()=>OCR._readNow(75));const t=await p.evaluate(()=>({meso:Object.keys(OCR._tpl()?.meso||{}).length,exp:Object.keys(OCR._tpl()?.exp||{}).length}));
 ok(t.meso===0&&t.exp===1,'old Meso shapes dropped, EXP kept',t);
 const t2=await p.evaluate(async()=>{await new Promise(r=>setTimeout(r,50));return (await getKV('digitTpl2'))?.mesoReset1;});ok(t2===1,'drop happens once (remembered)',t2);await ctx.close();}
console.log(pass===total?`PASS meso-6digit ${pass}/${total}`:`FAIL meso-6digit ${pass}/${total}`);await b.close();process.exit(pass===total?0:1);})();
