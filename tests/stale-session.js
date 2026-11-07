// A session left open for days (startTime 119 h ago, no EXP since): a banner asks to finish, drop or keep it.
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8123/index.html');await p.waitForTimeout(800);
await p.evaluate(async()=>{await put('kv',{id:'old1',charId:'c1',charName:'TNAKRIZ',mapId:'x',mapName:"Wild Kargo's Area",startTime:Date.now()-119*3.6e6,endTime:null,start:{level:64,exp:null,pct:50,mesos:42248},items:[],checks:[]},'active');});
await p.reload();await p.waitForTimeout(1200);
const shown=await p.evaluate(()=>!$('staleNote').hidden&&/ค้างมาตั้งแต่/.test($('staleNote').textContent));
await p.click('#staleKeep');const hidden=await p.evaluate(()=>$('staleNote').hidden);
await p.evaluate(async()=>{active.startTime=Date.now()-3600e3;active.lastT=null;await put('kv',active,'active');});await p.reload();await p.waitForTimeout(1200);
const fresh=await p.evaluate(()=>$('staleNote').hidden);
console.log('banner on a 119 h old session',shown,'| keep hides it',hidden,'| 1 h session: no banner',fresh,'| ERR',errs);
await b.close();process.exit(shown&&hidden&&fresh&&!errs.length?0:1);})();
