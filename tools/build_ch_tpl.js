// Builds the built-in channel-pill digit shapes ("CH20" next to a name in chat) from Harry's real screens with known channels.
// The screens hold other players' chat, so they stay local (fixtures/local/ in the test server folder, never committed);
// only the digit shapes (8×12 bit grids) go into index.html as BUILTIN_TPL.ch. Run with the test server on :8123.
const {chromium}=require('playwright');const fs=require('fs');
const BASE=process.env.LB_BASE||'http://localhost:8123';
// name → channel, read off the screenshots by eye
const SRC={c1:{us10y:20,kimkardashi:1,hondoo:36,Huskies:23},
  c2:{HeavyTank:17,BeebFP:40,kimkardashi:1,Gallui:35,ugly:38,Trust:16,Fokss:21},
  c3:{Dassassin:27,DuongChoDien:19,Patchouli:4,DaForce:6,Goku:36}};
(async()=>{const b=await chromium.launch();const acc={};let used=0,skipped=[];
for(const [f,want] of Object.entries(SRC)){
  const ctx=await b.newContext();await ctx.addInitScript(()=>{window.LB_OCR={src:'/node_modules/tesseract.js/dist/tesseract.min.js',workerPath:'/node_modules/tesseract.js/dist/worker.min.js',corePath:'/node_modules/tesseract.js-core',langPath:'/node_modules/@tesseract.js-data/eng/4.0.0_best_int',chatLangPath:'/lang',chatGlyphs:true};});
  const p=await ctx.newPage();await p.goto(BASE+'/index.html');await p.waitForTimeout(500);
  const r=await p.evaluate(async f=>{const im=await loadImg('fixtures/local/'+f+'.png');const cv=document.createElement('canvas');cv.width=im.width;cv.height=im.height;const g=cv.getContext('2d');const d=()=>{g.drawImage(im,0,0);requestAnimationFrame(d);};d();
    stream=cv.captureStream(5);video.srcObject=stream;video.play();await new Promise(r=>setTimeout(r,600));await OCR.init();await OCR.autoFind(true);return await OCR.readChat();},f);
  for(const l of r.lines||[]){const ch=Object.entries(want).find(([n])=>n.toLowerCase()===String(l.name).toLowerCase())?.[1];
    if(ch==null||!l.chG){continue;}if(l.chG.length!==4){skipped.push(`${f}:${l.name}(${l.chG.length} glyphs)`);continue;}
    const ds=String(ch).padStart(2,'0');l.chG.slice(2).forEach((sh,i)=>{(acc[ds[i]]=acc[ds[i]]||[]).push(sh);});used++;}
  await ctx.close();}
// keep distinct shapes only
const sim=(g,t)=>{let both=0,any=0;for(let i=0;i<g.b.length;i++){const p=g.b[i]==='1',q=t.b[i]==='1';if(p&&q)both++;if(p||q)any++;}return any?both/any:0;};
for(const d in acc){const u=[];for(const s of acc[d])if(!u.some(t=>sim(s,t)>0.97))u.push(s);acc[d]=u.slice(0,6);}
fs.writeFileSync(__dirname+'/ch_tpl.json',JSON.stringify(acc));console.log('pills used',used,'skipped',skipped,Object.fromEntries(Object.entries(acc).map(([k,v])=>[k,v.length])));await b.close();})();
