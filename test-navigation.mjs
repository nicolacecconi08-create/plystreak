import assert from 'node:assert/strict';
import {navigationPage} from './dist/navigation.js';
for(const page of ['index','coach','progress','practice','openings'])for(const prefix of ['/','/app/'])for(const suffix of ['', '/', '.html'])assert.equal(navigationPage(prefix+page+suffix),page+'.html');
assert.equal(navigationPage('/'),'index.html');
assert.equal(navigationPage(''),'index.html');
console.log('PASS navigation: public clean URLs, HTML files, trailing slashes and nested paths.');
