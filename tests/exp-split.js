// Number and % read as one run of digits, sometimes with the bracket read as a digit and a digit lost: split + repair by the table.
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8123/index.html');await p.waitForTimeout(600);
const r=await p.evaluate(()=>{OCR._setHint(63);return [OCR._fromPct({exp:40652286,pct:null}),OCR._fromPct({exp:31101374,pct:null}),OCR._fromPct({exp:40652,pct:2.86})];});
const ok=r[0].exp===40652&&r[0].pct===2.86&&r[1].exp===53110&&r[1].pct===3.74&&r[2].exp===40652;
console.log(JSON.stringify(r),'SPLIT',ok,'ERR',errs);await b.close();process.exit(ok&&!errs.length?0:1);})();
