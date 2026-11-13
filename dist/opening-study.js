import {Chess} from './vendor/chess.js';
import {positionKey} from './move-grade.js';
import {escapeHTML as esc} from './settings.js';
export function studyUrl(move,history){
 const end=history.findIndex(m=>m.before===move.before&&m.after===move.after);if(end<0)return null;
 const c=new Chess(history[0].before);for(const m of history.slice(0,end+1))c.move({from:m.from,to:m.to,promotion:m.promotion});
 for(const key of Object.keys(c.getHeaders()))if(!['FEN','SetUp'].includes(key))c.removeHeader(key);
 return 'openings.html?'+new URLSearchParams({pgn:c.pgn().replace(/^\[(?!FEN |SetUp )[^\n]*\]\s*$/gm,'').trim()}).toString();
}
export function theoryCard(move,grade,book,history){
 const opening=grade?.type==='book'&&book[positionKey(move.after)];if(!opening)return '';
 const href=studyUrl(move,history);return `<section class="theory-study"><span class="eyebrow">APERTURA RICONOSCIUTA</span><p><strong>${esc(opening.name)}</strong> <span>· ${esc(opening.eco)}</span></p>${href?`<a class="secondary" href="${esc(href)}" target="_blank" rel="noopener">Impara questa apertura o gambit ↗</a>`:''}</section>`;
}
export function studyFromQuery(query,book,catalog){
 const params=new URLSearchParams(query),pgn=params.get('pgn');if(!pgn)return null;
 if(pgn.length>16000)throw Error('La sequenza di studio è troppo lunga.');
 const c=new Chess();try{c.loadPgn(pgn,{strict:true});}catch{throw Error('La sequenza di studio non è valida.');}
 const history=c.history({verbose:true});if(!history.length||history.length>200)throw Error('La sequenza di studio non è valida.');
 const opening=book[positionKey(c.fen())];if(!opening)throw Error('Questa posizione non è riconosciuta nel repertorio delle aperture.');
 const family=catalog.filter(o=>opening.name===o.sourceName||opening.name.startsWith(o.sourceName+':')||opening.name.startsWith(o.sourceName+',')).sort((a,b)=>b.sourceName.length-a.sourceName.length)[0];
 return {id:'from-review',name:opening.name,sourceName:opening.name,eco:opening.eco,category:/gambit/i.test(opening.name)?'gambetto':'apertura',pgn:c.pgn(),fen:c.fen(),ply:history.length,tags:['dalla revisione'],idea:family?`Idee della famiglia ${family.name}: ${family.idea}`:'Ripercorri la sequenza riconosciuta e osserva sviluppo, controllo del centro e sicurezza dei re. Per questa variante non è ancora presente una lezione strategica dedicata.',caution:family?`Indicazione generale della famiglia, da adattare alla variante: ${family.caution}`:'Questa è la sequenza della tua partita fino alla posizione di teoria: il riconoscimento della posizione non certifica che ogni mossa precedente sia stata la migliore.',source:'Lichess chess-openings · CC0',fromReview:true};
}
