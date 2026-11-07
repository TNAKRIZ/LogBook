// The session started with the LV box misread (64 for 68) while EXP was past 1M (only % on screen), so every estimate used the
// wrong table row. After the level-up the game shows exact EXP again; it fits the table only at Lv.69 → the level is corrected
// and the EXP gained is redone with the right rows (Lv.68 bar finished + what is on the Lv.69 bar).
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8123/index.html');await p.waitForTimeout(800);
const r=await p.evaluate(()=>{const st=OCR._st,R=EXP_REQ;OCR.reset();OCR.restart();
  let t=Date.now()-3*3600e3,pct=58.03;const out={};
  OCR.seed({level:64,exp:Math.round(R[64]*pct/100),pct,est:true},t);                    // misread start level, % only
  const est=(L,pc)=>({exp:Math.round(R[L]*pc/100),pct:pc,est:true});
  while(pct<99.9){t+=15000;pct=+(pct+0.12).toFixed(2);OCR._accExp(est(st.level,Math.min(pct,99.98)),t);}
  out.levelAfterWrap=null;let e=0;
  for(let i=0;i<40;i++){t+=15000;e+=2500;const pc=+(e/R[69]*100).toFixed(2);
    const v=e<1e6?{exp:e,pct:pc}:est(st.level,pc);const ok=OCR._accExp(v,t);if(i<8)(out.tr=out.tr||[]).push([e,ok,st.level,st.exp,st.expGained]);}
  out.before={level:st.level,gained:st.expGained,bars:JSON.parse(JSON.stringify(st.bars)),carry:st.expCarry,base:st.expBase,exp:st.exp,relevel:st.q.relevel,src:st.levelSrc};
  out.after={level:st.level,gained:st.expGained};
  out.truth=Math.round(R[68]*(1-0.5803))+e;return out;});
const ok1=r.after.level===69,ok2=Math.abs(r.after.gained-r.truth)/r.truth<0.02;
console.log(JSON.stringify(r));console.log('level corrected to 69',ok1,'| EXP gained redone ≈ truth',ok2,'(before',Math.round((r.before.gained/r.truth-1)*100)+'%)','| ERR',errs);
await b.close();process.exit(ok1&&ok2&&!errs.length?0:1);})();
