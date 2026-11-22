// Original synthesized cues: no recordings, downloads or third-party audio licenses.
const cues={
 move:[[260,115,0,.065,'triangle'],[940,420,0,.025,'sine']],
 capture:[[180,70,0,.10,'triangle'],[660,190,.014,.055,'triangle'],[1100,510,.014,.025,'sine']],
 check:[[660,660,0,.10,'triangle'],[880,880,.10,.18,'sine']],
 mate:[[392,392,0,.15,'triangle'],[523,523,.13,.15,'sine'],[659,659,.26,.15,'sine'],[784,784,.39,.35,'sine']],
 win:[[523,523,0,.12,'triangle'],[659,659,.12,.12,'triangle'],[784,784,.24,.12,'sine'],[1047,1047,.36,.36,'sine']],
 loss:[[392,392,0,.16,'sine'],[330,330,.16,.16,'sine'],[262,262,.32,.34,'triangle']],
 draw:[[440,440,0,.20,'sine'],[554,554,.07,.20,'sine'],[440,440,.29,.24,'sine']]
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
