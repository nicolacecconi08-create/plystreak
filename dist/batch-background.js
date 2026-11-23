import {getRecord} from './archive.js';
import {runBatch} from './batch-analysis.js';
import {withBatchLock} from './batch-lock.js';
let running=false;
async function resume(){
 if(running)return;
 try{if(localStorage.getItem('plystreak-batch-paused')==='1')return}catch{return}
 running=true;
 try{await withBatchLock(async()=>{
  const profile=await getRecord('chess-profile','meta');
  if(!profile||profile.disconnected||!profile.username)return;
  const job=await getRecord('batch-'+profile.username,'meta');
  if(job?.ids?.length)await runBatch(profile.username);
 })}catch{/* Saved checkpoints remain available for retry on the next page. */}
 finally{running=false}
}
if(!location.pathname.endsWith('progress.html')&&!/\/progress\/?$/.test(location.pathname)){
 resume();setInterval(resume,15000);
}
