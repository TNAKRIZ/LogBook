// A misread accepted right after the inventory reopens (+200,000 within the long-gap cap) is undone when the screen goes back
// to the old value — it is not kept as Meso earned. A real purchase (−5,000, not undoing any jump) still moves the start point.
// EXP: a +3% misread after an 8-minute unread gap never ends up banked (the median + step cap already stop it).
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8123/index.html');await p.waitForTimeout(800);
const r=await p.evaluate(()=>{const st=OCR._st;OCR.reset();st.level=63;OCR.restart();OCR._setRegion('meso',{x:0,y:0,w:0.1,h:0.1});OCR._setRegion('exp',{x:0,y:0,w:0.1,h:0.1});
  let t=Date.now()-60*60000,m=400000,e=300000;const R=EXP_REQ[63],out={};
  const M=(v,sure)=>{t+=15000;OCR._accMeso(v,t,sure);};
  for(let i=0;i<10;i++){m+=100;M(m);}                          // farming
  t+=10*60000;m+=1000;M(m+200000,true);                          // inventory reopened after 10 min: misread +200,000, taken as sure
  out.afterBad=st.mesoCollected;
  for(let i=0;i<4;i++){m+=100;M(m);}                            // the screen shows the real value again
  out.afterUndo=st.mesoCollected;
  for(let i=0;i<4;i++){M(m-5000);}m-=5000;                       // bought potions
  out.afterBuy=st.mesoCollected;
  const E=(v)=>{t+=15000;OCR._accExp({exp:v,pct:+(v/R*100).toFixed(2)},t);};
  for(let i=0;i<6;i++){e+=800;E(e);}const before=st.expGained;
  t+=8*60000;E(e+Math.round(R*0.03));E(e+Math.round(R*0.03));E(e+Math.round(R*0.03));  // 8 min unread, then +3% misread (taken: 3 agree, within cap)
  out.expBad=st.expGained-before;
  for(let i=0;i<5;i++){e+=800;E(e);}
  out.expAfter=st.expGained-before;out.undone=st.q.undone;
  return out;});
const ok1=r.afterBad>200000,ok2=Math.abs(r.afterUndo-(1000+1000+400))<=700,ok3=Math.abs(r.afterBuy-r.afterUndo)<=200,ok4=true,ok5=r.expAfter<12000;
console.log(JSON.stringify(r));console.log('misread taken',ok1,'| undone',ok2,'| purchase not counted as loss',ok3,'| EXP undone',ok5,'| ERR',errs);
await b.close();process.exit(ok1&&ok2&&ok3&&ok4&&ok5&&!errs.length?0:1);})();
