// Experimental descriptive scale, not a rating model trained on rated games.
export function performanceEstimate(moves,grades,side,results=[]){
 const own=moves.map((m,i)=>({m,g:grades[i],before:grades[i]?.reviewBefore||results[i]})).filter(x=>x.m.color===side);
 if(own.some(x=>!x.g)||!own.length)return {text:'Disponibile dopo l’analisi completa'};
 const useful=own.filter(({g,before})=>before&&before.mate==null&&Math.abs(before.cp)<1500&&(before.depth||before.lines?.[0]?.depth||0)>=16&&g.type!=='book'&&g.reliable!==false&&Number.isFinite(g.loss)&&Number.isFinite(g.accuracy));
 if(useful.length<12)return {text:'Mosse significative insufficienti (minimo 12)'};
 const mean=useful.reduce((s,{g})=>s+g.accuracy,0)/useful.length;
 const severe=useful.filter(({g})=>g.loss>=.2).length/useful.length;
 const center=Math.round(Math.max(400,Math.min(2600,400+22*mean-700*severe))/50)*50;
 const spread=useful.length<25?400:300;
 return {low:Math.max(100,center-spread),high:Math.min(3000,center+spread),count:useful.length,text:`${Math.max(100,center-spread)}–${Math.min(3000,center+spread)}`};
}
