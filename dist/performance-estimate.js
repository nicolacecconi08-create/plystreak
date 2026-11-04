// Numerical Elo is suspended until a human-game model is trained and independently validated.
export function performanceEstimate(moves,grades,side){const own=moves.map((m,i)=>({m,g:grades[i]})).filter(x=>x.m.color===side),count=own.filter(x=>x.g).length;return{status:'uncalibrated',count,total:own.length,text:`In attesa di validazione · ${count}/${own.length} mosse`}}
