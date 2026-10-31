// Copies the LogBook page into the app, then packages it for one platform.
//   node build.js --prepare            → only copy ../index.html into app/
//   node build.js <platform> <arch>    → package (win32 x64 | darwin arm64 | darwin x64)
const fs=require('fs'),path=require('path');
const here=__dirname;
fs.mkdirSync(path.join(here,'app'),{recursive:true});
fs.copyFileSync(path.join(here,'..','index.html'),path.join(here,'app','index.html'));
if(process.argv[2]==='--prepare')process.exit(0);
const [platform=process.platform,arch=process.arch]=process.argv.slice(2);
const {packager}=require('@electron/packager');
packager({dir:here,out:path.join(here,'dist'),platform,arch,overwrite:true,asar:true,prune:true,quiet:true,
  name:'LogBook Desktop',executableName:'LogBook Desktop',appBundleId:'th.logbook.desktop',appCategoryType:'public.app-category.games',
  icon:path.join(here,platform==='darwin'?'icon.icns':'icon.ico'),
  ignore:[/^\/dist($|\/)/,/^\/build\.js$/,/^\/icon\.(icns|ico)$/],
  extendInfo:platform==='darwin'?{NSScreenCaptureUsageDescription:'LogBook อ่านตัวเลข EXP / Meso จากภาพหน้าจอเกมที่คุณเลือกแชร์'}:undefined,
  win32metadata:{ProductName:'LogBook Desktop',FileDescription:'บันทึกนักผจญภัย LogBook'}
}).then(o=>console.log('built',o)).catch(e=>{console.error(e);process.exit(1);});
