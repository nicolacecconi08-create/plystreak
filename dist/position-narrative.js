import {Chess} from './vendor/chess.js';
import {pins,opposite,playUci} from './tactics.js';

const nouns={p:'il pedone',n:'il cavallo',b:'l’alfiere',r:'la torre',q:'la donna',k:'il re'};
const value={p:1,n:3,b:3,r:5,q:9,k:100};
const name=p=>`${nouns[p.type]} in ${p.square}`;
const cap=s=>s[0].toUpperCase()+s.slice(1);
const pieces=c=>c.board().flat().filter(Boolean);
function threats(c,square){
 const p=c.get(square);if(!p||pins(c,opposite(p.color)).some(x=>x.pinned.square===square))return [];
 return pieces(c).filter(t=>t.color!==p.color&&c.attackers(t.square,p.color).includes(square)).sort((a,b)=>value[b.type]-value[a.type]);
}
function safeReply(c,result){
 if((result?.fen&&result.fen!==c.fen())||result?.reliable===false||result?.bound||result?.lowerbound||result?.upperbound)return null;
 const line=result?.lines?.[0];if(!line||line.reliable===false||line.bound||line.lowerbound||line.upperbound)return null;
 return playUci(c,line.pv?.[0]);
}
// Facts describe the board or one legal continuation, never claim that a PV is forced.
function buildNarrative(move,after){
 const old=new Chess(move.before),now=new Chess(move.after),side=move.color,enemy=opposite(side),facts=[];
 const moved={type:move.promotion||move.piece,square:move.to};
 if(now.isCheckmate())return [`${cap(name(moved))} dà scacco matto: il re ${side==='w'?'nero':'bianco'} non dispone di alcuna risposta legale.`];
 if(now.isStalemate())return ['La mossa porta allo stallo: il re avversario non è sotto scacco e l’avversario non ha mosse legali. La partita è patta.'];
 const next=new Chess(move.after),reply=safeReply(next,after);
 if(reply){
  const actor=`${nouns[reply.piece]} da ${reply.from} a ${reply.to}`;
  const forced=now.moves().length===1?'È l’unica risposta legale.':'È una risposta possibile, non obbligata.';
  if(next.isCheckmate()){
   const king=pieces(now).find(p=>p.color===side&&p.type==='k');
   facts.push(`L’avversario può dare scacco matto spostando ${actor}: attacca il tuo re in ${king.square} e nella posizione risultante non esiste una difesa legale. È una minaccia immediata.`);
  }else{
   const fork=threats(next,reply.to).filter(p=>p.type!=='p');
   if(fork.length>=2){
    const beforeTargets=threats(now,reply.from).map(p=>p.square);
    const newTargets=fork.filter(p=>!beforeTargets.includes(p.square));
    facts.push(`L’avversario può ${reply.captured?'catturare in '+reply.to+' con '+nouns[reply.piece]+' da '+reply.from:'portare '+actor}: da lì attacca insieme ${fork.map(name).join(' e ')}. ${newTargets.length?'Il doppio attacco nasce con questa risposta.':'Questa risposta mantiene il doppio attacco.'} ${forced}`);
   }
   if(reply.captured){
    const victim=reply.flags.includes('e')?`${nouns[reply.captured]} in ${reply.to[0]+reply.from[1]} (presa en passant)`: `${nouns[reply.captured]} in ${reply.to}`;
    const recaptures=next.moves({verbose:true}).filter(m=>m.captured&&m.to===reply.to);
    facts.push(`Nella continuazione analizzata, ${nouns[reply.piece]} da ${reply.from} cattura ${victim}. ${recaptures.length?`Puoi ricatturare con ${recaptures.slice(0,2).map(m=>nouns[m.piece]+' da '+m.from).join(' oppure ')}; questo passaggio da solo non stabilisce il bilancio dello scambio.`:'Non hai una ricattura immediata legale su quella casa.'}`);
   }
  }
 }
 const captures=now.moves({verbose:true}).filter(m=>m.captured);
 for(const p of pieces(now).filter(p=>p.color===side&&p.type!=='k'&&p.square!==move.to)){
  if(old.attackers(p.square,side).includes(move.from)&&!now.isAttacked(p.square,side)){
   const capture=captures.find(m=>m.to===p.square);
   if(capture){facts.push(`Prima ${nouns[move.piece]} da ${move.from} difendeva ${name(p)}. Spostandosi in ${move.to} lascia quel pezzo senza difensori: ${nouns[capture.piece]} da ${capture.from} può catturarlo legalmente.`);break;}
  }
 }
 const attacked=threats(now,move.to);
 if(attacked.length>=2&&attacked.filter(p=>p.type!=='p').length>=2)facts.push(`${cap(name(moved))} attacca contemporaneamente ${attacked.map(name).join(' e ')}. Gli attacchi sono presenti sulla scacchiera; un guadagno materiale richiede di verificare la difesa avversaria.`);
 else if(attacked.length)facts.push(`${cap(name(moved))} attacca ${attacked.slice(0,2).map(name).join(' e ')}.`);
 const newPin=pins(now,side).find(p=>!pins(old,side).some(q=>q.pinned.square===p.pinned.square&&q.attacker.square===p.attacker.square));
 if(newPin)facts.push(`${cap(name(newPin.attacker))} inchioda ${name(newPin.pinned)} al re: quel pezzo non può lasciare la linea scoperta.`);
 for(const target of pieces(now).filter(p=>p.color===enemy&&'qrk'.includes(p.type))){
  const sq=now.attackers(target.square,side).find(s=>s!==move.to&&'brq'.includes(now.get(s)?.type)&&!old.attackers(target.square,side).includes(s));
  if(sq){facts.push(`Lasciando ${move.from}, ${nouns[move.piece]} apre la linea di ${name({type:now.get(sq).type,square:sq})} verso ${name(target)}: è un attacco scoperto.`);break;}
 }
 const center=['d4','e4','d5','e5'];
 const gained=center.filter(s=>now.isAttacked(s,side)&&!old.isAttacked(s,side));
 const lost=center.filter(s=>old.isAttacked(s,side)&&!now.isAttacked(s,side));
 if(gained.length||lost.length)facts.push(`Il controllo del centro cambia: ${[gained.length?'ora controlli '+gained.join(' e '):'',lost.length?'non controlli più '+lost.join(' e '):''].filter(Boolean).join('; ')}.`);
 if(move.piece==='p'){
  const file=move.to[0],rank=+move.to[1],dir=side==='w'?1:-1;
  const blockers=pieces(now).filter(p=>p.type==='p'&&p.color===enemy&&Math.abs(p.square.charCodeAt(0)-file.charCodeAt(0))<=1&&(+p.square[1]-rank)*dir>0);
  if(!move.promotion&&!blockers.length)facts.push(`Il pedone in ${move.to} è passato: sulle colonne ${['abcdefgh'['abcdefgh'.indexOf(file)-1],file,'abcdefgh'['abcdefgh'.indexOf(file)+1]].filter(Boolean).join(', ')} non ci sono pedoni avversari davanti a lui. Gli altri pezzi possono ancora fermarlo.`);
  for(const bishop of pieces(now).filter(p=>p.color===side&&p.type==='b')){
   const free=c=>{const out=[];for(const [dx,dy] of [[1,1],[1,-1],[-1,1],[-1,-1]]){let x=bishop.square.charCodeAt(0)-97,y=+bishop.square[1]-1;while((x+=dx)>=0&&x<8&&(y+=dy)>=0&&y<8){const sq='abcdefgh'[x]+(y+1);if(c.get(sq))break;out.push(sq)}}return out};
   const prior=free(old),opened=free(now).filter(s=>!prior.includes(s));if(opened.length>=2){facts.push(`La spinta libera la diagonale dell’alfiere in ${bishop.square}: ora le case ${opened.join(', ')} sono libere lungo quella linea.`);break;}
  }
 }
 if(move.piece==='r'){
  const pawns=pieces(now).filter(p=>p.type==='p'&&p.square[0]===move.to[0]);
  if(!pawns.length)facts.push(`La torre in ${move.to} occupa la colonna ${move.to[0]}, priva di pedoni di entrambi i colori.`);
  else if(!pawns.some(p=>p.color===side))facts.push(`La torre in ${move.to} è sulla colonna ${move.to[0]} semiaperta: non ci sono tuoi pedoni, mentre rimangono ${pawns.map(name).join(' e ')}.`);
 }
 if(/[kq]/.test(move.flags))facts.push(`Con l’arrocco il re passa da ${move.from} a ${move.to} e la torre da ${move.flags.includes('k')?'h':'a'}${move.to[1]} a ${move.flags.includes('k')?'f':'d'}${move.to[1]}.`);
 else if(move.piece==='k'&&(side==='w'?/[KQ]/:/[kq]/).test(move.before.split(' ')[2]))facts.push(`Il re va da ${move.from} a ${move.to}: perdi definitivamente il diritto di arroccare.`);
 if(!facts.length){
  const defended=pieces(now).filter(p=>p.color===side&&p.square!==move.to&&p.type!=='k'&&now.attackers(p.square,side).includes(move.to)&&!old.attackers(p.square,side).includes(move.from));
  if(defended.length)facts.push(`${cap(name(moved))} aggiunge una difesa a ${defended.slice(0,3).map(name).join(' e ')}.`);
  else {const reachable=[];for(let f=0;f<8;f++)for(let r=1;r<=8;r++){const sq='abcdefgh'[f]+r;if(now.attackers(sq,side).includes(move.to)&&!now.get(sq))reachable.push(sq)}facts.push(reachable.length?`Da ${move.to}, ${nouns[moved.type]} controlla le case libere ${reachable.slice(0,8).join(', ')}${reachable.length>8?' e altre '+(reachable.length-8):''}. Il solo controllo di queste case non dimostra un vantaggio.`:`${cap(name(moved))} non attacca pezzi avversari e non controlla case libere. Non emerge da questi fatti una conseguenza tattica immediata.`);}
 }
 return [...new Set(facts)];
}

