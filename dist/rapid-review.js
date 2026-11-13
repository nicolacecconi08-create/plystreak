export const rapidDelay=count=>Math.max(45,Math.min(110,1400/Math.max(1,count)));
export class RapidReview{
 constructor(wait=ms=>new Promise(r=>setTimeout(r,ms))){this.wait=wait;this.token=0;this.running=false;this.delay=110;}
 cancel(){this.token++;this.running=false;}
 async play(from,to,step,{reduced=false}={}){
  this.cancel();const token=this.token;this.running=true;this.delay=rapidDelay(to-from);
  try{if(reduced){step(to);return true;}for(let i=from+1;i<=to;i++){if(token!==this.token)return false;step(i);await this.wait(this.delay);}return token===this.token;}
  finally{if(token===this.token)this.running=false;}
 }
}
