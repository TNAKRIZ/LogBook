// Potions when none were ticked at the start (Harry, Nov 14): the end step asks how many bottles were USED (and bought while
// playing); the cost comes off the profit; the summary always has a potion row; profit without any potion data says so.
const {chromium}=require('playwright');
const BASE=process.env.LB_BASE||'http://localhost:8123';
(async()=>{const b=await chromium.launch();const p=await (await b.newContext()).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(BASE+'/index.html');await p.waitForTimeout(600);
const o=await p.evaluate(async()=>{const t0=Date.now()-3600e3;
  active={id:'t1',charId:'x',charName:'T',job:'magician',mapId:allMaps()[0].id,mapName:'M',party:1,startTime:t0,endTime:null,start:{level:74,exp:100000,pct:3.92,mesos:10000},items:{},checks:[]};
  renderEndForm();const out={};out.table=!!document.querySelector('#e_items table.used');
  // nothing entered yet: summary row present, profit flagged
  $('e_level').value=74;$('e_exp').value=300000;$('e_pct').value='';$('e_mesos').value=100000;
  renderEndReview();out.rowBefore=$('e_review').innerText.includes('ยา');out.tagBefore=!!$('e_review').querySelector('.nocost');
  const tr=id=>document.querySelector(`#e_items tr[data-id="${id}"]`);
  tr('2000000').querySelector('.iu').value=100;tr('2000000').querySelector('.ib').value=20;   // Red Potion 50 — used 100, bought 20 while playing
  tr('2000003').querySelector('.iu').value=50;                                               // Blue Potion 220 — used 50
  const r=buildEnd();out.items=r.items;const c=calc(r.s);out.cost=c.potionCost;out.farm=c.farmMesos;out.profit=c.profit;
  renderEndReview();out.tagAfter=!!$('e_review').querySelector('.nocost');out.rowAfter=$('e_review').innerText;
  // the classic way (ticked at the start, remaining at the end) is unchanged
  active.items={'2000000':{start:200,bought:0,end:null}};renderEndForm();out.classic=!!document.querySelector('#e_items .ie');
  document.querySelector('#e_items .ie').value=150;const r2=buildEnd();out.classicCost=calc(r2.s).potionCost;
  return out;});
let pass=0,total=0;const ok=(c,l,g)=>{total++;if(c)pass++;else console.log('  ✗',l,JSON.stringify(g));};
ok(o.table,'used-bottles table shown when nothing was ticked',o.table);
ok(o.rowBefore&&o.tagBefore,'summary has a potion row and flags profit without potion cost',o);
ok(JSON.stringify(o.items['2000000'])===JSON.stringify({start:null,end:null,used:100,bought:20})&&o.items['2000003']?.used===50&&Object.keys(o.items).length===2,'only entered potions kept',o.items);
ok(o.cost===100*50+50*220,'cost = used × shop price',o.cost);
ok(o.farm===90000+20*50&&o.profit===o.farm-o.cost,'bought while playing added back, cost taken off',{farm:o.farm,profit:o.profit});
ok(!o.tagAfter&&/ค่ายา 16,000/.test(o.rowAfter),'summary shows the cost, flag gone',o.rowAfter.slice(0,400));
ok(o.classic&&o.classicCost===50*50,'ticked-at-start way unchanged',o);
ok(!errs.length,'no page errors',errs);
console.log(pass===total?`PASS potions-used ${pass}/${total}`:`FAIL potions-used ${pass}/${total}`);await b.close();process.exit(pass===total?0:1);})();
