import assert from 'node:assert/strict';
import {languages,setLanguage,t,getLanguage} from './dist/i18n.js';
import {catalog} from './dist/locales/catalog.js';
import {sanitizeSettings} from './dist/settings.js';
import {Chess} from './dist/vendor/chess.js';
import {briefComment,coachAnswer} from './dist/brief-coach.js';
import {hintFor} from './dist/mentor.js';
import {explainMove} from './dist/explanations.js';
for(const row of catalog){assert.equal(row.length,5);for(const v of row)assert(v.trim());const placeholders=s=>[...s.matchAll(/\{\d+\}/g)].map(x=>x[0]).sort();for(const v of row.slice(1))assert.deepEqual(placeholders(v),placeholders(row[0].startsWith('c.')?row[1]:row[0]),row[0])}
assert.equal(sanitizeSettings({language:'en'}).language,'en');assert.equal(sanitizeSettings({language:'xx'}).language,'it');assert.equal(sanitizeSettings({}).language,'it');
const c=new Chess(),move=c.move('e4');const before={cp:22,lines:[{pv:['e2e4']}]},after={cp:21,lines:[{pv:['e7e5']}]},grade={loss:.001,accuracy:99,type:'best'};const fen=c.fen();
for(const lang of languages){setLanguage(lang);assert.equal(getLanguage(),lang);assert.equal(t('e4 Nf3 1-0'),'e4 Nf3 1-0');const text=briefComment(move,before,after,grade);assert(!text.includes('c.'));if(lang==='it')assert(!/\b[a-h][1-8]\b/.test(text));else assert(text.includes('e4'));if(lang!=='it'){assert.notEqual(t('Gioca'),'Gioca');assert(!text.includes('il pedone'));assert(!coachAnswer(c,'king').includes('Il re'));assert(!hintFor(c,1).text.includes('Osserva questo pezzo'));assert(!explainMove({move,before,after,grade}).reason.includes('c.reason'))}assert.equal(c.fen(),fen)}
setLanguage('de');assert.equal(t('Precisione 98.2/100'),'Genauigkeit 98.2/100');assert.equal(t('Finale · Re e torre'),'Endspiel · König und Turm');assert(t('Dopo la tua mossa: +0.22 · dal punto di vista del Bianco').includes('+0.22'));
setLanguage('it');console.log('PASS languages: five catalogs, placeholders, settings migration, coach/checks/hints, unchanged chess state and notation.');
