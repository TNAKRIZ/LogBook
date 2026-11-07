// Harry's screen at Lv.68 (EXP past 1,000,000 → only "[58.03%]" is shown; inventory open with 430,107 Mesos), no boxes drawn,
// at 4 capture sizes: the reader finds every box itself and reads 58.03% (not 8.03% / 80.37% / 58.37%), the Meso and the level.
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();let pass=0,total=0;
for(const k of [1,0.7822,0.55]){
  const ctx=await b.newContext();await ctx.addInitScript(()=>{window.LB_OCR={src:'/node_modules/tesseract.js/dist/tesseract.min.js',workerPath:'/node_modules/tesseract.js/dist/worker.min.js',corePath:'/node_modules/tesseract.js-core',langPath:'/node_modules/@tesseract.js-data/eng/4.0.0_best_int'};});
  const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.goto('http://localhost:8123/index.html');await p.waitForTimeout(600);
  const o=await p.evaluate(async K=>{const im=await loadImg('fixtures/real-full-68.png');const W=Math.round(im.width*K),H=Math.round(im.height*K);const cv=document.createElement('canvas');cv.width=W;cv.height=H;const g=cv.getContext('2d');const d=()=>{g.drawImage(im,0,0,W,H);requestAnimationFrame(d);};d();
    stream=cv.captureStream(5);video.srcObject=stream;video.play();await new Promise(r=>setTimeout(r,700));
    await put('kv',{exp:null,meso:null,who:null,map:null},'ocrRegions');await put('kv',null,'ocrAuto');await put('kv',[],'mapPrints');await OCR.init();
    const f=await OCR.autoFind(true);const r=await OCR._readNow(68);const w=await OCR.readWho([{id:'c1',name:'TNAKRIZ',job:'magician'}]);
    const m=await OCR.readMap(allMaps());return {W,f,pct:r.exp?.pct,est:r.exp?.est,raw:r.rawExp,meso:r.meso,lv:w?.level,maps:(m?.cands||[]).map(c=>c.name).concat(m?.map?[m.map.name]:[])};},k);
  const chk={found:!!(o.f?.exp&&o.f?.who&&o.f?.map&&o.f?.meso),pct:o.pct===58.03&&o.est===true,meso:o.meso===430107,level:o.lv===68,map:o.maps.includes('Sleepy Dungeon III')};
  for(const x in chk){total++;pass+=chk[x];}console.log(o.W,JSON.stringify(chk),o.raw.slice(0,60),errs.join(';'));await ctx.close();}
console.log(`REAL 68 PASS ${pass}/${total}`);await b.close();process.exit(pass===total?0:1);})();
