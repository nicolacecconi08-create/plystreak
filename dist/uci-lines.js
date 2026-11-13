// MultiPV lines arrive separately: never compare a new primary to an older alternative.
export class UciLines {
 constructor(side){this.side=side;this.depths=new Map();this.latest=0;}
 add(text){
  if(!text.startsWith('info ')||/\b(?:lowerbound|upperbound)\b/.test(text))return;
  const score=text.match(/\bscore (cp|mate) (-?\d+)/),depth=Number(text.match(/\bdepth (\d+)/)?.[1]),n=Number(text.match(/\bmultipv (\d+)/)?.[1]||1),tail=text.split(' pv ')[1];
  if(!score||!depth||!tail)return;
  const pv=tail.trim().split(/\s+/);if(!pv.every(u=>/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(u)))return;
  const raw=Number(score[2]),mate=score[1]==='mate'?raw*this.side:null,cp=mate===null?raw*this.side:(raw>0?100000:-100000)*this.side;
  if(!this.depths.has(depth))this.depths.set(depth,new Map());
  const observed={};for(const key of ['seldepth','nodes','time','hashfull','nps','tbhits']){const i=text.split(' pv ')[0].match(new RegExp('\\b'+key+' (\\d+)'));if(i)observed[key]=Number(i[1])}
  this.depths.get(depth).set(n,{cp,mate,pv,depth,multipv:n,...observed});if(n===1)this.latest=Math.max(this.latest,depth);
  for(const d of this.depths.keys())if(d<this.latest-2)this.depths.delete(d);
 }
 finish(){
  const set=this.depths.get(this.latest);if(!set?.has(1))return [];
  const first=set.get(1),out=[first];
  for(const [n,line]of [...set].sort((a,b)=>a[0]-b[0]))if(n>1&&line.pv[0]!==first.pv[0])out.push(line);
  return out;
 }
}
