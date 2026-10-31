const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('pk',{onList:cb=>ipcRenderer.on('picker:list',(e,l)=>cb(l)),choose:id=>ipcRenderer.send('picker:choose',id)});
