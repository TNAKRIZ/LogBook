// Farming ~0.16%/min, then 10 min with no readable EXP, then a misread +27% ("60.85%" → "88.54%"): too fast for this player → not counted.
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8123/index.html');await p.waitForTimeout(800);
const r=await p.evaluate(()=>{const st=OCR._st,R=EXP_REQ[69];OCR.reset();st.level=69;OCR.restart();let t=Date.now()-3600e3,pc=58.0;
  const E=x=>{t+=15000;return OCR._accExp({exp:Math.round(R*x/100),pct:x,est:true},t);};
  for(let i=0;i<30;i++){pc=+(pc+0.04).toFixed(2);E(pc);}const g0=st.expGained;
  t+=600000;pc=+(pc+0.3).toFixed(2);const bad=[E(88.54),E(88.54)];const g1=st.expGained;
  for(let i=0;i<4;i++){pc=+(pc+0.04).toFixed(2);E(pc);}
  return {g0,g1,g2:st.expGained,bad,pct:st.pct};});
const ok=r.g1-r.g0<R_OK(r)&&r.g2-r.g0<60000;function R_OK(){return 60000;}
console.log(JSON.stringify(r));console.log('misread +27% after a gap not counted',ok,'| ERR',errs);await b.close();process.exit(ok&&!errs.length?0:1);})();
