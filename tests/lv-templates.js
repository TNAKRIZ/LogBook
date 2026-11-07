// LV digits learned from a proven level: after learning Lv.68 on Harry's screen, the LV box reads 68 by shape (no Tesseract)
// at the same and at other capture sizes; a level with an unlearned digit (63) still reads through Tesseract.
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext();await ctx.addInitScript(()=>{window.LB_OCR={src:'/node_modules/tesseract.js/dist/tesseract.min.js',workerPath:'/node_modules/tesseract.js/dist/worker.min.js',corePath:'/node_modules/tesseract.js-core',langPath:'/node_modules/@tesseract.js-data/eng/4.0.0_best_int'};});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.goto('http://localhost:8123/index.html');await p.waitForTimeout(600);
const r=await p.evaluate(async()=>{let cv,g,im,K=1;const show=async(src,k)=>{im=await loadImg(src);K=k;cv.width=Math.round(im.width*k);cv.height=Math.round(im.height*k);await new Promise(r=>setTimeout(r,500));await OCR.autoFind(true);};
  cv=document.createElement('canvas');g=cv.getContext('2d');const d=()=>{if(im)g.drawImage(im,0,0,cv.width,cv.height);requestAnimationFrame(d);};d();
  stream=cv.captureStream(5);video.srcObject=stream;video.play();
  await put('kv',{},'digitTpl');await put('kv',{exp:null,meso:null,who:null,map:null},'ocrRegions');await put('kv',null,'ocrAuto');await OCR.init();
  const out={};
  await show('fixtures/real-full-68.png',1);out.before=await OCR._readLevelDigits();out.learned=await OCR._learnLevel(68);
  out.same=await OCR._readLevelDigits();
  await show('fixtures/real-full-68.png',0.7822);out.smaller=await OCR._readLevelDigits();
  await show('fixtures/real-hud-63-full.jpg',1);out.other=await OCR._readLevelDigits();
  return out;});
const ok1=r.learned===true,ok2=r.same?.level===68&&r.same.byTpl,ok3=r.smaller?.level===68,   /* at 0.78× the tile cut may be missing → Tesseract; Harry's capture size stays the same */ok4=r.other?.level===63&&!r.other.byTpl;
console.log(JSON.stringify(r));console.log('learned',ok1,'| read by shape',ok2,'| other size still 68',ok3,'| unlearned digit → Tesseract',ok4,'| ERR',errs);
await b.close();process.exit(ok1&&ok2&&ok3&&ok4&&!errs.length?0:1);})();
