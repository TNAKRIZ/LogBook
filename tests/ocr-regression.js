// Realistic MapleStory-like HUD mock: small thin grey digits, "EXP" label + gauge inside the box, meso field with border/coin/button.
const {chromium}=require('playwright');
const CASES=[
 {name:'aa-wide',crisp:false,boxes:'wide'},{name:'aa-tight',crisp:false,boxes:'tight'},
 {name:'crisp-wide',crisp:true,boxes:'wide'},{name:'crisp-tight',crisp:true,boxes:'tight'},
 {name:'aa-wide-1366',crisp:false,boxes:'wide',W:1366,H:768},
 {name:'aa-wide-1920x1200-ui1.5',crisp:false,boxes:'wide',W:1920,H:1200,S:1.5},
 {name:'aa-tight-1920x1200-ui1.5',crisp:false,boxes:'tight',W:1920,H:1200,S:1.5},
];
(async()=>{const b=await chromium.launch();let pass=0,total=0;
for(const C of CASES){
const ctx=await b.newContext({viewport:{width:1280,height:900}});
await ctx.addInitScript(()=>{window.LB_OCR={src:'/node_modules/tesseract.js/dist/tesseract.min.js',workerPath:'/node_modules/tesseract.js/dist/worker.min.js',corePath:'/node_modules/tesseract.js-core',langPath:'/node_modules/@tesseract.js-data/eng/4.0.0_best_int'};});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
await p.goto('http://localhost:8123/index.html');await p.waitForTimeout(700);
const regs=await p.evaluate(C=>{
  const S=C.S||1;const W0=C.W||1280,H0=C.H||720;const W=W0/S,H=H0/S;const cv=document.createElement('canvas');cv.width=W0;cv.height=H0;const g=cv.getContext('2d');
  window.__fake={exp:401304,pct:31.44,meso:1013882};
  const by=H-40; // HUD top
  const ex={x:Math.round(W*0.62),y:by+6,w:150,h:30}; // exp gauge block
  const ms={x:60,y:H-150,w:170,h:18};              // meso field row
  const crispify=(x,y,w,h)=>{const d=g.getImageData(x,y,w,h);const a=d.data;for(let i=0;i<a.length;i+=4){const L=(a[i]+a[i+1]+a[i+2])/3;}g.putImageData(d,x,y);};
  function text(t,x,y,font,color,align='left'){
    if(!C.crisp){g.font=font;g.fillStyle=color;g.textAlign=align;g.fillText(t,x,y);return;}
    const o=document.createElement('canvas');o.width=300;o.height=30;const q=o.getContext('2d');q.font=font;q.fillStyle='#000';q.textAlign='left';q.fillText(t,2,20);
    const w=q.measureText(t).width;const d=q.getImageData(0,0,300,30);const col=color.match(/\w\w/g).map(h=>parseInt(h,16));
    for(let i=0;i<d.data.length;i+=4){const on=d.data[i+3]>110;d.data[i]=col[0];d.data[i+1]=col[1];d.data[i+2]=col[2];d.data[i+3]=on?255:0;}
    q.putImageData(d,0,0);g.drawImage(o,(align==='right'?x-w:x)-2,y-20);}
  const draw=()=>{const f=window.__fake;g.setTransform(S,0,0,S,0,0);
    const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#2f6b3a');gr.addColorStop(1,'#163a1e');g.fillStyle=gr;g.fillRect(0,0,W,H);
    for(let i=0;i<40;i++){g.fillStyle=`rgba(${120+i*3},${200-i*2},90,.35)`;g.fillRect((i*97)%W,(i*53)%(H-60),60,40);}
    // HUD bar
    g.fillStyle='#2b2f38';g.fillRect(0,by,W,40);g.fillStyle='#4a505c';g.fillRect(0,by,W,2);
    // level box + hp/mp bars for realism
    g.fillStyle='#3a3f4a';g.fillRect(80,by+6,120,30);text('LV. 61',90,by+26,'bold 12px Arial','#ffffff');
    g.fillStyle='#d23b2b';g.fillRect(380,by+24,140,7);g.fillStyle='#2b7bd2';g.fillRect(540,by+24,140,7);
    // EXP block: label + value on one line, gauge below
    g.fillStyle='#3a3f4a';g.fillRect(ex.x,ex.y,ex.w,ex.h);g.strokeStyle='#1c1f25';g.lineWidth=1;g.strokeRect(ex.x+.5,ex.y+.5,ex.w-1,ex.h-1);
    text('EXP',ex.x+5,ex.y+12,'bold 9px Arial','#ffffff');
    text(`${f.exp} [${f.pct.toFixed(2)}%]`,ex.x+30,ex.y+12,'10px Arial','#cfcfcf');
    g.fillStyle='#111';g.fillRect(ex.x+4,ex.y+17,ex.w-8,9);g.fillStyle='#b8d42a';g.fillRect(ex.x+5,ex.y+18,Math.round((ex.w-10)*f.pct/100),7);
    // inventory window bottom with meso field
    g.fillStyle='#e9e4dc';g.fillRect(40,H-330,230,200);g.fillStyle='#d8d2c8';g.fillRect(40,ms.y-6,230,30);
    g.fillStyle='#f2c230';g.beginPath();g.arc(52,ms.y+9,6,0,7);g.fill();
    g.fillStyle='#ffffff';g.fillRect(ms.x,ms.y,ms.w-40,ms.h);g.strokeStyle='#8a8a8a';g.strokeRect(ms.x+.5,ms.y+.5,ms.w-41,ms.h-1);
    text(f.meso.toLocaleString('en-US'),ms.x+ms.w-46,ms.y+13,'10px Arial','#202020','right');
    g.fillStyle='#b9b2a6';g.fillRect(ms.x+ms.w-36,ms.y+1,34,16);text('MESO',ms.x+ms.w-33,ms.y+13,'bold 8px Arial','#ffffff');
    requestAnimationFrame(draw);};draw();
  const st=cv.captureStream(10);stream=st;video.srcObject=st;video.play();$('screenBlock').classList.remove('nostream');
  const pad=C.boxes==='wide';
  const E=pad?{x:ex.x,y:ex.y,w:ex.w,h:ex.h}:{x:ex.x+29,y:ex.y+2,w:100,h:13};
  const M=pad?{x:ms.x-12,y:ms.y-2,w:ms.w+14,h:ms.h+4}:{x:ms.x+40,y:ms.y+2,w:ms.w-84,h:ms.h-4};
  return {exp:{x:E.x/W,y:E.y/H,w:E.w/W,h:E.h/H},meso:{x:M.x/W,y:M.y/H,w:M.w/W,h:M.h/H}};
},C);
await p.waitForTimeout(600);
await p.evaluate(async r=>{await put('kv',r,'ocrRegions');await OCR.init();},regs);
const res=await p.evaluate(async()=>{const out=[];for(let i=0;i<3;i++){const r=await OCR._readNow();out.push(r);window.__fake.exp+=3210;window.__fake.pct=+(window.__fake.pct+0.25).toFixed(2);window.__fake.meso+=1520;await new Promise(z=>setTimeout(z,400));}return out;});
const exp0=[401304,404514,407724],pct0=[31.44,31.69,31.94],mes0=[1013882,1015402,1016922];
res.forEach((r,i)=>{total+=2;const okE=r.exp?.exp===exp0[i]&&Math.abs((r.exp?.pct??-1)-pct0[i])<0.001,okM=r.meso===mes0[i];pass+=okE+okM;
  console.log(C.name,i,'EXP',JSON.stringify(r.exp),okE?'✓':'✗','raw',JSON.stringify(r.rawExp),'| MESO',r.meso,okM?'✓':'✗','raw',JSON.stringify(r.rawMeso));});
if(C.name==='aa-wide-1920x1200-ui1.5'&&process.env.SHOT){
  await p.evaluate(()=>{$('s_char').value='__new';onCharChange();$('nc_name').value='TNAKRIZ';setStartMap(BUILTIN_MAPS[0].id);SW.goKey('ocr');});
  await p.selectOption('#ocrInt','5');await p.click('#ocrOn');await p.waitForTimeout(9000);
  await (await p.$('#ocrBlock')).screenshot({path:'shot-ocrlog.png'});
  await p.click('#sw_next');await p.waitForTimeout(6000);await (await p.$('.wstep.on')).screenshot({path:'shot-confirm.png'});
  // PiP statuses: clear meso box to show the "not set" note
  await p.evaluate(async()=>{const r=await getKV('ocrRegions');await put('kv',{exp:r.exp,meso:null},'ocrRegions');await OCR.init();delete window.documentPictureInPicture;});
  const [pop]=await Promise.all([p.waitForEvent('popup'),p.evaluate(()=>PIP.open('full'))]);await pop.setViewportSize({width:320,height:270});await pop.waitForTimeout(7000);await pop.screenshot({path:'shot-pip.png'});
}
if(errs.length)console.log('ERR',errs);await ctx.close();}
console.log(`PASS ${pass}/${total}`);await b.close();})();
