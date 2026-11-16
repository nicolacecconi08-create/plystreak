// Original synthesized cues: no recordings, downloads or third-party audio licenses.
const cues={
 move:[[480,210,0,.085,'triangle']],
 capture:[[240,95,0,.12,'triangle'],[720,360,.025,.07,'sine']],
 check:[[660,660,0,.11,'sine'],[880,880,.12,.14,'sine']],
 mate:[[440,440,0,.13,'sine'],[554,554,.13,.13,'sine'],[660,660,.26,.22,'sine']],
 win:[[523,523,0,.12,'sine'],[659,659,.12,.12,'sine'],[784,784,.24,.25,'sine']],
 loss:[[392,392,0,.15,'sine'],[330,330,.15,.15,'sine'],[262,262,.3,.23,'sine']],
 draw:[[440,440,0,.16,'sine'],[440,440,.19,.22,'sine']]
};

export function outcomeSound(result,side){
 if(result==='1/2-1/2')return 'draw';
 if(!['1-0','0-1'].includes(result))return null;
 return !['w','b'].includes(side)?'mate':(result==='1-0'?'w':'b')===side?'win':'loss';
}
export function moveSound(chess,move,{terminal=true,side}={}){
 if(terminal&&chess?.isCheckmate())return outcomeSound(chess.turn()==='w'?'0-1':'1-0',side);
 if(terminal&&chess?.isDraw())return 'draw';
 if(chess?.isCheck())return 'check';
 return move?.captured||move?.flags?.includes('e')?'capture':'move';
}
// Prime with a restored snapshot before observing changes: opening a finished game is silent.
export function createOutcomeObserver(){
 let previous=null;
 return data=>{const cue=previous?.id===data.id&&previous.result==='*'?outcomeSound(data.result,data.side):null;previous={id:data.id,result:data.result};return cue;};
}
export function createBoardAudio({createContext,getPreferences}){
 let context=null,resuming=null;
 const voices=new Set();
 const enabled=()=>{const p=getPreferences();return p.sound&&p.volume>0;};
 function stop(){for(const voice of voices){try{voice.osc.stop()}catch{}voice.osc.disconnect();voice.gain.disconnect()}voices.clear()}
 function unlock(){
  if(!enabled())return false;
  try{
   if(!context||context.state==='closed')context=createContext();
   if(context.state!=='running'&&!resuming){resuming=Promise.resolve(context.resume()).catch(()=>{}).finally(()=>{resuming=null})}
   return context.state==='running';
  }catch{return false}
 }
 function play(kind='move'){
  if(!enabled()){stop();return false}
  // A suspended context must never queue a delayed chorus after a later gesture.
  if(!unlock())return false;
  stop();
  const volume=Math.max(0,Math.min(1,getPreferences().volume));
  try{for(const [frequency,end,offset,duration,type] of cues[kind]||cues.move){
   const osc=context.createOscillator(),gain=context.createGain(),voice={osc,gain};
   voices.add(voice);const at=context.currentTime+offset;
   osc.type=type;osc.frequency.setValueAtTime(frequency,at);osc.frequency.exponentialRampToValueAtTime(end,at+duration);
   gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(.12*volume,at+.006);gain.gain.exponentialRampToValueAtTime(.0001,at+duration);
   osc.connect(gain);gain.connect(context.destination);
   osc.onended=()=>{osc.disconnect();gain.disconnect();voices.delete(voice)};
   osc.start(at);osc.stop(at+duration+.01);
  }return true}catch{stop();return false}
 }
 return {play,unlock,stop};
}
