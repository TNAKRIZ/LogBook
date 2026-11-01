// MapleStory Classic hides the EXP number above 1,000,000 (only "[82.30%]"). The reader then gives EXP = table × %.
// Farm from 985,000 at Lv.61 across the 1M line and through a level-up (the bar wraps) — totals and level must stay right.
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const WHO=process.argv[2]==='who';await p.addInitScript(w=>{window.WHO_FIRST=w;},WHO);await p.goto('http://localhost:8123/index.html');await p.waitForTimeout(800);
const r=await p.evaluate(()=>{const st=OCR._st;OCR.reset();st.level=62;OCR.restart();
 let t=1e12,L=62,x=985000,truth=0;
 const shown=()=>{const R=EXP_REQ[L],pct=Math.floor(x/R*10000)/100;          // what the screen shows
   if(x<1e6)return {exp:x,pct};
   return {exp:Math.round(EXP_REQ[st.level]*pct/100),pct,est:true};};         // reader: table × % at the level it believes
 const read=()=>OCR._accExp(shown(),t);
 for(let i=0;i<3;i++){read();}
 const steps=[];let crossed=null;
 for(let i=0;i<2400;i++){t+=15000;const g=1500;x+=g;truth+=g;if(x>=EXP_REQ[L]){x-=EXP_REQ[L];L++;}
   if(window.WHO_FIRST&&L>st.level)st.level=L;                                // the LV box shows the new level before the bar is re-read
   read();if(L===62&&crossed==null)crossed=i;}
 return {L,level:st.level,src:st.levelSrc,gained:st.expGained,truth,exp:st.exp,x,est:st.expEst,pct:st.pct,
   rate:st.expGained/(st.activeMs/3.6e6)};});
const lagOK=Math.abs(r.gained-r.truth)<=2*1500+300;                           // 3-read median lags ~1 read; % steps ~135
const ok1=r.level===r.L&&r.L===65, ok2=lagOK, ok3=Math.abs(r.exp-r.x)<=3500, ok4=Math.abs(r.rate-360000)/360000<0.03;
console.log(JSON.stringify(r));console.log('level right after 3 wraps',ok1,'| gained ≈ truth',ok2,'| EXP now ≈ truth',ok3,'| rate ≈360K/hr',ok4,'| ERR',errs);
await b.close();process.exit(ok1&&ok2&&ok3&&ok4&&!errs.length?0:1);})();
