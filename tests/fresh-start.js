// Harry, Nov 16: on another character (THANAKRIZ, Swordsman Lv.22) the page picked his Cleric TNAKRIZ and kept an old Meso box that
// cut the last digit. Rules: the name on screen decides (no "close enough", no matching the end of a longer name; a saved character
// with another job or a higher level is not it), and every screen share finds the boxes again from scratch, hand-drawn ones included.
const {chromium}=require('playwright');
const BASE=process.env.LB_BASE||'http://localhost:8123';
(async()=>{const b=await chromium.launch();let pass=0,total=0;const ok=(c,l,g)=>{total++;if(c)pass++;else console.log('  ✗',l,JSON.stringify(g));};
const ctx=await b.newContext();await ctx.addInitScript(()=>{window.LB_OCR={src:'/node_modules/tesseract.js/dist/tesseract.min.js',workerPath:'/node_modules/tesseract.js/dist/worker.min.js',corePath:'/node_modules/tesseract.js-core',langPath:'/node_modules/@tesseract.js-data/eng/4.0.0_best_int'};});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.goto(BASE+'/index.html');await p.waitForTimeout(600);
const o=await p.evaluate(()=>{const K=[{id:'a',name:'TNAKRIZ',job:'magician',last:{level:75}},{id:'b',name:'Milady',job:'thief'}];const W=t=>OCR._parseWho([t,t],K);   // two reads of the box, as the reader makes
  return {other:W('THANAKRIZ Swordsman LV. 22'),same:W('TNAKRIZ Cleric LV. 75'),lookalike:W('TNAKRlZ Cleric LV. 75'),lost:W('NAKRIZ Cleric LV. 75'),cut:W('AKRIZ Cleric LV. 75'),near:W('TNAKRAZ Cleric LV. 75'),stray:OCR._parseWho(['Cleric LV. 63 Tike','Cleric LV. 63'],K)};});
ok(o.other.name==='THANAKRIZ'&&!o.other.char,'a longer name with the same ending is a different character',o.other);
ok(o.same.char?.id==='a','the exact name is the saved character',o.same.char);
ok(o.lookalike.char?.id==='a','look-alike glyphs (l/I) still match',o.lookalike.char);ok(o.lost.char?.id==='a','first glyph lost at the box edge still matches',o.lost.char);
ok(!o.stray.name,'one stray read is no name (the player picks)',o.stray);ok(!o.cut.char,'only the end of a name is not guessed',o.cut);ok(o.near.char?.id==='a','one misread letter, same length, still matches (job/level checked later)',o.near.char);

// detectWho: a saved name with another job / lower level → filled in as new
const d=await p.evaluate(async()=>{characters=[{id:'a',name:'TNAKRIZ',job:'magician',last:{level:75}}];
  const real=OCR.readWho;OCR.readWho=async()=>({name:'TNAKRIZ',job:'warrior',level:22,char:characters[0],raw:''});stream=stream||{};
  OCR._setRegion('who',{x:0,y:0,w:.1,h:.1});await detectWho();const v=$('s_char').value,n=$('nc_name').value;OCR.readWho=real;return {v,n};});
ok(d.v==='__new'&&d.n==='TNAKRIZ','same name but other job and lower level → new character',d);
// a new share finds the boxes again, hand-drawn ones included
const f=await p.evaluate(async()=>{const im=await loadImg('fixtures/real-full-70.png');const cv=document.createElement('canvas');cv.width=im.width;cv.height=im.height;const g=cv.getContext('2d');
  const dr=()=>{g.drawImage(im,0,0);requestAnimationFrame(dr);};dr();stream=cv.captureStream(5);video.srcObject=stream;video.play();await new Promise(r=>setTimeout(r,500));
  const bad={x:0.5,y:0.5,w:0.05,h:0.02};OCR._setRegion('meso',bad);OCR._setRegion('exp',bad);OCR._auto().src={meso:'manual',exp:'manual'};
  const keep=await OCR.autoFind();const kept=OCR._auto().src.meso;const o=await OCR.autoFind(false,true);const r=await OCR._readNow(70);
  return {keptManual:kept==='manual',found:o,meso:r.meso,exp:r.exp?.exp,src:OCR._auto().src};});
ok(f.keptManual,'normal re-find still respects a hand-drawn box',f);
ok(f.found?.meso&&f.found?.exp&&f.src.meso==='auto','fresh analysis replaces hand-drawn boxes',f);
ok(f.meso!=null&&f.exp!=null,'and reads the screen with them',f);
ok(!errs.length,'no page errors',errs);
console.log(pass===total?`PASS fresh-start ${pass}/${total}`:`FAIL fresh-start ${pass}/${total}`);await b.close();process.exit(pass===total?0:1);})();
