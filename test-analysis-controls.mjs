import assert from 'node:assert/strict';
import fs from 'node:fs';
const html=fs.readFileSync('dist/index.html','utf8');
const layout=fs.readFileSync('dist/atelier-layout.js','utf8');
for(const id of ['first','prev','next','last','flip','export'])assert.match(html,new RegExp(`<button id="${id}"[^>]*><svg`),id);
assert.doesNotMatch(layout,/button\.textContent\s*=\s*icon/);
assert.doesNotMatch(layout,/[⏮⏭]/u);
console.log('PASS analysis controls retain their vector icons');
