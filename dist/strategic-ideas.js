import {Chess} from './vendor/chess.js';
import {t} from './i18n.js';

// Describe a verified positional feature, then a conditional strategic principle.
export function strategicIdeas(move){
 const before=new Chess(move.before),after=new Chess(move.after),side=move.color;
 if(after.isGameOver())return [];
 const all=after.board().flat().filter(Boolean),own=all.filter(p=>p.color===side),pawns=own.filter(p=>p.type==='p'),out=[];
 const oldPawns=before.board().flat().filter(p=>p?.color===side&&p.type==='p');
 const doubled=ps=>ps.length-new Set(ps.map(p=>p.square[0])).size;
 if(doubled(pawns)>doubled(oldPawns))out.push(t('La mossa crea pedoni doppiati. In strutture simili possono diventare bersagli e avanzare con difficoltà; in compenso, la colonna liberata può offrire attività alle torri. Il bilancio dipende dai pezzi rimasti.'));
 if(move.piece==='p'&&!move.promotion){
  const isolated=!pawns.some(p=>Math.abs(p.square.charCodeAt(0)-move.to.charCodeAt(0))===1);
  if(isolated)out.push(t('Il pedone mosso è isolato: non ha pedoni amici sulle colonne vicine. In queste strutture l’attività dei pezzi può compensare la debolezza; se i pezzi vengono cambiati, difenderlo può diventare più difficile.'));
  const king=own.find(p=>p.type==='k');
  if(king&&'abcgh'.includes(king.square[0])&&Math.abs(move.from.charCodeAt(0)-king.square.charCodeAt(0))<=1&&Math.abs(+move.from[1]-+king.square[1])<=2)
   out.push(t('Hai mosso un pedone vicino al tuo re. Una spinta può guadagnare spazio o aprire una fuga, ma il pedone non può tornare indietro: valuta le case lasciate libere e le linee che l’avversario potrebbe aprire.'));
 }
 if(['n','b'].includes(move.piece)&&move.from[1]===(side==='w'?'1':'8')&&move.to[1]!==move.from[1])
  out.push(t('Questo pezzo lascia la traversa iniziale ed entra in gioco. In apertura lo sviluppo facilita la coordinazione: di solito conviene coinvolgere anche i pezzi rimasti indietro prima di muovere ripetutamente lo stesso pezzo, salvo necessità tattiche.'));
 if(move.piece==='r'&&!pawns.some(p=>p.square[0]===move.to[0]))
  out.push(t('La torre si trova su una colonna senza pedoni amici. In posizioni simili il piano è creare pressione lungo la colonna e cercare case d’ingresso; occupare la colonna da solo non garantisce una penetrazione.'));
 if(move.piece==='n'&&after.attackers(move.to,side).some(s=>after.get(s)?.type==='p')&&!after.attackers(move.to,side==='w'?'b':'w').some(s=>after.get(s)?.type==='p'))
  out.push(t('Il cavallo è sostenuto da un pedone e al momento non è attaccato da pedoni avversari. Questo può essere un punto d’appoggio utile; prima di considerarlo stabile, controlla se una futura spinta di pedone può scacciarlo.'));
 const bishops=own.filter(p=>p.type==='b');
 if(move.captured==='b'&&bishops.length===2&&all.filter(p=>p.color!==side&&p.type==='b').length<2)
  out.push(t('Hai conservato la coppia degli alfieri mentre l’avversario non l’ha più. In genere gli alfieri lavorano meglio con diagonali aperte e gioco su entrambi i lati; una struttura bloccata può ridurre questo vantaggio potenziale.'));
 if(/[kq]/.test(move.flags))out.push(t('L’arrocco collega meglio il re e la torre al piano di sviluppo. La sicurezza del re dipende però dai pedoni davanti a lui e dalle linee aperte: arroccare non basta, da solo, a renderlo al sicuro.'));
 const center=['d4','e4','d5','e5'];
 if(out.length<2&&center.some(s=>after.isAttacked(s,side)&&!before.isAttacked(s,side)))
  out.push(t('Aumenti il controllo di alcune case centrali. In posizioni simili questo offre più possibilità di coordinare i pezzi e limita certi ingressi avversari; il controllo va distinto dall’occupazione e dalla possibilità concreta di mantenere un pezzo al centro.'));
 return out.slice(0,2);
}
