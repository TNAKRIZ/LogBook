// Item notices read off a bright map (garbled "x1" / tab), names the game cuts ("Pet Equip Jump..."),
// finishing a cut name from the map's monster drops, and which pickups raise the good-drop alert.
const {chromium}=require('playwright');
const BASE=process.env.LB_BASE||'http://localhost:8123';
(async()=>{const b=await chromium.launch();const p=await (await b.newContext()).newPage();p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto(BASE+'/index.html');await p.waitForTimeout(600);
const o=await p.evaluate(()=>{const P=t=>OCR._msgParse(t,false,null);
  const tomb=allMaps().find(m=>(m.mobs||[]).some(id=>MOBS[id]?.name==='Skeledog'))?.id;
  return {
    bandana1:P('Black Bandaha xi earned. (Equip)'),bandana2:P(', - Black Bandana earned, (Eguip)'),bandana3:P('© Black Bandana xi earned. (Eup)'),
    rib:P('Rib ¥1 earned. (Etc'),elixir:P('Mana Elixir x12 earned. (Use)'),pet:P('Pet Equip Jump... x1 earned. (Use)'),
    meso:P('You have gained mesos (+22)'),junk:P('PebEquip Jumpin, &f earmad. {Lzg)'),
    shoes:itemFromNotice('Shoes Jump…',tomb)?.name,spear:itemFromNotice('Spear Attack…',tomb)?.name,petFull:itemFromNotice('Pet Equip Jump…',tomb)?.name??null,
    rare:{pet:isRare({name:'Pet Equip Jump…',cat:'use',cut:true}),bandana:isRare({name:'Black Bandaha',cat:'equip'}),
      elixir:isRare({name:'Mana Elixir',cat:'use'}),rib:isRare({name:'Rib',cat:'etc'}),shoes:isRare({name:'Shoes Jump…',cat:'use',cut:true})}};});
let pass=0,total=0;const ok=(c,l,g)=>{total++;if(c)pass++;else console.log('  ✗',l,JSON.stringify(g));};
const it=(x,name,n,cat,cut=false)=>x&&x.kind==='item'&&x.name===name&&x.n===n&&x.cat===cat&&!!x.cut===cut;
ok(it(o.bandana1,'Black Bandaha',1,'equip'),'x1 read as xi',o.bandana1);
ok(it(o.bandana2,'Black Bandana',1,'equip'),'count missing, (Eguip)',o.bandana2);
ok(it(o.bandana3,'Black Bandana',1,'equip'),'(Eup)',o.bandana3);
ok(it(o.rib,'Rib',1,'etc'),'x read as ¥',o.rib);
ok(it(o.elixir,'Mana Elixir',12,'use'),'x12',o.elixir);
ok(it(o.pet,'Pet Equip Jump…',1,'use',true),'cut name',o.pet);
ok(o.meso?.kind==='meso'&&o.meso.n===22,'meso line',o.meso);
ok(o.junk===null,'garbled tab is not an item',o.junk);
ok(o.shoes==='Shoes Jump Scroll: Greater','cut name finished from map drops',o.shoes);
ok(o.spear==='Spear Attack Scroll: Intermediate','cut name finished from map drops (2)',o.spear);
ok(o.petFull===null,'unknown cut name stays cut',o.petFull);
for(const [k,want] of Object.entries({pet:true,bandana:true,elixir:false,rib:false,shoes:true}))ok(o.rare[k]===want,'alert '+k,o.rare[k]);
console.log(pass===total?`PASS notice-items ${pass}/${total}`:`FAIL notice-items ${pass}/${total}`);await b.close();process.exit(pass===total?0:1);})();
