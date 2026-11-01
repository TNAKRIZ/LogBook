// Harry's case: after ↺ the first reads dropped a digit (593,087 → 53,087); later reads were right.
// Expect: no fake jump counted, and EXP/hr counts only intervals in which EXP came in.
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8123/index.html');await p.waitForTimeout(800);
const r=await p.evaluate(()=>{const st=OCR._st;OCR.reset();st.level=62;OCR.restart();   // level known before ↺, must survive it
 const R=1346242,T0=1e12;let t=T0,exp=593087;const pct=e=>Math.round(e/R*10000)/100;
 const feed=v=>{t+=15000;OCR._accExp(v,t);};
 feed({exp:53087,pct:44.06});feed({exp:53087,pct:44.06});            // misread (digit dropped) right after reset
 for(let i=0;i<8;i++){exp+=1500;feed({exp,pct:pct(exp)});}            // farming: +1,500 per 15 s = 360K/hr
 const farmed={gained:st.expGained,active:st.activeMs,level:st.level};
 for(let i=0;i<2;i++)feed({exp,pct:pct(exp)});                        // the 3-read median catches up
 const settled={gained:st.expGained,active:st.activeMs};
 for(let i=0;i<8;i++)feed({exp,pct:pct(exp)});                        // 2 minutes AFK: no EXP
 const afterIdle={gained:st.expGained,active:st.activeMs};farmed.settled=settled;
 return {farmed,afterIdle,rate:st.expGained/(st.activeMs/3.6e6)};});
const ok1=r.farmed.level===62, ok2=r.farmed.gained<=8*1500+1, ok3=r.afterIdle.active===r.farmed.settled.active, ok4=Math.abs(r.rate-360000)/360000<0.2;
console.log(JSON.stringify(r));console.log('level kept',ok1,'| no fake jump',ok2,'| idle not counted',ok3,'| rate ≈360K/hr',ok4,'| ERR',errs);
await b.close();process.exit(ok1&&ok2&&ok3&&ok4&&!errs.length?0:1);})();
