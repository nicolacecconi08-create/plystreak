import fs from 'node:fs';
import {TYPES} from './dist/analysis.js';
// All symbols use explicit vector paths: no emoji or platform-dependent fonts.
const ex=(x)=>`<path d="M${x} 10v9"/><circle cx="${x}" cy="24" r="1.6" fill="white" stroke="none"/>`;
const question=x=>`<path d="M${x-3} 12c0-4 7-4 7 0 0 3-4 3-4 6"/><circle cx="${x}" cy="24" r="1.6" fill="white" stroke="none"/>`;
const shape={book:'<path d="M16 12c-3-3-7-3-10-2v14c3-1 7-1 10 2 3-3 7-3 10-2V10c-3-1-7-1-10 2Zm0 0v14"/>',brilliant:ex(12)+ex(21),great:ex(16),best:'<path d="m16 6 3.1 6.3 7 .9-5 4.9 1.2 6.9-6.3-3.3L9.7 25l1.2-6.9-5-4.9 7-.9Z" fill="white" stroke="none"/>',excellent:'<path d="m8 17 5 5 12-12"/>',good:'<path d="m7 17 4 4 6-7m-1 5 3 3 7-10"/>',inaccuracy:question(12)+ex(23),mistake:question(16),blunder:question(10)+question(23),miss:'<circle cx="16" cy="16" r="9"/><path d="m9 23 14-14M20 8h5v5"/>'};
for(const [key,t] of Object.entries(TYPES))fs.writeFileSync(`dist/icons/${key}.svg`,`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="${t.color}"/><g fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${shape[key]}</g></svg>`);
