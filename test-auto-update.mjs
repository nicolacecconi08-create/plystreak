import assert from 'node:assert/strict';
import {startupUpdateGuard} from './dist/auto-update.js';
let time=100;const data=new Map();const storage={getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)};
const first=startupUpdateGuard({storage,now:()=>time,origin:'https://test'});assert(first.canApply());first.interact();assert(!first.canApply());
assert(!startupUpdateGuard({storage,now:()=>time,origin:'https://test'}).canApply());data.clear();
const late=startupUpdateGuard({storage,now:()=>time,origin:'https://test'});time+=30001;assert(!late.canApply());data.clear();
assert(!startupUpdateGuard({storage,referrer:'https://test/coach',origin:'https://test'}).canApply());
console.log('PASS automatic update guard: first entry, interaction, timeout and internal navigation');

assert.equal(startupUpdateGuard({storage:undefined,origin:'https://test'}).canApply(),false);
const blocked={getItem(){throw Error('blocked')},setItem(){throw Error('blocked')}};assert.equal(startupUpdateGuard({storage:blocked,origin:'https://test'}).canApply(),false);
