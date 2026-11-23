import {db} from './archive.js';
const owner=globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random()}`;
const key='batch-active-lease',duration=20000;
async function lease(action){
 const database=await db();return new Promise((resolve,reject)=>{
  const tx=database.transaction('meta','readwrite'),store=tx.objectStore('meta'),request=store.get(key);let ok=false;
  request.onsuccess=()=>{const current=request.result,now=Date.now();
   if(action==='acquire'&&(!current||current.until<now||current.owner===owner)){store.put({id:key,owner,until:now+duration});ok=true}
   if(action==='renew'&&current?.owner===owner){store.put({id:key,owner,until:now+duration});ok=true}
   if(action==='release'&&current?.owner===owner){store.delete(key);ok=true}
  };tx.oncomplete=()=>resolve(ok);tx.onerror=tx.onabort=()=>reject(tx.error||Error('Archivio non disponibile'));
 });
}
export async function withBatchLock(work){
 if(navigator.locks)return navigator.locks.request('plystreak-batch',{ifAvailable:true},lock=>lock?work():null);
 if(!await lease('acquire'))return null;
 const heartbeat=setInterval(()=>lease('renew').catch(()=>{}),5000);
 try{return await work()}finally{clearInterval(heartbeat);await lease('release').catch(()=>{})}
}
