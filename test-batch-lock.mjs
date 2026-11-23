import assert from 'node:assert/strict';
import {withBatchLock} from './dist/batch-lock.js';
let called=0;
Object.defineProperty(globalThis,'navigator',{configurable:true,value:{locks:{request:async(name,options,callback)=>{assert.equal(name,'plystreak-batch');assert.equal(options.ifAvailable,true);return callback(null)}}}});
assert.equal(await withBatchLock(()=>called++),null);assert.equal(called,0);
navigator.locks.request=async(_name,_options,callback)=>callback({name:'plystreak-batch'});
assert.equal(await withBatchLock(()=>++called),1);assert.equal(called,1);
console.log('PASS batch lock prevents duplicate work and allows the owner');
