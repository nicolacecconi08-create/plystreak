import {getRecord} from './archive.js';
import {runBatch} from './batch-analysis.js';
import {importLatest} from './batch-import.js';
import {withBatchLock} from './batch-lock.js';
let controller,lastAttempt=0;
window.addEventListener('storage',event=>{
 if((event.key==='plystreak-batch-paused'&&event.newValue==='1')||event.key==='plystreak-chess-user')controller?.abort();
});
async function resume(){
 if(controller||document.visibilityState!=='visible')return;
 try{if(localStorage.getItem('plystreak-batch-paused')==='1')return}catch{return}
 controller=new AbortController();
 const {signal}=controller;
 try{await withBatchLock(async()=>{
  const profile=await getRecord('chess-profile','meta');
  if(!profile||profile.disconnected||!profile.username)return;
  const job=await getRecord('batch-'+profile.username,'meta');
  if(navigator.onLine&&Date.now()-Math.max(lastAttempt,job?.lastChecked||0)>=300000){
   lastAttempt=Date.now();
   try{await importLatest(profile.username,{signal})}catch{/* A network failure should not stop saved work. */}
  }
  if(!signal.aborted)await runBatch(profile.username,{signal});
 })}catch{/* Saved checkpoints remain available for retry on the next page. */}
 finally{controller=null}
}
if(!/(?:^|\/)progress(?:\.html)?\/?$/.test(location.pathname)){
 resume();setInterval(resume,15000);
 document.addEventListener('visibilitychange',resume);
 window.addEventListener('online',resume);
}
