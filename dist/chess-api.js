const BASE='https://api.chess.com/pub/player/';
export function validUsername(name){return /^[a-z0-9_-]{1,50}$/i.test(name)}
export async function fetchPublic(path,{signal}={}){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),20000);const abort=()=>controller.abort();signal?.addEventListener('abort',abort,{once:true});if(signal?.aborted)controller.abort();try{const r=await fetch(BASE+path,{signal:controller.signal,credentials:'omit'});if(!r.ok)throw Error(r.status===404?'Utente o archivio non trovato.':r.status===429?'Chess.com richiede una pausa. Riprova più tardi.':'Chess.com non è raggiungibile da questa connessione (HTTP '+r.status+'). Puoi importare il PGN manualmente.');return await r.json()}catch(e){if(e.name==='AbortError')throw Error(signal?.aborted?'Importazione interrotta.':'Chess.com non risponde. Riprova più tardi o importa un PGN.');if(e instanceof TypeError)throw Error('Collegamento bloccato dalla rete o dal browser. Riprova dal tuo dispositivo oppure importa un PGN.');throw e}finally{clearTimeout(timer);signal?.removeEventListener('abort',abort)}}
export async function fetchProfile(username,signal){if(!validUsername(username))throw Error('Usa solo lettere, numeri, trattini e underscore.');const name=username.toLowerCase(),profile=await fetchPublic(name,{signal}),stats=await fetchPublic(name+'/stats',{signal});return {id:'chess-profile',username:name,profile:{username:profile.username,player_id:profile.player_id},stats,fetchedAt:Date.now()}}
export async function syncArchive(username,range,onMonth,signal,onProgress){const name=username.toLowerCase();if(!validUsername(name))throw Error('Nome utente non valido.');const data=await fetchPublic(name+'/games/archives',{signal});const months=(data.archives||[]).filter(x=>new RegExp('^https://api\\.chess\\.com/pub/player/'+name+'/games/\\d{4}/\\d{2}$','i').test(x));const selected=range==='all'?months:months.slice(-Number(range));let count=0,skipped=0;for(let i=0;i<selected.length;i++){if(signal?.aborted)throw Error('Importazione interrotta.');const suffix=selected[i].split('/').slice(-2).join('/');onProgress?.(i,selected.length,suffix);const month=await fetchPublic(name+'/games/'+suffix,{signal});const games=[];for(const g of month.games||[]){if(g.rules!=='chess'||!g.pgn){skipped++;continue}const side=g.white?.username?.toLowerCase()===name?'w':g.black?.username?.toLowerCase()===name?'b':null;if(!side){skipped++;continue}games.push({pgn:g.pgn,source:'chess.com',side,playedAt:g.end_time*1000,extra:{timeClass:g.time_class,rating:side==='w'?g.white.rating:g.black.rating,chessUrl:g.url}})}count+=await onMonth(games)}return {count,skipped,months:selected.length}}

export async function fetchLatestGames(username,limit=30,{signal,onProgress,since=null}={}){
 const name=username.toLowerCase();if(!validUsername(name))throw Error('Nome utente non valido.');
 const data=await fetchPublic(name+'/games/archives',{signal}),prefix=BASE+name+'/games/';
 const months=[...new Set((data.archives||[]).filter(u=>typeof u==='string'&&u.toLowerCase().startsWith(prefix)&&/^\d{4}\/\d{2}$/.test(u.slice(prefix.length))))].sort().reverse();
 const records=[],seen=new Set();
 for(const [i,url] of months.entries()){
  if(signal?.aborted)throw Error('Importazione interrotta.');onProgress?.(i,months.length);
  const data=await fetchPublic(name+'/games/'+url.slice(prefix.length),{signal});
  for(const g of (data.games||[]).sort((a,b)=>b.end_time-a.end_time)){
   if(g.rules!=='chess'||!g.pgn||!Number.isFinite(g.end_time)||g.end_time*1000>Date.now())continue;
   const side=g.white?.username?.toLowerCase()===name?'w':g.black?.username?.toLowerCase()===name?'b':null,key=g.url||g.pgn;
   if(!side||seen.has(key)||(since!==null&&g.end_time*1000<since))continue;seen.add(key);records.push({pgn:g.pgn,side,source:'chess.com',playedAt:g.end_time*1000,extra:{chessUsername:name,timeClass:g.time_class,rating:g[side==='w'?'white':'black'].rating,chessUrl:g.url}});
  }
  if(records.length>=limit)break;
  if(since!==null){const suffix=url.slice(prefix.length),[year,month]=suffix.split('/').map(Number);if(Date.UTC(year,month,1)<=since)break;}
 }
 return records.sort((a,b)=>b.playedAt-a.playedAt).slice(0,limit);
}
