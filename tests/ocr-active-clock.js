// Harry's case: the EXP box is hard to read, so most reads are rejected. The farming clock must still
// count that time (EXP/hr was 4–6× too high), and only a CLEAR read showing the same EXP proves a pause.
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8123/index.html');await p.waitForTimeout(800);
const r=await p.evaluate(()=>{const st=OCR._st;OCR.reset();st.level=61;OCR.restart();
 const R=1346242;let t=1e12,exp=593087;const pct=e=>Math.round(e/R*10000)/100;
 const read=v=>OCR._accExp(v,t),junk=()=>OCR._accExp(null,t);                 // an unreadable frame
 for(let i=0;i<3;i++)read({exp,pct:pct(exp)});   // confirmed start (3 matching reads)
 // 30 min farming, +1,500 per 15 s (360K/hr); only 1 read in 4 is readable
 for(let i=1;i<=120;i++){t+=15000;exp+=1500;if(i%4===0)read({exp,pct:pct(exp)});else junk();}
 const farm={gained:st.expGained,active:st.activeMs,rate:st.expGained/(st.activeMs/3.6e6)};
 // 10 min AFK: mostly unreadable, a few clear reads show the same EXP
 for(let i=1;i<=40;i++){t+=15000;if(i%5===0)read({exp,pct:pct(exp)});else junk();}
 const afk={active:st.activeMs,idle:st.stillT!=null};
 // back to farming 10 min
 for(let i=1;i<=40;i++){t+=15000;exp+=1500;if(i%4===0)read({exp,pct:pct(exp)});else junk();}
 return {farm,afk,end:{gained:st.expGained,activeMin:st.activeMs/60000,rate:st.expGained/(st.activeMs/3.6e6)}};});
const ok1=Math.abs(r.farm.rate-360000)/360000<0.1, ok2=r.afk.active-r.farm.active<=120000 /* only the last farming EXP the 3-read median was still catching up on; 10 min AFK not counted */, ok3=Math.abs(r.end.rate-360000)/360000<0.15;
console.log(JSON.stringify(r));console.log('rate right with bad reads',ok1,'| AFK not counted',ok2,'| rate right after AFK',ok3,'| ERR',errs);
await b.close();process.exit(ok1&&ok2&&ok3&&!errs.length?0:1);})();
