import {getRecord,putRecord,saveGame} from './archive.js';
import {fetchLatestGames} from './chess-api.js';
import {Chess} from './vendor/chess.js';

// Call under the batch lock so the queue and its cursor advance together.
export async function importLatest(username,{signal,onProgress}={}){
 const id='batch-'+username,previous=await getRecord(id,'meta');
 const since=previous?.lastSeen??null;
 const records=await fetchLatestGames(username,since===null?3:Infinity,{signal,since,onProgress});
 const ids=new Set(previous?.ids||[]);
 let newest=since,imported=0;
 for(const record of records){
  if(signal?.aborted)throw Error('Importazione interrotta.');
  const chess=new Chess();
  try{chess.loadPgn(record.pgn)}catch{continue}
  if(!chess.history().length)continue;
  const saved=await saveGame(record);
  if(!ids.has(saved.id))imported++;
  ids.add(saved.id);
  newest=Math.max(newest||0,saved.playedAt);
 }
 const job={...previous,id,ids:[...ids],lastSeen:newest,initialThree:true,lastChecked:Date.now()};
 await putRecord(job,'meta');
 return {job,imported};
}
