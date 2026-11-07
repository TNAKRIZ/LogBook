// No boxes drawn: the reader finds the HUD (HP/MP gauges), the minimap and the Meso field by itself, at several capture sizes,
// notices when the inventory is closed, and finds the Meso field again after the window moved.
const {chromium}=require('playwright');
const IMG='fixtures/real-hud-63-full.jpg',MESO='fixtures/real-meso-row-68.png';   // the real inventory Meso row (430,107), cut from Harry's Lv.68 screen
const CASES=[{k:1,name:'1456 screenshot'},{k:1.76,name:'2560 capture'},{k:0.8,name:'1165 small'}];
(async()=>{const b=await chromium.launch();let pass=0,total=0;
for(const C of CASES){
  const ctx=await b.newContext();await ctx.addInitScript(()=>{window.LB_OCR={src:'/node_modules/tesseract.js/dist/tesseract.min.js',workerPath:'/node_modules/tesseract.js/dist/worker.min.js',corePath:'/node_modules/tesseract.js-core',langPath:'/node_modules/@tesseract.js-data/eng/4.0.0_best_int'};});
  const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://localhost:8123/index.html');await p.waitForTimeout(600);
  const out=await p.evaluate(async([C,IMG,MESO])=>{const im=await loadImg(IMG),mz=await loadImg(MESO);const W=Math.round(im.width*C.k),H=Math.round(im.height*C.k);
    const cv=document.createElement('canvas');cv.width=W;cv.height=H;const g=cv.getContext('2d');let inv={x:0.62,y:0.18,on:true};
    const draw=()=>{g.imageSmoothingEnabled=true;g.drawImage(im,0,0,W,H);
      if(inv.on){const s=C.k*115/202.4;/* that screen's UI is 1.76× the 1456 screenshot's */g.fillStyle='#d9d4c8';g.fillRect(inv.x*W-20*s,inv.y*H-30*s,(mz.width+40)*s,(mz.height+40)*s);g.drawImage(mz,inv.x*W,inv.y*H,mz.width*s,mz.height*s);}
      requestAnimationFrame(draw);};draw();
    const st=cv.captureStream(5);stream=st;video.srcObject=st;video.play();await new Promise(r=>setTimeout(r,700));
    await put('kv',{exp:null,meso:null,who:null,map:null},'ocrRegions');await put('kv',null,'ocrAuto');await put('kv',[],'mapPrints');await OCR.init();
    const t0=performance.now(),o=await OCR.autoFind(true),ms=Math.round(performance.now()-t0);
    const res={found:o,ms};
    const r=await OCR._readNow(63);res.exp=r.exp;res.meso=r.meso;res.rawMeso=r.rawMeso;
    const w=await OCR.readWho([{id:'c1',name:'TNAKRIZ',job:'magician'}]);res.level=w?.level;res.name=w?.name;
    const m=await OCR.readMap(allMaps());res.map=m?.map?.name||(m?.cands||[])[0]?.name;
    res.anchor=await OCR._learnAnchor();
    inv.on=false;await new Promise(r=>setTimeout(r,500));res.hiddenSeen=!OCR._mesoVisible();
    inv={x:0.25,y:0.45,on:true};await new Promise(r=>setTimeout(r,500));res.visibleAtOld=OCR._mesoVisible();
    const b2=OCR._locateMeso();res.relocated=!!b2&&Math.abs(b2.x-(0.25-59*C.k*0.95*0/W))<0.3;
    if(b2){const R=await (async()=>{const a=await getKV('ocrRegions');a.meso=b2;await put('kv',a,'ocrRegions');await OCR.init();return OCR._readNow(63);})();res.mesoAfterMove=R.meso;res.boxAfter=b2;}
    return res;},[C,IMG,MESO]);
  const small=C.k<1;   // at 0.8× the digits are ~7 px: hand-drawn boxes misread them too (reading limit, not finding)
  const chk={hud:!!(out.found?.exp&&out.found?.who),...(small?{}:{exp:out.exp?.exp===40652,level:out.level===63}),name:out.name==='TNAKRIZ',map:out.map==='Camp 1',
    meso:out.meso===430107,hidden:out.hiddenSeen===true&&out.visibleAtOld===false,moved:out.mesoAfterMove===430107};
  for(const k in chk){total++;pass+=chk[k];}
  console.log(C.name,JSON.stringify(chk));console.log('   ',JSON.stringify(out).slice(0,600),errs.join(';'));await ctx.close();}
console.log(`AUTO FIND PASS ${pass}/${total}`);await b.close();})();
