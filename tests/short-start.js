// A returning player (character + map already known): start = screen → start values → review (3 steps);
// no potions taken → the end skips the potions step.
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8123/index.html');await p.waitForTimeout(900);
const r=await p.evaluate(async()=>{
  const c={id:'c1',name:'TNAKRIZ',job:'magician',branch:'cleric'};characters.push(c);await put('kv',characters,'characters');renderCharCards?.();
  const sel=$('s_char');if(![...sel.options].some(o=>o.value==='c1')){const o=document.createElement('option');o.value='c1';o.textContent='TNAKRIZ';sel.appendChild(o);}sel.value='c1';
  $('s_map').value=allMaps()[0].id;
  SW.reset();const seen=[];const cur=()=>document.querySelector('#sw_steps li.on')?.textContent;seen.push(cur());
  $('sw_next').click();seen.push(cur());$('s_level').value=69;$('s_pct').value=56.1;$('s_mesos').value=130000;$('sw_next').click();seen.push(cur());
  const bar=[...document.querySelectorAll('#sw_steps li')].map(li=>li.textContent);
  return {seen,bar};});
const ok1=JSON.stringify(r.seen)===JSON.stringify(['1จอเกม','2ค่าตอนเริ่ม','3ตรวจทาน']),ok2=r.bar.length===3;
await p.click('#btnStart');await p.waitForTimeout(400);await p.click('#btnQuit');
const end=await p.evaluate(()=>{const cur=()=>document.querySelector('#ew_steps li.on')?.textContent;$('e_level').value=69;$('e_pct').value=57;$('e_mesos').value=140000;$('ew_next').click();return {now:cur(),bar:[...document.querySelectorAll('#ew_steps li')].map(li=>li.textContent)};});
const ok3=end.now==='2ของดรอป'&&!end.bar.some(t=>t.includes('ยา'));
console.log(JSON.stringify(r),JSON.stringify(end));console.log('start in 3 steps',ok1&&ok2,'| end skips potions',ok3,'| ERR',errs);
await b.close();process.exit(ok1&&ok2&&ok3&&!errs.length?0:1);})();