export function moveDescription(move){
 const who=move.color==='w'?'Il Bianco':'Il Nero';
 if(/[kq]/.test(move.flags))return `${who} arrocca ${move.flags.includes('k')?'corto':'lungo'}.`;
 return `${who} porta ${nouns[move.piece]} da ${move.from} a ${move.to}${move.captured?', catturando '+nouns[move.captured]+(move.flags.includes('e')?' en passant':''):''}${move.promotion?' e promuovendo a '+({q:'donna',r:'torre',b:'alfiere',n:'cavallo'})[move.promotion]:''}.`;
}

// A bounded cache avoids repeating geometric scans when only the UI re-renders.
const narrativeCache=new Map();
export function positionNarrative(move,after){
 const line=after?.lines?.[0];
 const key=JSON.stringify([move.before,move.after,move.from,move.to,move.piece,move.promotion,move.flags,after?.fen,after?.reliable,after?.bound,after?.lowerbound,after?.upperbound,line?.pv?.[0],line?.reliable,line?.bound,line?.lowerbound,line?.upperbound]);
 if(narrativeCache.has(key))return [...narrativeCache.get(key)];
 const facts=buildNarrative(move,after);narrativeCache.set(key,facts);
 if(narrativeCache.size>256)narrativeCache.delete(narrativeCache.keys().next().value);
 return [...facts];
}
