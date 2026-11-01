// Real MapleStory Classic HUD (Harry's screen, Lv.63): level tiles, EXP and the 2-line minimap title.
const {chromium}=require('playwright');
const IMG='fixtures/real-hud-63-full.jpg';
const BOX={who:[305,785,160,30],exp:[768,785,115,15],map:[50,25,96,36],expWide:[765,782,140,32]};
const CASES=[{k:1,name:'screenshot size'},{k:1.76,name:'native 2560 (upscaled)'}];
(async()=>{const b=await chromium.launch();let pass=0,total=0;
for(const C of CASES){
  const ctx=await b.newContext();await ctx.addInitScript(()=>{window.LB_OCR={src:'/node_modules/tesseract.js/dist/tesseract.min.js',workerPath:'/node_modules/tesseract.js/dist/worker.min.js',corePath:'/node_modules/tesseract.js-core',langPath:'/node_modules/@tesseract.js-data/eng/4.0.0_best_int'};});
  const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://localhost:8123/index.html');await p.waitForTimeout(600);
  const out=await p.evaluate(async([C,IMG,BOX])=>{const im=await loadImg(IMG);const W=Math.round(im.width*C.k),H=Math.round(im.height*C.k);
    const cv=document.createElement('canvas');cv.width=W;cv.height=H;const g=cv.getContext('2d');
    const draw=()=>{g.imageSmoothingEnabled=true;g.drawImage(im,0,0,W,H);requestAnimationFrame(draw);};draw();
    const st=cv.captureStream(5);stream=st;video.srcObject=st;video.play();await new Promise(r=>setTimeout(r,600));
    const n=([x,y,w,h])=>({x:x/im.width,y:y/im.height,w:w/im.width,h:h/im.height});
    const res={};
    for(const [tag,eb] of [['tight',BOX.exp],['wide',BOX.expWide]]){
      await put('kv',{exp:n(eb),meso:null,who:n(BOX.who),map:n(BOX.map)},'ocrRegions');await OCR.init();
      const r=await OCR._readNow(63);res['exp_'+tag]={exp:r.exp,raw:r.rawExp};}
    const w=await OCR.readWho([{id:'c1',name:'TNAKRIZ',job:'magician'}]);res.who={level:w?.level,name:w?.name,raw:w?.raw};
    const m=await OCR.readMap(allMaps());res.map={name:m?.map?.name,cands:(m?.cands||[]).map(x=>x.name),raw:m?.raw};
    return res;},[C,IMG,BOX]);
  const chk={level:out.who.level===63,name:out.who.name==='TNAKRIZ',exp_tight:out.exp_tight.exp?.exp===40652&&out.exp_tight.exp?.pct===2.86,exp_wide:out.exp_wide.exp?.exp===40652&&out.exp_wide.exp?.pct===2.86,map:out.map.name==='Camp 1'||out.map.cands[0]==='Camp 1'};
  for(const k in chk){total++;pass+=chk[k];}
  console.log(C.name,JSON.stringify(chk));console.log('   ',JSON.stringify(out),errs.join(';'));await ctx.close();}
console.log(`REAL HUD PASS ${pass}/${total}`);await b.close();})();
