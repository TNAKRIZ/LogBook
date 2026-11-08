// Builds the built-in % digit shapes from Harry's real screens (known values), at several capture sizes.
// Output: tools/pct_tpl.json — embedded in index.html as BUILTIN_TPL.pct. Run with the test server on :8123.
const {chromium}=require('playwright');const fs=require('fs');
const SRC=[{img:'fixtures/real-full-68.png',pct:'5803'},{img:'fixtures/real-full-70.png',pct:'5999'},
  {img:'fixtures/real-exp-pct-only.png',pct:'8230',box:[10,24,150,24]},{img:'fixtures/real-hud-63-913621.png',pct:'6434',box:[820,62,200,28]},
  {img:'fixtures/real-hud-63-full.jpg',pct:'286',box:[765,782,140,32]}];
(async()=>{const b=await chromium.launch();const ctx=await b.newContext();await ctx.addInitScript(()=>{window.LB_OCR={src:'/node_modules/tesseract.js/dist/tesseract.min.js',workerPath:'/node_modules/tesseract.js/dist/worker.min.js',corePath:'/node_modules/tesseract.js-core',langPath:'/node_modules/@tesseract.js-data/eng/4.0.0_best_int'};});
const p=await ctx.newPage();await p.goto('http://localhost:8123/index.html');await p.waitForTimeout(800);
const out=await p.evaluate(async SRC=>{const acc={};let cv=document.createElement('canvas'),g=cv.getContext('2d'),im=null;const d=()=>{if(im)g.drawImage(im,0,0,cv.width,cv.height);requestAnimationFrame(d);};d();
  stream=cv.captureStream(5);video.srcObject=stream;video.play();
  for(const S of SRC)for(const k of [1,0.85,0.7,0.55]){im=await loadImg(S.img);cv.width=Math.round(im.width*k);cv.height=Math.round(im.height*k);await new Promise(r=>setTimeout(r,450));
    let R;if(S.box){const [x,y,w,h]=S.box;R={x:x/im.width,y:y/im.height,w:w/im.width,h:h/im.height};}
    else{await put('kv',{exp:null,meso:null,who:null,map:null},'ocrRegions');await put('kv',null,'ocrAuto');await OCR.init();await OCR.autoFind(true);R=(await getKV('ocrRegions')).exp;}
    const V=OCR._variantsOf(R);if(!V)continue;
    for(const x of V.list){if(!x.gPct||x.gPct.length!==S.pct.length)continue;x.gPct.forEach((sh,i)=>{const L=acc[S.pct[i]]=acc[S.pct[i]]||[];if(!L.some(t=>OCR._tplSim(sh,t)>0.95))L.push(sh);});}}
  return acc;},SRC);
for(const dg in out)out[dg]=out[dg].slice(0,8);
fs.writeFileSync(__dirname+'/pct_tpl.json',JSON.stringify(out));console.log(Object.fromEntries(Object.entries(out).map(([k,v])=>[k,v.length])));await b.close();})();
