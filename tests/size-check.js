// The picture-size check: Harry's Lv.70 screen at full size reads fine; shrunk to 1408 wide it warns that the digits are too small.
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.goto('http://localhost:8123/index.html');await p.waitForTimeout(600);
const r=await p.evaluate(async()=>{const im=await loadImg('fixtures/real-full-70.png');const cv=document.createElement('canvas'),g=cv.getContext('2d');let k=1;const d=()=>{g.drawImage(im,0,0,cv.width,cv.height);requestAnimationFrame(d);};
  cv.width=im.width;cv.height=im.height;d();stream=cv.captureStream(5);video.srcObject=stream;video.play();await new Promise(r=>setTimeout(r,600));await OCR.init();
  await OCR.autoFind(true);const big=OCR.sizeCheck();cv.width=1408;cv.height=792;await new Promise(r=>setTimeout(r,600));await OCR.autoFind(true);const small=OCR.sizeCheck();return {big,small};});
const ok=r.big.ok&&!r.big.warn&&!r.small.ok;console.log(JSON.stringify(r));console.log('full size ok, 1408 warns',ok,'| ERR',errs);await b.close();process.exit(ok&&!errs.length?0:1);})();
