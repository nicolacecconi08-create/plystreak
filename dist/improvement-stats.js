export function improvementStats(games){
 const samples=games.filter(g=>['w','b'].includes(g.side)&&g.analysis?.version===2&&g.analysis.complete&&['1-0','0-1','1/2-1/2'].includes(g.headers?.Result)).sort((a,b)=>a.playedAt-b.playedAt).map(g=>({game:g,ds:g.analysis.details.filter(d=>d.side===g.side&&d.type!=='book'&&Number.isFinite(d.accuracy)&&Number.isFinite(d.loss))})).filter(s=>s.ds.length>=10);
 const summarize=rows=>{const ds=rows.flatMap(s=>s.ds),moves=ds.length;return {games:rows.length,moves,accuracy:moves?ds.reduce((n,d)=>n+d.accuracy,0)/moves:null,errors:moves?100*ds.filter(d=>d.loss>.1).length/moves:null,blunders:moves?100*ds.filter(d=>d.loss>.2).length/moves:null}};
 const recent=summarize(samples.slice(-5)),previous=summarize(samples.slice(-10,-5)),comparable=recent.games===5&&previous.games===5;
 return {recent,previous,comparable,remaining:Math.max(0,10-samples.length),delta:comparable?{accuracy:recent.accuracy-previous.accuracy,errors:recent.errors-previous.errors,blunders:recent.blunders-previous.blunders}:null};
}
