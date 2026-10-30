// UCI bounds and explicitly unreliable results cannot support special awards or deltas.
export function exactEvaluation(result){
 const line=result?.lines?.[0]||result;
 const invalid=x=>!x||x.reliable===false||!!x.bound||!!x.lowerbound||!!x.upperbound;
 return !invalid(result)&&!invalid(line)&&Number.isFinite(result.cp)&&Number.isFinite(line.cp)&&result.cp===line.cp;
}
export function comparableEvaluations(a,b,minDepth=18){
 const x=a?.lines?.[0]||a,y=b?.lines?.[0]||b;
 return exactEvaluation(a)&&exactEvaluation(b)&&Number.isFinite(x.depth)&&Number.isFinite(y.depth)&&Math.min(x.depth,y.depth)>=minDepth&&Math.abs(x.depth-y.depth)<=2;
}
