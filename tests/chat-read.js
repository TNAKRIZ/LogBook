// Chat lines read from the box above the HUD (English + Korean). Uses a local-only screenshot (other players' messages are
// not committed): fixtures/_chat70.png in the test server folder; skipped when it is absent. Translation needs Chrome's
// on-device Translator (not in headless) — here only the fallback note is checked.
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext();await ctx.addInitScript(()=>{window.LB_OCR={src:'/node_modules/tesseract.js/dist/tesseract.min.js',workerPath:'/node_modules/tesseract.js/dist/worker.min.js',corePath:'/node_modules/tesseract.js-core',langPath:'/node_modules/@tesseract.js-data/eng/4.0.0_best_int',chatLangPath:'/lang'};});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.goto('http://localhost:8123/index.html');await p.waitForTimeout(600);
const has=await p.evaluate(async()=>(await fetch('fixtures/_chat70.png',{method:'HEAD'})).ok);if(!has){console.log('SKIP (no local chat screenshot)');await b.close();return;}
const r=await p.evaluate(async()=>{const im=await loadImg('fixtures/_chat70.png');const cv=document.createElement('canvas');cv.width=im.width;cv.height=im.height;const g=cv.getContext('2d');const d=()=>{g.drawImage(im,0,0);requestAnimationFrame(d);};d();
  stream=cv.captureStream(5);video.srcObject=stream;video.play();await new Promise(r=>setTimeout(r,600));await OCR.init();await OCR.autoFind(true);
  const t0=performance.now(),x=await OCR.readChat();x.ms=Math.round(performance.now()-t0);x.api=['Translator','LanguageDetector'].filter(k=>k in self);await chatRun();x.ui=$('chatList').innerText.slice(0,300);return x;});
console.log(JSON.stringify(r.lines,null,0),r.ms+'ms');console.log(r.ui.replace(/\n/g,' | '));
const names=r.lines.map(l=>l.name),ok1=r.lines.length>=3&&names.some(n=>/Milady/.test(n))&&names.filter(Boolean).length>=3,ok2=r.lines.some(l=>/insane/.test(l.msg))&&r.lines.some(l=>/[가-힣]{3}/.test(l.msg));
console.log('lines with names',ok1,'| English + Korean text',ok2,'| ERR',errs);await b.close();process.exit(ok1&&ok2&&!errs.length?0:1);})();
