// The HUD level must fit the character's last saved level; mixed-up digits are corrected, impossible ones are not used.
const fs=require('fs');const s=fs.readFileSync(__dirname+'/../index.html','utf8');
eval(s.match(/const LV_CONFUSE[\s\S]*?\n}\n/)[0].replace(/^const /gm,'var '));
const C=[[82,61,62],[81,61,61],[62,61,62],[61,61,61],[66,68,68],[36,61,null],[8,6,8],[86,61,66],[34,null,34],[60,61,61]];
let ok=0;for(const [read,ref,want] of C){const r=checkLevel(read,ref);const p=r.level===want;ok+=p;console.log(p?'✓':'✗','read',read,'last',ref,'→',r.level,r.fixed!=null?'(fixed)':'');}
console.log(`LEVEL CHECK ${ok}/${C.length}`);process.exit(ok===C.length?0:1);
