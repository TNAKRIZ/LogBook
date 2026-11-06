// A level-up is booked only when it is possible: 64.34% misread twice as 4.33% must NOT become a level-up,
// a real wrap (99.9% → 0.1%) still is, and after a long unreadable gap the LV box showing the next level confirms it.
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8123/index.html');await p.waitForTimeout(800);
const r=await p.evaluate(()=>{const st=OCR._st,R=EXP_REQ[63],at=(x,L=63)=>({exp:Math.round(EXP_REQ[L]*x/100),pct:x,est:true});
 const run=(seq,lvAt)=>{OCR.reset();st.level=63;OCR.restart();let t=1e12;
   seq.forEach((v,i)=>{t+=v.dt||15000;if(lvAt!=null&&i===lvAt){st.level=64;st.levelSrc='who';}OCR._accExp(v.r,t);});
   return {level:st.level,gained:st.expGained};};
 // farming at 64.34% (+~1000/read), two misreads 4.33%, then good reads again
 const mis=[];let x=64.34;for(let i=0;i<4;i++){mis.push({r:at(x)});x=+(x+0.07).toFixed(2);}
 mis.push({r:at(4.33)},{r:at(4.33)});for(let i=0;i<4;i++){mis.push({r:at(x)});x=+(x+0.07).toFixed(2);}
 const a=run(mis);
 // a real level-up: 99.80 → 99.87 → 99.94 → 0.01 → 0.08 …
 const real=[];x=99.80;for(let i=0;i<4;i++){real.push({r:at(x)});x=+(x+0.07).toFixed(2);}
 for(let y=0.03;y<0.4;y+=0.07)real.push({r:at(+y.toFixed(2),64)});
 const c=run(real);
 // unreadable 2 h gap at 70% → 5% on the next level; the LV box already reads 64
 const gap=[{r:at(70)},{r:at(70.07)},{r:at(70.14)},{r:at(5,64),dt:7.2e6},{r:at(5.07,64)},{r:at(5.14,64)}];
 const g=run(gap,3);
 return {mis:a,real:c,gap:g,R};});
const ok1=r.mis.level===63&&r.mis.gained<20000, ok2=r.real.level===64&&r.real.gained>0&&r.real.gained<20000, ok3=r.gap.level===64&&r.gap.gained>400000;
console.log(JSON.stringify(r));console.log('misread not a level-up',ok1,'| real wrap booked',ok2,'| long gap + LV box booked',ok3,'| ERR',errs);
await b.close();process.exit(ok1&&ok2&&ok3&&!errs.length?0:1);})();
