// Map title remembered as a picture: after the player confirms a map once, the same title is recognised without reading letters,
// a different title is not mistaken for it, and an empty box is flagged.
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext();
await ctx.addInitScript(()=>{window.LB_OCR={src:'/node_modules/tesseract.js/dist/tesseract.min.js',workerPath:'/node_modules/tesseract.js/dist/worker.min.js',corePath:'/node_modules/tesseract.js-core',langPath:'/node_modules/@tesseract.js-data/eng/4.0.0_best_int'};});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8123/index.html');await p.waitForTimeout(600);
const r=await p.evaluate(async()=>{const W=1280,H=720;const cv=document.createElement('canvas');cv.width=W;cv.height=H;const g=cv.getContext('2d');window.TITLE='Ant Tunnel II';
  const draw=()=>{g.fillStyle='#2d5a33';g.fillRect(0,0,W,H);g.fillStyle='rgba(20,24,40,.85)';g.fillRect(6,6,190,110);
    // textured minimap art behind the title, like the game
    for(let i=0;i<40;i++){g.fillStyle=i%2?'#6a8':'#486';g.fillRect(8+i*4,8,3,18);}
    g.font='bold 11px Arial';g.lineWidth=2;g.strokeStyle='#000';g.strokeText(window.TITLE,12,20);g.fillStyle='#fff';g.fillText(window.TITLE,12,20);requestAnimationFrame(draw);};draw();
  const st=cv.captureStream(5);stream=st;video.srcObject=st;video.play();await new Promise(r=>setTimeout(r,500));
  await put('kv',{exp:null,meso:{x:600/W,y:600/H,w:80/W,h:14/H},who:null,map:{x:8/W,y:7/H,w:186/W,h:19/H}},'ocrRegions');await put('kv',[],'mapPrints');await OCR.init();
  const maps=allMaps(),ant=maps.find(m=>m.name==='Ant Tunnel II'),other=maps.find(m=>m.name==='Ant Tunnel III')||maps.find(m=>m.name!=='Ant Tunnel II');
  await OCR.rememberMap(String(ant.id));
  const same=await OCR.readMap(maps);
  window.TITLE=other.name;await new Promise(r=>setTimeout(r,500));const diff=await OCR.readMap(maps);
  const warn=await OCR.checkBoxes();
  return {same:{name:same?.map?.name,pic:!!same?.byPicture,raw:same?.raw},diff:{name:diff?.map?.name,pic:!!diff?.byPicture,cands:(diff?.cands||[]).map(m=>m.name),other:other.name},warn};});
const ok1=r.same.pic&&r.same.name==='Ant Tunnel II', ok2=!r.diff.pic, ok3=r.warn.some(w=>w.includes('Meso'));
console.log(JSON.stringify(r));console.log('same title by picture',ok1,'| other title not mistaken',ok2,'| empty box flagged',ok3,'| ERR',errs);
await b.close();process.exit(ok1&&ok2&&ok3&&!errs.length?0:1);})();
