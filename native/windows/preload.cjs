const {contextBridge,ipcRenderer}=require('electron');
const invoke=action=>()=>ipcRenderer.invoke('plystreak:update',action);
// Keep a failed first launch eligible for rollback. This is a startup check,
// not a guarantee that all application features work.
const failed=()=>ipcRenderer.invoke('plystreak:update','unhealthy').catch(()=>{});
window.addEventListener('error',failed,true);
window.addEventListener('unhandledrejection',failed);
contextBridge.exposeInMainWorld('plystreakDesktop',Object.freeze({
  check:invoke('check'),install:invoke('install'),restart:invoke('restart'),
  healthy:invoke('healthy'),login:invoke('login')
}));
