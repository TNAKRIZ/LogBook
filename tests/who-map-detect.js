// Synthetic HUD for the character box (LV + job + name) and the minimap title.
const {chromium}=require('playwright');
const CASES=[
  {name:'known char, 1920x1200 ui1.5',S:1.5,W:1920,H:1200,char:'TNAKRIZ',job:'Cleric',lv:61,map:'Forest Up North VIII',known:['TNAKRIZ','ALTCHAR'],want:{name:'TNAKRIZ',level:61,branch:'Cleric',known:true,map:'Tree Dungeon, Forest Up North VIII'}},
  {name:'new char, 1280x720',S:1,W:1280,H:720,char:'Mapleking7',job:'Fighter',lv:34,map:'Remains <Tomb> III',known:['TNAKRIZ'],want:{name:'Mapleking7',level:34,branch:'Fighter',known:false,map:'Remains <Tomb> III'}},
  {name:'known char, 1366x768',S:1,W:1366,H:768,char:'TNAKRIZ',job:'Cleric',lv:62,map:'Ant Tunnel II',known:['TNAKRIZ'],want:{name:'TNAKRIZ',level:62,branch:'Cleric',known:true,map:'Ant Tunnel II'}},
  {name:'6 vs 8: Lv.68, 1280x720',S:1,W:1280,H:720,char:'TNAKRIZ',job:'Cleric',lv:68,map:'Ant Tunnel II',known:['TNAKRIZ'],want:{name:'TNAKRIZ',level:68,branch:'Cleric',known:true,map:'Ant Tunnel II'}},
  {name:'3 vs 8: Lv.83, 1280x720',S:1,W:1280,H:720,char:'TNAKRIZ',job:'Cleric',lv:83,map:'Ant Tunnel II',known:['TNAKRIZ'],want:{name:'TNAKRIZ',level:83,branch:'Cleric',known:true,map:'Ant Tunnel II'}},
  {name:'Lv.56, 1920x1080',S:1,W:1920,H:1080,char:'TNAKRIZ',job:'Cleric',lv:56,map:'Ant Tunnel II',known:['TNAKRIZ'],want:{name:'TNAKRIZ',level:56,branch:'Cleric',known:true,map:'Ant Tunnel II'}},
];
(async()=>{const b=await chromium.launch();let pass=0,total=0;
for(const C of CASES){
  const ctx=await b.newContext({viewport:{width:1280,height:900}});await ctx.addInitScript(()=>{window.LB_OCR={src:'/node_modules/tesseract.js/dist/tesseract.min.js',workerPath:'/node_modules/tesseract.js/dist/worker.min.js',corePath:'/node_modules/tesseract.js-core',langPath:'/node_modules/@tesseract.js-data/eng/4.0.0_best_int'};});
  const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://localhost:8123/index.html');await p.waitForTimeout(600);
  const reg=await p.evaluate(C=>{const S=C.S,W=C.W/S,H=C.H/S;const cv=document.createElement('canvas');cv.width=C.W;cv.height=C.H;const g=cv.getContext('2d');
    const by=H-40,lv={x:8,y:by+4,w:150,h:34},mm={x:6,y:6,w:190,h:20};
    const draw=()=>{g.setTransform(S,0,0,S,0,0);g.fillStyle='#2d5a33';g.fillRect(0,0,W,H);
      g.fillStyle='#2b2f38';g.fillRect(0,by,W,40);
      // LV box
      g.fillStyle='#3a3f4a';g.fillRect(lv.x,lv.y,46,30);g.font='bold 9px Arial';g.fillStyle='#fff';g.fillText('LV.',lv.x+3,lv.y+20);
      g.font='bold 18px Arial';g.lineWidth=3;g.strokeStyle='#3a1a00';g.strokeText(String(C.lv),lv.x+20,lv.y+23);const gr=g.createLinearGradient(0,lv.y+8,0,lv.y+24);gr.addColorStop(0,'#ffd27a');gr.addColorStop(1,'#f07a12');g.fillStyle=gr;g.fillText(String(C.lv),lv.x+20,lv.y+23);
      g.font='10px Arial';g.fillStyle='#b8c0cc';g.fillText(C.job,lv.x+56,lv.y+12);g.fillStyle='#ffffff';g.fillText(C.char,lv.x+56,lv.y+26);
      // minimap
      g.fillStyle='rgba(20,24,40,.85)';g.fillRect(mm.x,mm.y,190,110);g.font='bold 11px Arial';g.fillStyle='#fff';g.fillText(C.map,mm.x+6,mm.y+14);
      g.fillStyle='#4a6';g.fillRect(mm.x+10,mm.y+30,170,70);
      requestAnimationFrame(draw);};draw();
    const st=cv.captureStream(5);stream=st;video.srcObject=st;video.play();
    const n=r=>({x:r.x/W,y:r.y/H,w:r.w/W,h:r.h/H});return {exp:null,meso:null,who:n(lv),map:n({x:mm.x+2,y:mm.y+1,w:186,h:19})};},C);
  await p.waitForTimeout(500);await p.evaluate(async r=>{await put('kv',r,'ocrRegions');await OCR.init();},reg);
  const r=await p.evaluate(async C=>{const known=C.known.map((n,i)=>({id:'c'+i,name:n,job:'magician'}));const w=await OCR.readWho(known);const m=await OCR.readMap(allMaps());return {w,m:m?.map?.name||null,mraw:m?.raw};},C);
  const W=C.want;const chk={name:r.w?.name===W.name,level:r.w?.level===W.level,branch:r.w?.branch===W.branch,known:!!r.w?.char===W.known,map:r.m===W.map};
  for(const k in chk){total++;pass+=chk[k];}
  console.log(C.name,JSON.stringify(chk),'| who',JSON.stringify({name:r.w?.name,level:r.w?.level,job:r.w?.job,branch:r.w?.branch}),'raw',JSON.stringify(r.w?.raw),'| map',r.m,'raw',JSON.stringify(r.mraw),errs.join(';'));
  if(process.env.SHOT&&C.name.startsWith('new char')){await p.evaluate(()=>SW.goKey('char'));await p.waitForTimeout(4000);await (await p.$('.wstep.on')).screenshot({path:'shot-who.png'});
    await p.fill('#nc_name','Mapleking7');await p.evaluate(()=>SW.goKey('map'));await p.waitForTimeout(4000);await (await p.$('.wstep.on')).screenshot({path:'shot-map.png'});}
  await ctx.close();}
console.log(`WHO/MAP PASS ${pass}/${total}`);await b.close();})();
