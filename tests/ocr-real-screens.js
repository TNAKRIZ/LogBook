// Real game screenshot fixtures. Each case: image, scale it is shown at, box (in image px), expected values.
const {chromium}=require('playwright');
const CASES=[
  {img:'fixtures/real-exp-1.png',k:1,   box:[55,122,195,50],exp:{exp:186056,pct:13.82},name:'wide box (label+bar)'},
  {img:'fixtures/real-exp-1.png',k:1,   box:[100,125,145,22],exp:{exp:186056,pct:13.82},name:'tight box'},
  {img:'fixtures/real-exp-1.png',k:0.8, box:[55,122,195,50],exp:{exp:186056,pct:13.82},name:'wide box, capture 80%'},
  {img:'fixtures/real-exp-1.png',k:1.5, box:[55,122,195,50],exp:{exp:186056,pct:13.82},name:'wide box, capture 150%'},
  {img:'fixtures/real-exp-pct-only.png',k:1,box:[10,24,150,24],level:62,exp:{exp:1107957,pct:82.30},name:'over 1M: only [82.30%] shown, box with EXP label'},
  {img:'fixtures/real-exp-pct-only.png',k:1,box:[5,20,240,60],level:62,exp:{exp:1107957,pct:82.30},name:'over 1M: wide box incl. bar'},
  {img:'fixtures/real-exp-pct-only.png',k:1.5,box:[62,26,92,20],level:62,exp:{exp:1107957,pct:82.30},name:'over 1M: tight %, capture 150%'},
  {img:'fixtures/meso-zoom.png',k:1,box:[1,1,141,91],meso:1247717,name:'meso: box like Harry drew (slots+field+MESOS)'},
  {img:'fixtures/meso-zoom.png',k:1,box:[2,32,90,16],meso:1247717,name:'meso: tight box'},
  {img:'fixtures/meso-zoom.png',k:0.75,box:[1,1,141,91],meso:1247717,name:'meso: wide, 75% size'},
];
(async()=>{const b=await chromium.launch();let pass=0;
for(const C of CASES){
  const ctx=await b.newContext();await ctx.addInitScript(()=>{window.LB_OCR={src:'/node_modules/tesseract.js/dist/tesseract.min.js',workerPath:'/node_modules/tesseract.js/dist/worker.min.js',corePath:'/node_modules/tesseract.js-core',langPath:'/node_modules/@tesseract.js-data/eng/4.0.0_best_int'};});
  const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://localhost:8123/index.html');await p.waitForTimeout(600);
  const reg=await p.evaluate(async C=>{const im=await loadImg(C.img);const W=1280,H=720;const cv=document.createElement('canvas');cv.width=W;cv.height=H;const g=cv.getContext('2d');
    const ox=W-im.width*C.k-20,oy=H-im.height*C.k-10;
    const draw=()=>{g.fillStyle='#234';g.fillRect(0,0,W,H);g.imageSmoothingEnabled=true;g.drawImage(im,ox,oy,im.width*C.k,im.height*C.k);requestAnimationFrame(draw);};draw();
    const st=cv.captureStream(5);stream=st;video.srcObject=st;video.play();
    const [x,y,w,h]=C.box;const R={x:(ox+x*C.k)/W,y:(oy+y*C.k)/H,w:w*C.k/W,h:h*C.k/H};return C.meso?{exp:null,meso:R}:{exp:R,meso:null};},C);
  await p.waitForTimeout(500);await p.evaluate(async r=>{await put('kv',r,'ocrRegions');await OCR.init();},reg);
  const r=await p.evaluate(L=>OCR._readNow(L??undefined),C.level??null);
  const ok=C.meso?r.meso===C.meso:(r.exp&&r.exp.exp===C.exp.exp&&r.exp.pct===C.exp.pct);pass+=ok;
  if(!ok)console.log('   ',JSON.stringify(C.meso?r.allMeso:r.allExp));console.log(ok?'✓':'✗',C.name,C.meso?r.meso:JSON.stringify(r.exp),'raw',JSON.stringify(C.meso?r.rawMeso:r.rawExp),errs.join(';'));
  await ctx.close();}
console.log(`REAL PASS ${pass}/${CASES.length}`);await b.close();})();
