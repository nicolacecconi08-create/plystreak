import assert from 'node:assert/strict';
import {saveGame,getRecord} from './dist/archive.js';

const games=new Map();
globalThis.indexedDB={open(){
 const open={result:{transaction(){const tx={objectStore(){return {
  get(id){const request={result:structuredClone(games.get(id))};queueMicrotask(()=>request.onsuccess());return request},
  put(record){games.set(record.id,structuredClone(record));queueMicrotask(()=>tx.oncomplete())}
 }}};return tx}}};
 queueMicrotask(()=>open.onsuccess());return open;
}};

const id='coach-example',pgn='1. e4 e5 *';
const review={version:2,complete:true,checkpoint:{grades:[]},performanceBasis:{w:[],b:[]}};
const coach={version:2,complete:false,coverage:'player'};
await saveGame({id,pgn,analysis:review});
await saveGame({id,pgn,source:'coach',analysis:coach});
assert.deepEqual((await getRecord(id)).analysis,review);
await saveGame({id,pgn:'1. d4 d5 *',source:'coach',analysis:coach});
assert.deepEqual((await getRecord(id)).analysis,coach);
console.log('PASS Coach preserves full review for identical moves, invalidates it for changed moves');
