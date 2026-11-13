// Version chip on the header: "✓ ล่าสุด" only after a real check, a newer live page offers a reload,
// never a reload while a round is being counted, and a failed check claims nothing.
const {chromium}=require('playwright');
const BASE=process.env.LB_BASE||'http://localhost:8123';
(async()=>{const b=await chromium.launch();let pass=0,total=0;
const ok=(c,l,g)=>{total++;if(c)pass++;else console.log('  ✗',l,JSON.stringify(g));};
async function page(live){   // live: version the "server" now has, or null = the check fails
  const ctx=await b.newContext();const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/index.html',async r=>{if(r.request().resourceType()!=='fetch')return r.continue();
    if(live===null)return r.abort();const res=await r.fetch();const t=(await res.text()).replace(/const APP_VERSION='[^']+'/,`const APP_VERSION='${live}'`);
    r.fulfill({response:res,body:t});});
  await p.goto(BASE+'/index.html');await p.waitForTimeout(900);return {p,ctx,errs};}
const cur=await (async()=>{const {p,ctx}=await page(null);const v=await p.evaluate(()=>APP_VERSION);await ctx.close();return v;})();
const chip=p=>p.$eval('#vChip',e=>({t:e.textContent,nw:e.classList.contains('new')}));

{const {p,ctx,errs}=await page(cur);const c=await chip(p);ok(c.t===`v${cur} ✓ ล่าสุด`&&!c.nw,'same version → latest',c);
  await p.click('#vChip');const d=await p.evaluate(()=>({open:$('vDlg').open,txt:$('vDlgBody').textContent,reload:!$('vReload').hidden}));
  ok(d.open&&d.txt.includes('ที่เปิดอยู่')&&!d.reload,'click opens what\'s new, no reload button',d);ok(!errs.length,'no page errors',errs);await ctx.close();}

{const {p,ctx}=await page('2999.01.01');const c=await chip(p);ok(c.t==='มีเวอร์ชันใหม่ · กดเพื่อโหลด'&&c.nw,'newer live → offer reload',c);
  await p.evaluate(()=>{window.__mark=1;});await Promise.all([p.waitForNavigation(),p.click('#vChip')]);
  ok(await p.evaluate(()=>window.__mark===undefined),'click reloads when no round is running','');await ctx.close();}

{const {p,ctx}=await page('2999.01.01');await p.evaluate(()=>{active={start:Date.now()};renderVer();window.__mark=1;});
  const c=await chip(p);ok(c.t.includes('จบรอบก่อน'),'round running → asks to finish first',c);await p.click('#vChip');await p.waitForTimeout(400);
  const d=await p.evaluate(()=>({mark:window.__mark,open:$('vDlg').open,dis:$('vReload').disabled,txt:$('vDlgBody').textContent}));
  ok(d.mark===1&&d.open&&d.dis&&d.txt.includes('จบรอบ'),'round running → no reload, dialog explains',d);await ctx.close();}

{const {p,ctx}=await page('2000.01.01');const c=await chip(p);ok(c.t===`v${cur} ✓ ล่าสุด`,'older live (preview ahead) → not "new"',c);await ctx.close();}

{const {p,ctx}=await page(null);const c=await chip(p);ok(c.t===`v${cur}`,'check failed → version only, no "latest" claim',c);await ctx.close();}

console.log(pass===total?`PASS version-chip ${pass}/${total}`:`FAIL version-chip ${pass}/${total}`);await b.close();process.exit(pass===total?0:1);})();
