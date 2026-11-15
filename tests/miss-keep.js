// Turned-down reads keep their own crop (last 5 per kind, memory only) and travel inside the test-save PNG.
const {chromium}=require('playwright');
const BASE=process.env.LB_BASE||'http://localhost:8123';
(async()=>{const b=await chromium.launch();const p=await (await b.newContext()).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(BASE+'/index.html');await p.waitForTimeout(600);
const o=await p.evaluate(async()=>{const im=await loadImg('fixtures/real-meso-1376646.png');const cv=document.createElement('canvas');cv.width=im.width;cv.height=im.height;const g=cv.getContext('2d');const d=()=>{g.drawImage(im,0,0);requestAnimationFrame(d);};d();
  stream=cv.captureStream(5);video.srcObject=stream;video.play();await new Promise(r=>setTimeout(r,500));
  OCR._setRegion('meso',{x:0.1,y:0.1,w:0.8,h:0.8});
  for(let i=0;i<7;i++)OCR._keepMiss('meso',{meso:22222+i,rawMeso:'vote: 22222'},Date.now()+i);
  const m=OCR._misses();return {n:m.meso.length,last:m.meso[4].read,img:m.meso[0].img.slice(0,22),w:(await loadImg(m.meso[0].img)).width};});
let pass=0,total=0;const ok=(c,l,g)=>{total++;if(c)pass++;else console.log('  ✗',l,JSON.stringify(g));};
ok(o.n===5&&o.last===22228,'keeps only the last 5',o);ok(o.img==='data:image/png;base64,'&&o.w>0,'crop is a PNG of the box',o);ok(!errs.length,'no page errors',errs);
console.log(pass===total?`PASS miss-keep ${pass}/${total}`:`FAIL miss-keep ${pass}/${total}`);await b.close();process.exit(pass===total?0:1);})();
