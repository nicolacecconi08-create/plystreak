import {Chess} from './vendor/chess.js';
import {drawBoard,choosePiece} from './mini-board.js';
import {positionKey} from './move-grade.js';
import {attackArrows,displayArrows,readArrowOptions} from './review-arrows.js';
const $=id=>document.getElementById(id),board=$('explorerBoard'),chess=new Chess();
let target=null;let data,loading,selected=null,flip=false,limit=12,ids=[],names=[],focusEpoch=0;
const identity=$('explorerIdentity'),choices=$('explorerChoices'),filter=$('explorerSearch');
function el(tag,txt){const e=document.createElement(tag);e.textContent=txt;return e}
function showNames(){const q=filter.value.trim().toLowerCase(),found=ids.filter(i=>label(i).toLowerCase().includes(q));$('explorerNames').replaceChildren(...found.slice(0,limit).map(i=>{const li=el('li',''),b=el('button',label(i));b.type='button';b.className='text-button';b.onclick=()=>{target=i;$('explorerDetails').open=false;render();$('explorerStep').focus()};li.append(b);return li}));$('explorerMore').hidden=found.length<=limit}
const common={"King's Pawn Game":"Partita di pedone di re","Queen's Pawn Game":"Partita di pedone di donna","Zukertort Opening":"Apertura Zukertort","English Opening":"Apertura inglese","Van't Kruijs Opening":"Apertura Van’t Kruijs","Hungarian Opening":"Apertura ungherese"};function label(i){const [eco,name]=data.defs[i],it=names.find(n=>n.eco===eco&&n.sourceName===name);return eco+' · '+(document.documentElement.lang==='it'?(it?.name||common[name]||name):name)}
function render(){
 const hist=chess.history({verbose:true}),last=hist.at(-1);
 drawBoard(board,chess,{flipped:flip,selected,last});const opts=readArrowOptions(),focus=selected||last?.to;displayArrows(board,$('explorerLegend'),focus&&['both','attacks'].includes(opts.mode)?attackArrows(chess.fen(),focus,opts.empty):[],flip);
 $('explorerMoves').textContent=hist.map((m,i)=>(i%2===0?(i/2+1)+'. ':'')+m.san).join(' ');
 $('explorerUndo').disabled=$('explorerReset').disabled=!hist.length;
 if(!data)return;
 const n=data.nodes[positionKey(chess.fen())],exact=n?.[0]||[],edges=Object.entries(n?.[1]||{}).sort((a,b)=>b[1].length-a[1].length||a[0].localeCompare(b[0]));
 const guide=edges.find(([,lines])=>lines.includes(target));const arrived=exact.includes(target);if(!guide&&!arrived)target=null;
 $('explorerGuide').hidden=target===null;$('explorerTarget').textContent=target===null?'':label(target);$('explorerStep').disabled=arrived||!guide;
 $('explorerStep').onclick=()=>{if(!guide)return;const u=guide[0];play({from:u.slice(0,2),to:u.slice(2,4),promotion:u[4]})};
 identity.replaceChildren(el('h2',!hist.length?'Gioca la prima mossa':exact.length?label(exact[0]):n?'Più aperture possibili':'Posizione fuori repertorio'));
 for(const id of exact.slice(1))identity.append(el('p',label(id)));
 if(!n)identity.append(el('p','Puoi continuare a giocare o tornare alla posizione precedente.'));
 ids=[...new Set(edges.flatMap(x=>x[1]))].filter(id=>!exact.includes(id)).sort((a,b)=>label(a).localeCompare(label(b)));
 choices.replaceChildren();const legal=chess.moves({verbose:true});
 for(const [u,lines] of edges){const m=legal.find(m=>m.from+m.to+(m.promotion||'')===u);if(!m)continue;
 const b=el('button','');b.type='button';b.className='opening-card';b.append(el('strong',m.san),el('small',String(new Set(lines).size)));const child=data.nodes[positionKey(m.after)]?.[0];if(child?.length)b.append(el('span',label(child[0])));b.onclick=()=>play(m);choices.append(b)}
 if(!edges.length)choices.append(el('p','Nessuna continuazione documentata da questa posizione.'));
 $('explorerDetails').hidden=!ids.length;showNames();
}
function change(){focusEpoch++;selected=null;limit=12;filter.value='';render()}
function play(m){chess.move({from:m.from,to:m.to,promotion:m.promotion});change()}
board.onclick=async e=>{const sq=e.target.closest('[data-sq]')?.dataset.sq;if(!sq||board.classList.contains('annotating'))return;
 if(selected){const can=chess.moves({square:selected,verbose:true}).filter(m=>m.to===sq);
 if(can.length){let m=can[0];if(can.length>1){const epoch=focusEpoch,p=await choosePiece(chess.turn());if(epoch!==focusEpoch||!p)return;m=can.find(m=>m.promotion===p)}if(m)play(m);return}}
 selected=sq!==selected&&chess.get(sq)?.color===chess.turn()?sq:null;render()};
$('explorerUndo').onclick=()=>{chess.undo();change()};$('explorerReset').onclick=()=>{target=null;chess.reset();change()};$('explorerFlip').onclick=()=>{flip=!flip;render()};filter.oninput=()=>{limit=12;showNames()};$('explorerMore').onclick=()=>{limit+=30;showNames()};
async function mode(on){$('catalogPane').hidden=on;$('explorerPane').hidden=!on;$('showExplorer').setAttribute('aria-pressed',on);$('showCatalog').setAttribute('aria-pressed',!on);if(!on)return;render();
 if(!data){identity.replaceChildren(el('p','Caricamento del repertorio…'));try{loading??=Promise.all(['explorer.json','opening-catalog.json'].map(async f=>{const r=await fetch('vendor/'+f);if(!r.ok)throw Error();return r.json()}));[data,names]=await loading;render()}catch{loading=null;identity.replaceChildren(el('p','Repertorio non disponibile. Riapri l’esploratore per riprovare.'))}}}
$('explorerFree').onclick=()=>{target=null;render()};$('showExplorer').disabled=false;$('showExplorer').onclick=()=>mode(true);$('showCatalog').onclick=()=>mode(false);
