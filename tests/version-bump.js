// Release guard: if index.html differs from the live branch (origin/main), APP_VERSION must be newer than the live one
// and WHATS_NEW must start with an entry for it — otherwise the header chip can't tell players a new build is out.
const {execSync}=require('child_process');const fs=require('fs');const path=require('path');
const root=path.join(__dirname,'..');const here=fs.readFileSync(path.join(root,'index.html'),'utf8');
let live='';try{live=execSync('git show origin/main:index.html',{cwd:root,encoding:'utf8',maxBuffer:64<<20});}catch{console.log('SKIP version-bump: no origin/main');process.exit(0);}
const ver=t=>(t.match(/const APP_VERSION='([^']+)'/)||[])[1]||'';
const v=ver(here),lv=ver(live),first=(here.match(/const WHATS_NEW=\[\s*\{v:'([^']+)'/)||[])[1];
const problems=[];
if(!v)problems.push('APP_VERSION missing');
if(first!==v)problems.push(`WHATS_NEW starts with ${first}, not ${v}`);
if(here!==live&&lv&&!(v>lv))problems.push(`index.html changed but APP_VERSION ${v} is not newer than live ${lv}`);
console.log(problems.length?'FAIL version-bump: '+problems.join('; '):`PASS version-bump (v${v}, live ${lv||'none'})`);process.exit(problems.length?1:0);
