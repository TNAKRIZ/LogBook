// Digit templates learned from proven reads, then used where Tesseract fails (small digits).
const {chromium}=require('playwright');
async function page(b,img,k,box,kind){const ctx=await b.newContext();await ctx.addInitScript(()=>{window.LB_OCR={src:'/node_modules/tesseract.js/dist/tesseract.min.js',workerPath:'/node_modules/tesseract.js/dist/worker.min.js',corePath:'/node_modules/tesseract.js-core',langPath:'/node_modules/@tesseract.js-data/eng/4.0.0_best_int'};});
  const p=await ctx.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));await p.goto('http://localhost:8123/index.html');await p.waitForTimeout(500);
  await p.evaluate(async([img,k,box,kind])=>{const im=await loadImg(img);const W=Math.round(im.width*k)+40,H=Math.round(im.height*k)+40;
    const cv=document.createElement('canvas');cv.width=W;cv.height=H;const g=cv.getContext('2d');window._im=im;window._k=k;
    window._draw=()=>{g.fillStyle='#222';g.fillRect(0,0,W,H);g.imageSmoothingEnabled=true;g.drawImage(window._im,20,20,window._im.width*window._k,window._im.height*window._k);requestAnimationFrame(window._draw);};window._draw();
    const st=cv.captureStream(5);stream=st;video.srcObject=st;video.play();await new Promise(r=>setTimeout(r,500));
    const [x,y,w,h]=box;const R={x:(20+x*k)/W,y:(20+y*k)/H,w:w*k/W,h:h*k/H};
    await put('kv',kind==='meso'?{exp:null,meso:R}:{exp:R,meso:null},'ocrRegions');await put('kv',{},'digitTpl');await OCR.init();},[img,k,box,kind]);return p;}
(async()=>{const b=await chromium.launch();let pass=0,total=0;
 // Meso at ~11 px digits: Tesseract read 137640; after the player confirms the start value once, templates read it
 {const p=await page(b,'fixtures/real-meso-1376646.png',0.6,[168,236,92,26],'meso');
  const before=await p.evaluate(()=>OCR._readNow().then(r=>r.meso));
  await p.evaluate(()=>OCR.learnMeso(1376646));
  const after=await p.evaluate(()=>OCR._readNow().then(r=>({v:r.meso,raw:r.rawMeso})));
  const ok=after.v===1376646;total++;pass+=ok;console.log(ok?'✓':'✗','meso ×0.6 before',before,'after learning',JSON.stringify(after),p.errs.join(';'));}
 // EXP: a proven read teaches the templates; the next reads use them
 {const p=await page(b,'fixtures/real-hud-63-913621.png',1,[820,62,200,28],'exp');
  const r1=await p.evaluate(()=>OCR._readNow(63).then(r=>({v:r.exp,raw:r.rawExp})));
  const n=await p.evaluate(()=>Object.keys(OCR._tpl()?.exp||{}).length);
  const r2=await p.evaluate(()=>OCR._readNow(63).then(r=>({v:r.exp,raw:r.rawExp})));
  const ok=r2.v?.exp===913621&&r2.v?.pct===64.34&&/tpl|แม่แบบ/.test(r2.raw);total++;pass+=ok;console.log(ok?'✓':'✗','EXP learned digits',n,'second read',JSON.stringify(r2),p.errs.join(';'));}
 console.log(`TEMPLATES PASS ${pass}/${total}`);await b.close();})();
