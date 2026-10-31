// LogBook Desktop — wraps the LogBook page and adds a transparent, always-on-top overlay window.
// The overlay never touches the game: it only shows numbers that the LogBook page already reads from the shared screen.
const {app,BrowserWindow,ipcMain,globalShortcut,session,desktopCapturer,Menu,shell,screen}=require('electron');
const path=require('path'),fs=require('fs');

const SIZE={full:[320,270],compact:[680,52]};
const prefsFile=()=>path.join(app.getPath('userData'),'overlay.json');
let prefs={mode:'full',bg:0.55,bounds:{}};
try{prefs=Object.assign(prefs,JSON.parse(fs.readFileSync(prefsFile(),'utf8')));}catch(e){}
const savePrefs=()=>{try{fs.writeFileSync(prefsFile(),JSON.stringify(prefs));}catch(e){}};

let win=null,overlay=null,picker=null,clickThrough=false,logos=null;

function createMain(){
  win=new BrowserWindow({width:1280,height:900,minWidth:420,minHeight:500,title:'บันทึกนักผจญภัย LogBook',icon:path.join(__dirname,'icon.png'),backgroundColor:'#fbf3e4',
    webPreferences:{preload:path.join(__dirname,'preload.js'),contextIsolation:true,nodeIntegration:false,backgroundThrottling:false}});
  win.loadFile(path.join(__dirname,'app','index.html'));
  win.webContents.setWindowOpenHandler(({url})=>{if(/^https?:/.test(url))shell.openExternal(url);return {action:'deny'};});
  win.on('closed',()=>{win=null;if(overlay)overlay.close();});
}

/* ---------- screen picker for getDisplayMedia ---------- */
function pickSource(){
  return new Promise(async resolve=>{
    let sources=[];
    try{sources=await desktopCapturer.getSources({types:['window','screen'],thumbnailSize:{width:320,height:180},fetchWindowIcons:false});}
    catch(e){return resolve(null);}
    const list=sources.filter(s=>s.name&&!/LogBook/i.test(s.name)).map(s=>({id:s.id,name:s.name,thumb:s.thumbnail.toDataURL()}));
    picker=new BrowserWindow({width:760,height:560,parent:win,modal:true,title:'เลือกหน้าจอเกม',backgroundColor:'#fbf3e4',
      webPreferences:{preload:path.join(__dirname,'picker-preload.js'),contextIsolation:true}});
    picker.setMenuBarVisibility(false);
    let done=false;
    const finish=id=>{if(done)return;done=true;const src=sources.find(s=>s.id===id)||null;if(picker&&!picker.isDestroyed())picker.close();picker=null;resolve(src);};
    ipcMain.once('picker:choose',(e,id)=>finish(id));
    picker.on('closed',()=>finish(null));
    picker.loadFile(path.join(__dirname,'picker.html'));
    picker.webContents.once('did-finish-load',()=>picker.webContents.send('picker:list',list));
  });
}

/* ---------- overlay ---------- */
function openOverlay(o){
  if(o?.logos)logos=o.logos;if(o?.mode)prefs.mode=o.mode;
  if(overlay){overlay.show();return;}
  const [w,h]=SIZE[prefs.mode]||SIZE.full;const b=prefs.bounds[prefs.mode]||{};
  const wa=screen.getPrimaryDisplay().workArea;
  overlay=new BrowserWindow({width:b.width||w,height:b.height||h,x:b.x??(wa.x+wa.width-w-24),y:b.y??(wa.y+24),
    frame:false,transparent:true,hasShadow:false,alwaysOnTop:true,skipTaskbar:true,resizable:true,minimizable:false,maximizable:false,fullscreenable:false,
    backgroundColor:'#00000000',title:'LogBook · สด',webPreferences:{preload:path.join(__dirname,'overlay-preload.js'),contextIsolation:true,backgroundThrottling:false}});
  overlay.setAlwaysOnTop(true,'screen-saver');
  try{overlay.setVisibleOnAllWorkspaces(true,{visibleOnFullScreen:true});}catch(e){}
  overlay.loadFile(path.join(__dirname,'overlay.html'));
  overlay.webContents.once('did-finish-load',()=>sendInit());
  const remember=()=>{if(overlay&&!overlay.isDestroyed()){prefs.bounds[prefs.mode]=overlay.getBounds();savePrefs();}};
  overlay.on('moved',remember);overlay.on('resized',remember);
  overlay.on('closed',()=>{overlay=null;clickThrough=false;win?.webContents.send('ov:closed');});
}
function sendInit(){overlay?.webContents.send('ov:init',{mode:prefs.mode,bg:prefs.bg,logos,clickThrough});}
function setMode(m){
  prefs.mode=m==='compact'?'compact':'full';savePrefs();
  if(overlay){const [w,h]=SIZE[prefs.mode];const b=prefs.bounds[prefs.mode];const cur=overlay.getBounds();
    overlay.setBounds({x:b?.x??cur.x,y:b?.y??cur.y,width:b?.width||w,height:b?.height||h});sendInit();}
  win?.webContents.send('ov:mode',prefs.mode);
}
function toggleClickThrough(force){
  if(!overlay)return;clickThrough=typeof force==='boolean'?force:!clickThrough;
  overlay.setIgnoreMouseEvents(clickThrough,{forward:true});overlay.webContents.send('ov:click',clickThrough);
}

ipcMain.on('ov:open',(e,o)=>openOverlay(o));
ipcMain.on('ov:close',()=>overlay?.close());
ipcMain.on('ov:mode',(e,m)=>setMode(m));
ipcMain.on('ov:stats',(e,s)=>{if(overlay&&!overlay.isDestroyed())overlay.webContents.send('ov:stats',s);});
ipcMain.on('ov:bg',(e,v)=>{prefs.bg=Math.max(0,Math.min(1,+v||0));savePrefs();});
ipcMain.on('ov:click',()=>toggleClickThrough());

app.whenReady().then(()=>{
  // the LogBook page asks for the game screen with getDisplayMedia — answer it with our own picker
  session.defaultSession.setDisplayMediaRequestHandler(async(request,callback)=>{
    const src=await pickSource();
    if(src)callback({video:src});else callback({});
  });
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    ...(process.platform==='darwin'?[{role:'appMenu'}]:[]),
    {label:'หน้าต่างลอย',submenu:[
      {label:'เปิด / ปิด',click:()=>overlay?overlay.close():win?.webContents.executeJavaScript("PIP.open()",true)},
      {label:'แบบเต็ม',click:()=>setMode('full')},{label:'แถบเล็ก',click:()=>setMode('compact')},
      {label:'คลิกทะลุ เปิด/ปิด',accelerator:'CommandOrControl+Shift+L',click:()=>toggleClickThrough()}]},
    {role:'editMenu'},{role:'viewMenu'}]));
  globalShortcut.register('CommandOrControl+Shift+L',()=>toggleClickThrough());
  createMain();
  app.on('activate',()=>{if(!win)createMain();});
});
app.on('will-quit',()=>globalShortcut.unregisterAll());
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit();});
