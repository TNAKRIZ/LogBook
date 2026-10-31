const {chromium}=require('playwright');const fs=require('fs');(async()=>{const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:1280,height:900},acceptDownloads:true,reducedMotion:'reduce'});
await ctx.addInitScript(()=>{window.LB_OCR={src:'/node_modules/tesseract.js/dist/tesseract.min.js',workerPath:'/node_modules/tesseract.js/dist/worker.min.js',corePath:'/node_modules/tesseract.js-core',langPath:'/node_modules/@tesseract.js-data/eng/4.0.0_best_int'};});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
await p.goto('http://localhost:8123/index.html');await p.waitForTimeout(700);
const reg=await p.evaluate(async()=>{const ex=await loadImg('fixtures/real-exp-1.png'),me=await loadImg('fixtures/meso-zoom.png');
  const W=1280,H=720;const cv=document.createElement('canvas');cv.width=W;cv.height=H;const g=cv.getContext('2d');const by=H-40,lv={x:8,y:by+4,w:150,h:34},mm={x:6,y:6};
  const draw=()=>{g.fillStyle='#2d5a33';g.fillRect(0,0,W,H);g.fillStyle='#2b2f38';g.fillRect(0,by,W,40);
    g.fillStyle='#3a3f4a';g.fillRect(lv.x,lv.y,46,30);g.font='bold 9px Arial';g.fillStyle='#fff';g.fillText('LV.',lv.x+3,lv.y+20);g.font='bold 18px Arial';g.lineWidth=3;g.strokeStyle='#3a1a00';g.strokeText('61',lv.x+20,lv.y+23);g.fillStyle='#f0a030';g.fillText('61',lv.x+20,lv.y+23);
    g.font='10px Arial';g.fillStyle='#b8c0cc';g.fillText('Cleric',lv.x+56,lv.y+12);g.fillStyle='#fff';g.fillText('TNAKRIZ',lv.x+56,lv.y+26);
    g.fillStyle='rgba(20,24,40,.85)';g.fillRect(mm.x,mm.y,190,110);g.font='bold 11px Arial';g.fillStyle='#fff';g.fillText('Remains <Tomb> III',mm.x+6,mm.y+14);
    g.drawImage(ex,900,520);g.drawImage(me,300,500);requestAnimationFrame(draw);};draw();
  const st=cv.captureStream(5);stream=st;video.srcObject=st;video.play();$('screenBlock').classList.remove('nostream');
  const n=(x,y,w,h)=>({x:x/W,y:y/H,w:w/W,h:h/H});
  return {exp:n(900+55,520+122,195,50),meso:n(300+2,500+32,90,16),who:n(lv.x,lv.y,lv.w,lv.h),map:n(mm.x+2,mm.y+1,186,19)};});
await p.waitForTimeout(500);
await p.evaluate(async r=>{characters.push({id:'ch-t',name:'TNAKRIZ',job:'magician',branch:null,created:Date.now(),last:null});await saveChars();fillCharSelect($('s_char'));onCharChange();await put('kv',r,'ocrRegions');await OCR.init();},reg);
await p.evaluate(()=>SW.reset());await p.evaluate(()=>detectAll());await p.waitForTimeout(500);
console.log('SUMMARY:',(await p.innerText('#detectAll')).replace(/\n/g,' | '));
await (await p.$('#startCard')).screenshot({path:'shot-detall.png'});
await p.click('#detGo');await p.waitForTimeout(300);console.log('after go step:',await p.textContent('#sw_steps li.on'),'err:',await p.textContent('#sw_err'));
console.log('fields',await p.inputValue('#s_level'),await p.inputValue('#s_exp'),await p.inputValue('#s_pct'),await p.inputValue('#s_mesos'),'char',await p.evaluate(()=>charOf($('s_char').value)?.name),'branch',await p.evaluate(()=>charOf($('s_char').value)?.branch),'map',await p.evaluate(()=>mapOf($('s_map').value)?.name));
// save test frame
await p.evaluate(()=>SW.goKey('ocr'));const [dl]=await Promise.all([p.waitForEvent('download'),p.click('#ocrSave')]);const f='saved-frame.png';await dl.saveAs(f);
const buf=fs.readFileSync(f);const i=buf.indexOf('tEXtlogbook');console.log('saved',buf.length,'bytes, has metadata',i>0, i>0?buf.slice(i+12,i+80).toString():'');
// reset two-tap
await p.click('#ocrReset');const t1=await p.textContent('#ocrReset');await p.click('#ocrReset');console.log('reset label',t1,'→',await p.textContent('#ocrReset'),'hint',await p.textContent('#ocrHint'));
console.log('ERR',errs);await b.close();})();
