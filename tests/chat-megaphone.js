// Megaphone chat from Harry's screens (Nov 15): "[00:57] Name [CH36 pill] : [Item] S> …" on yellow / pink / cyan bands.
// Local-only screenshots (other players' chat — never committed): fixtures/local/c1..c3.png in the test server folder;
// skipped when absent. Checks: every line found with its name, the channel never wrong (empty is allowed), the item name in
// brackets kept, no stray Hangul in English lines, wrapped second lines joined, no invented time stamps.
const {chromium}=require('playwright');
const BASE=process.env.LB_BASE||'http://localhost:8123';
const WANT={c1:[['us10y',20,'[Work Gloves] S>ATTK 10'],['kimkardashi',1,'Selling gfa 1.8 mill'],['hondoo',36,'[Work Gloves] T> me'],['Huskies',23,'[Dark Cleave] S> this brick']],
  c2:[['HeavyTank',17,'Blue Icarus Cape] T> for dex icarus cape'],['BeebFP',40,'meet up Jazz Bar Kerning City'],['kimkardashi',1,'Selling gfa 1.8 mill'],['Gallui',35,'offers are welco me'],['ugly',38,'[Dark Guise] S> this cheap pmo'],['Trust',16,'[Black Napoleon] S> 12 Luk cape'],['Fokss',21,'WHERE IS MANO']],
  c3:[['Dassassin',27,'Thief Glove'],['Dassassin',27,'[Tobi Throwing Stars] S>Black stinger 2.85M each'],['DuongChoDien',19,'Bottomwear Def 60%'],['Patchouli',4,'[Steel Slain] S>18M'],['DaForce',6,'[Mystery Fashion Crate] S> 60K'],['Goku',36,'[Aluminum Baseball Bat] S>+17 bat 750k']]};
const TIMES={c1:['00:56','00:57'],c2:['01:00'],c3:['01:01']};
(async()=>{const b=await chromium.launch();let pass=0,total=0,ran=0;const ok=(c,l,g)=>{total++;if(c)pass++;else console.log('  ✗',l,JSON.stringify(g));};
for(const f of Object.keys(WANT)){
  const ctx=await b.newContext();await ctx.addInitScript(()=>{window.LB_OCR={src:'/node_modules/tesseract.js/dist/tesseract.min.js',workerPath:'/node_modules/tesseract.js/dist/worker.min.js',corePath:'/node_modules/tesseract.js-core',langPath:'/node_modules/@tesseract.js-data/eng/4.0.0_best_int',chatLangPath:'/lang'};});
  const p=await ctx.newPage();p.on('pageerror',e=>console.log('ERR',e.message));await p.goto(BASE+'/index.html');await p.waitForTimeout(500);
  const has=await p.evaluate(async f=>(await fetch('fixtures/local/'+f+'.png',{method:'HEAD'})).ok,f);if(!has){await ctx.close();continue;}ran++;
  const r=await p.evaluate(async f=>{const im=await loadImg('fixtures/local/'+f+'.png');const cv=document.createElement('canvas');cv.width=im.width;cv.height=im.height;const g=cv.getContext('2d');const d=()=>{g.drawImage(im,0,0);requestAnimationFrame(d);};d();
    stream=cv.captureStream(5);video.srcObject=stream;video.play();await new Promise(r=>setTimeout(r,600));await OCR.init();await OCR.autoFind(true);return await OCR.readChat();},f);
  const L=r.lines||[];const used=new Set();
  for(const [name,ch,frag] of WANT[f]){const i=L.findIndex((l,k)=>!used.has(k)&&l.name.toLowerCase()===name.toLowerCase());if(i>=0)used.add(i);const l=L[i];
    ok(!!l,`${f} ${name} found`,L.map(x=>x.name));if(!l)continue;
    ok(l.ch==null||l.ch===ch,`${f} ${name} channel never wrong`,l.ch);
    const norm=t=>t.toLowerCase().replace(/[^a-z0-9]/g,'');ok(norm(l.msg).includes(norm(frag))||norm(l.msg).replace(/0/g,'o').includes(norm(frag).replace(/0/g,'o')),`${f} ${name} message`,l.msg);
    ok(!/[가-힣]/.test(l.msg),`${f} ${name} no stray Hangul`,l.msg);}
  ok(L.every(l=>TIMES[f].includes(l.time)),`${f} no invented times`,L.map(l=>l.time));
  ok(L.filter(l=>l.ch!=null).length>=WANT[f].length-2,`${f} channels found for most lines`,L.map(l=>l.ch));
  await ctx.close();}
if(!ran){console.log('SKIP chat-megaphone (no local screenshots)');await b.close();return;}
console.log(pass===total?`PASS chat-megaphone ${pass}/${total}`:`FAIL chat-megaphone ${pass}/${total}`);await b.close();process.exit(pass===total?0:1);})();
