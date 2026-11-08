// The map comes from the title TEXT first: the picture was once filed under "Camp 2" (a wrong pick), the screen says
// "Victoria Road / Camp 1" → Camp 1; confirming Camp 1 replaces the wrong picture.
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext();await ctx.addInitScript(()=>{window.LB_OCR={src:'/node_modules/tesseract.js/dist/tesseract.min.js',workerPath:'/node_modules/tesseract.js/dist/worker.min.js',corePath:'/node_modules/tesseract.js-core',langPath:'/node_modules/@tesseract.js-data/eng/4.0.0_best_int'};});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.goto('http://localhost:8123/index.html');await p.waitForTimeout(600);
const r=await p.evaluate(async()=>{const im=await loadImg('fixtures/real-full-70.png');const cv=document.createElement('canvas');cv.width=im.width;cv.height=im.height;const g=cv.getContext('2d');const d=()=>{g.drawImage(im,0,0);requestAnimationFrame(d);};d();
  stream=cv.captureStream(5);video.srcObject=stream;video.play();await new Promise(r=>setTimeout(r,600));
  await put('kv',{exp:null,meso:null,who:null,map:null},'ocrRegions');await put('kv',null,'ocrAuto');await put('kv',[],'mapPrints');await OCR.init();await OCR.autoFind(true);
  const camp2=allMaps().find(m=>m.name==='Camp 2'),camp1=allMaps().find(m=>m.name==='Camp 1');
  await OCR.rememberMap(camp2.id);const a=await OCR.readMap(allMaps());const prints=(await getKV('mapPrints')).map(x=>String(x.mapId));
  await OCR.rememberMap(camp1.id);const b2=await OCR.readMap(allMaps());const camp2AfterConfirm=(await getKV('mapPrints')).some(x=>String(x.mapId)===String(camp2.id));
  return {first:a.map?.name,raw:a.raw,camp2Left:prints.includes(String(camp2.id)),second:b2.map?.name,camp2AfterConfirm};});
const ok1=r.first==='Camp 1',ok2=r.second==='Camp 1'&&r.camp2AfterConfirm===false;
console.log(JSON.stringify(r));console.log('text beats a wrong picture',ok1,'| confirming replaces the wrong picture',ok2,'| ERR',errs);
await b.close();process.exit(ok1&&ok2&&!errs.length?0:1);})();
