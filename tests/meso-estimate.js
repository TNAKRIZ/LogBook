// Inventory closed for 5 minutes: Meso is estimated from EXP (Meso per EXP learned while it was open), shown as ≈,
// the real value replaces it when the inventory opens again, and the estimate's error is kept in the read-quality log.
// Also checks the shadow analysis (Kalman EXP/hr ≈ the tracker's EXP/hr).
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8123/index.html');await p.waitForTimeout(800);
const r=await p.evaluate(()=>{const st=OCR._st;OCR.reset();st.level=63;OCR.restart();OCR._setRegion('meso',{x:0,y:0,w:0.1,h:0.1});OCR._setRegion('exp',{x:0,y:0,w:0.1,h:0.1});
  let t=Date.now()-12*60000,e=500000,m=1000000;const out={};
  const step=(meso=true,sure=false)=>{t+=15000;e+=1000;m+=100;OCR._accExp({exp:e,pct:+(e/EXP_REQ[63]*100).toFixed(2)},t);if(meso)OCR._accMeso(m,t,sure);};
  for(let i=0;i<24;i++)step();                                   // 6 min open: 100 Meso per 1,000 EXP
  OCR._setMesoOff(true);for(let i=0;i<20;i++)step(false);       // 5 min closed
  out.extra=Math.round(OCR._mesoExtra());out.live=OCR._live();
  OCR._setMesoOff(false);step(true,true);                        // opened again for a moment: one sure read
  out.after=Math.round(OCR._mesoExtra());out.collected=st.mesoCollected;out.q=OCR.snapshot().quality;
  return out;});
const ok1=Math.abs(r.extra-2000)<=300,ok2=r.live.mesoEst===true,ok3=r.after===0&&r.collected===4300,ok4=r.q.mesoEst.length===1&&Math.abs(r.q.mesoEst[0].est-r.q.mesoEst[0].actual)<=400;
const ok5=r.q.kalmanHr!=null&&Math.abs(r.q.kalmanHr-r.q.rateHr)/r.q.rateHr<0.1;
console.log(JSON.stringify({extra:r.extra,mesoHr:Math.round(r.live.mesoHr),after:r.after,collected:r.collected,mesoEst:r.q.mesoEst,kalmanHr:r.q.kalmanHr,rateHr:r.q.rateHr,hampel:r.q.hampelFlags,steps:r.q.expSteps}));
console.log('estimate ≈2000',ok1,'| shown as ≈',ok2,'| real value replaces',ok3,'| error logged',ok4,'| Kalman ≈ tracker',ok5,'| ERR',errs);
await b.close();process.exit(ok1&&ok2&&ok3&&ok4&&ok5&&!errs.length?0:1);})();
