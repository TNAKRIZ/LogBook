// Real captures with known values (Harry, Lv.63): Meso field and EXP line that lost digits before.
const {chromium}=require('playwright');
const CASES=[
  {img:'fixtures/real-meso-1376646.png',k:1,box:[168,236,92,26],kind:'meso',want:1376646,name:'meso 1,376,646 (as shown in the card)'},
  {img:'fixtures/real-meso-1376646.png',k:2,box:[168,236,92,26],kind:'meso',want:1376646,name:'meso 1,376,646 ×2'},
  {img:'fixtures/real-meso-1376646.png',k:0.6,box:[168,236,92,26],kind:'meso',want:1376646,name:'meso ×0.6 (digits ~11 px)'},
  {img:'fixtures/real-meso-1376646.png',k:0.45,box:[168,236,92,26],kind:'meso',want:1376646,name:'meso ×0.45 (digits ~8 px)'},
  {img:'fixtures/real-hud-63-913621.png',k:0.45,box:[820,62,200,28],kind:'exp',level:63,want:{exp:913621,pct:64.34},name:'EXP with label ×0.45'},
  {img:'fixtures/real-hud-63-913621.png',k:1,box:[870,66,150,22],kind:'exp',level:63,want:{exp:913621,pct:64.34},name:'EXP tight 913,621 [64.34%]'},
  {img:'fixtures/real-hud-63-913621.png',k:1,box:[820,62,200,28],kind:'exp',level:63,want:{exp:913621,pct:64.34},name:'EXP with label'},
  {img:'fixtures/real-hud-63-913621.png',k:0.6,box:[820,62,200,28],kind:'exp',level:63,want:{exp:913621,pct:64.34},name:'EXP with label, small'},
];
(async()=>{const b=await chromium.launch();let pass=0;
for(const C of CASES){
  const ctx=await b.newContext();await ctx.addInitScript(()=>{window.LB_OCR={src:'/node_modules/tesseract.js/dist/tesseract.min.js',workerPath:'/node_modules/tesseract.js/dist/worker.min.js',corePath:'/node_modules/tesseract.js-core',langPath:'/node_modules/@tesseract.js-data/eng/4.0.0_best_int'};});
  const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://localhost:8123/index.html');await p.waitForTimeout(500);
  const r=await p.evaluate(async C=>{const im=await loadImg(C.img);const W=Math.round(im.width*C.k)+40,H=Math.round(im.height*C.k)+40;
    const cv=document.createElement('canvas');cv.width=W;cv.height=H;const g=cv.getContext('2d');
    const draw=()=>{g.fillStyle='#222';g.fillRect(0,0,W,H);g.imageSmoothingEnabled=true;g.drawImage(im,20,20,im.width*C.k,im.height*C.k);requestAnimationFrame(draw);};draw();
    const st=cv.captureStream(5);stream=st;video.srcObject=st;video.play();await new Promise(r=>setTimeout(r,500));
    const [x,y,w,h]=C.box;const R={x:(20+x*C.k)/W,y:(20+y*C.k)/H,w:w*C.k/W,h:h*C.k/H};
    await put('kv',C.kind==='meso'?{exp:null,meso:R}:{exp:R,meso:null},'ocrRegions');await OCR.init();
    const o=await OCR._readNow(C.level??undefined);return {exp:o.exp,meso:o.meso,raw:C.kind==='meso'?o.rawMeso:o.rawExp,all:C.kind==='meso'?o.allMeso:o.allExp};},C);
  const ok=C.kind==='meso'?r.meso===C.want:(r.exp&&r.exp.exp===C.want.exp&&r.exp.pct===C.want.pct);pass+=ok;
  console.log(ok?'✓':'✗',C.name,JSON.stringify(C.kind==='meso'?r.meso:r.exp),'raw',JSON.stringify(r.raw));if(!ok)console.log('    ',JSON.stringify(r.all));await ctx.close();}
console.log(`REAL READS PASS ${pass}/${CASES.length}`);await b.close();})();
