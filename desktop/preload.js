const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('lbDesktop',{
  version:'1.0.0',platform:process.platform,
  openOverlay:o=>ipcRenderer.send('ov:open',o),
  closeOverlay:()=>ipcRenderer.send('ov:close'),
  setMode:m=>ipcRenderer.send('ov:mode',m),
  pushStats:s=>ipcRenderer.send('ov:stats',s),
  onOverlayClosed:cb=>ipcRenderer.on('ov:closed',()=>cb()),
  onModeChanged:cb=>ipcRenderer.on('ov:mode',(e,m)=>cb(m))
});
