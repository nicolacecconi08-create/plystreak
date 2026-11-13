const {app,BrowserWindow,protocol,session,shell}=require('electron');
const fs=require('node:fs/promises');
const path=require('node:path');
const {resolveAsset,mime}=require('./local-files.cjs');
protocol.registerSchemesAsPrivileged([{scheme:'plystreak',privileges:{standard:true,secure:true,supportFetchAPI:true,corsEnabled:true}}]);
app.setName('Plystreak');
let window;
if(!app.requestSingleInstanceLock())app.quit();
else {
  app.on('second-instance',()=>{if(window){if(window.isMinimized())window.restore();window.focus();}});
  app.whenReady().then(()=>{
    const root=path.join(__dirname,'dist');
    protocol.handle('plystreak',async request=>{
      const file=resolveAsset(root,request.url);if(!file||request.method!=='GET')return new Response('Forbidden',{status:403});
      try{return new Response(await fs.readFile(file),{headers:{'Content-Type':mime[path.extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff'}})}catch{return new Response('Not found',{status:404})}
    });
    session.defaultSession.setPermissionRequestHandler((_contents,_permission,callback)=>callback(false));
    session.defaultSession.setPermissionCheckHandler(()=>false);
    window=new BrowserWindow({width:1280,height:900,minWidth:700,minHeight:550,title:'Plystreak',autoHideMenuBar:true,backgroundColor:'#100d16',webPreferences:{nodeIntegration:false,contextIsolation:true,sandbox:true,webSecurity:true}});
    window.webContents.setWindowOpenHandler(({url})=>{if(/^https:\/\//.test(url))shell.openExternal(url);return {action:'deny'}});
    window.webContents.on('will-navigate',(event,url)=>{if(!url.startsWith('plystreak://app/')){event.preventDefault();if(/^https:\/\//.test(url))shell.openExternal(url);}});
    window.webContents.on('will-attach-webview',event=>event.preventDefault());
    window.loadURL('plystreak://app/index.html');
  });
  app.on('window-all-closed',()=>app.quit());
}
