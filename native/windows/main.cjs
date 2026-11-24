const {app,BrowserWindow,protocol,session,shell,ipcMain}=require('electron');
const fs=require('node:fs/promises');
const path=require('node:path');
const {resolveAsset,mime}=require('./local-files.cjs');
const {Updater}=require('./updater.cjs');
protocol.registerSchemesAsPrivileged([{scheme:'plystreak',privileges:{standard:true,secure:true,supportFetchAPI:true,corsEnabled:true}}]);
app.setName('Plystreak');
let window;
if(!app.requestSingleInstanceLock())app.quit();
else {
  app.on('second-instance',()=>{if(window){if(window.isMinimized())window.restore();window.focus();}});
  app.whenReady().then(async()=>{
    const bundledVersion=require('./core-version.json').version;
    const updater=new Updater({directory:path.join(app.getPath('userData'),'core-updates'),bundledRoot:path.join(__dirname,'dist'),bundledVersion,shellVersion:app.getVersion()});
    const root=await updater.start();
    protocol.handle('plystreak',async request=>{
      const file=resolveAsset(root,request.url);if(!file||request.method!=='GET')return new Response('Forbidden',{status:403});
      try{return new Response(await fs.readFile(file),{headers:{'Content-Type':mime[path.extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff'}})}catch{return new Response('Not found',{status:404})}
    });
    session.defaultSession.setPermissionRequestHandler((_contents,_permission,callback)=>callback(false));
    session.defaultSession.setPermissionCheckHandler(()=>false);
    window=new BrowserWindow({width:1280,height:900,minWidth:700,minHeight:550,title:'Plystreak',autoHideMenuBar:true,backgroundColor:'#100d16',webPreferences:{preload:path.join(__dirname,'preload.cjs'),nodeIntegration:false,contextIsolation:true,sandbox:true,webSecurity:true}});
    if(process.platform==='win32')window.setAccentColor('#e9a173');
    let loaded=false,healthRequested=false,startupFailed=false,healthTimer;
    const markHealthy=()=>{if(loaded&&healthRequested&&!startupFailed&&!healthTimer)healthTimer=setTimeout(()=>{healthTimer=null;if(loaded&&healthRequested&&!startupFailed)updater.healthy().catch(()=>{});},5000);};
    window.webContents.on('did-finish-load',()=>{loaded=true;markHealthy();});
    window.webContents.on('did-start-loading',()=>{loaded=false;healthRequested=false;startupFailed=false;clearTimeout(healthTimer);healthTimer=null;});
    window.webContents.on('render-process-gone',()=>{startupFailed=true;clearTimeout(healthTimer);healthTimer=null;});
    ipcMain.handle('plystreak:update',async(event,action)=>{
      if(event.sender!==window.webContents||event.senderFrame!==window.webContents.mainFrame||!event.senderFrame.url.startsWith('plystreak://app/'))throw Error('Richiesta non consentita.');
      if(action==='healthy'){healthRequested=true;markHealthy();return {status:'ok'};}
      if(action==='unhealthy'){startupFailed=true;clearTimeout(healthTimer);healthTimer=null;return {status:'ok'};}
      if(action==='check')return updater.check();
      if(action==='install')return updater.install();
      if(action==='login')return {status:'error',message:'Gli aggiornamenti di questa app richiedono il canale pubblico ufficiale.'};
      if(action==='restart'){if(!updater.state.pending)return {status:'error',message:'Nessun aggiornamento pronto.'};app.relaunch();app.exit(0);return {status:'restarting'};}
      throw Error('Operazione non consentita.');
    });
    window.webContents.setWindowOpenHandler(({url})=>{if(/^https:\/\//.test(url))shell.openExternal(url);return {action:'deny'}});
    window.webContents.on('will-navigate',(event,url)=>{if(!url.startsWith('plystreak://app/')){event.preventDefault();if(/^https:\/\//.test(url))shell.openExternal(url);}});
    window.webContents.on('will-attach-webview',event=>event.preventDefault());
    window.loadURL('plystreak://app/index.html');
  });
  app.on('window-all-closed',()=>app.quit());
}
