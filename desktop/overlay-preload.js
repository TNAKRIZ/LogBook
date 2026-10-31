const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('ov',{
  onInit:cb=>ipcRenderer.on('ov:init',(e,d)=>cb(d)),
  onStats:cb=>ipcRenderer.on('ov:stats',(e,d)=>cb(d)),
  onClick:cb=>ipcRenderer.on('ov:click',(e,d)=>cb(d)),
  setMode:m=>ipcRenderer.send('ov:mode',m),setBg:v=>ipcRenderer.send('ov:bg',v),
  toggleClick:()=>ipcRenderer.send('ov:click'),close:()=>ipcRenderer.send('ov:close')
});
