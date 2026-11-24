import {t} from './i18n.js';
export function openingConclusion(game){
 const board=game.board().flat().filter(Boolean);
 const center=board.filter(p=>p.type==='p'&&['d4','e4','d5','e5'].includes(p.square));
 const lines=[t(center.length?'Pedoni al centro · {0}':'Il centro è libero da pedoni.',[center.map(p=>p.square).join(', ')])];
 for(const color of ['w','b']){
  const enemy=color==='w'?'b':'w',home=color==='w'?'1':'8',label=t(color==='w'?'Bianco':'Nero');
  const pieces=board.filter(p=>p.color===color);
  const exposed=pieces.find(p=>'qrbn'.includes(p.type)&&game.isAttacked(p.square,enemy)&&!game.isAttacked(p.square,color));
  const undeveloped=pieces.find(p=>['n','b'].includes(p.type)&&p.square[1]===home);
  const central=center.find(p=>p.color===color);
  let plan;
  if(exposed)plan=t('Controlla il pezzo in {0}: è attaccato e non ha difensori diretti.',[exposed.square]);
  else if(undeveloped)plan=t('Cerca una casa attiva per il pezzo ancora sulla prima traversa in {0}.',[undeveloped.square]);
  else if(central)plan=t('Valuta se sostenere il pedone in {0} o usarlo per aprire il centro.',[central.square]);
  else plan=t('Prima di aprire il centro, confronta la sicurezza dei due re.');
  lines.push(label+' · '+plan);
 }
 return lines;
}
export function showOpeningConclusion(host,game,visible){
 host.hidden=!visible;if(!visible)return;
 const title=document.createElement('h3');title.textContent=t('Dopo questa sequenza');
 host.replaceChildren(title,...openingConclusion(game).map(line=>{const p=document.createElement('p');p.textContent=line;return p}));
}
