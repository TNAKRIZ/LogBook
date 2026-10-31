// Replays the reads from Harry's real session (misreads included) and checks the totals stay sane.
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8123/index.html');await p.waitForTimeout(600);
const out=await p.evaluate(()=>{OCR.reset();const st=OCR._st;let t=Date.now()-10*60000;const log=[];
  const E=[[2563866,13.08],[2563866,13.08],[257068,19.1],[257253,19.11],[257404,18.12],[257512,18.13],[257548,18.13],[257744,19.18]];
  let x=257744;for(let i=0;i<40;i++){x+=150+Math.round(Math.random()*60);const pct=+(x/1346242*100).toFixed(2);
    const r=Math.random();E.push(r<0.15?[x,+(pct-1).toFixed(2)]:r<0.2?[x*10+6,pct]:r<0.25?[Math.floor(x/10),pct]:[x,pct]);}
  const M=[41,0,1173339,1173321,1,17];let m=1173339;for(let i=0;i<42;i++){if(i%5===0)m+=Math.round(Math.random()*800);const r=Math.random();M.push(r<0.15?Math.round(Math.random()*90):r<0.22?m+18-Math.round(Math.random()*36):m);}
  for(let i=0;i<E.length;i++){t+=5000;OCR._accExp({exp:E[i][0],pct:E[i][1]},t);OCR._accMeso(M[i],t);}
  return {exp:st.exp,pct:st.pct,gained:st.expGained,req:OCR._reqNow(),meso:st.meso,collected:st.mesoCollected,trueX:x,trueM:m};});
console.log(JSON.stringify(out));
const okExp=Math.abs(out.exp-out.trueX)<2000,okGain=out.gained<20000,okMeso=Math.abs(out.meso-out.trueM)<100,okCol=out.collected<10000;
console.log('exp near truth',okExp,'| gained sane',okGain,'| meso near truth',okMeso,'| collected sane',okCol,'| req',Math.round(out.req));
console.log('ERR',errs);await b.close();})();
