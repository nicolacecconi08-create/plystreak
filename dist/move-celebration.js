const states=new WeakMap();
export function celebrateMove(board,{key,square,type,enabled=true}){
 const old=states.get(board);if(old?.key===key)return;
 old?.animation?.cancel();const state={key};states.set(board,state);
 if(!enabled||!['brilliant','great'].includes(type))return;
 const target=board.querySelector(`[data-sq="${square}"]`);if(!target?.animate)return;
 const color=type==='brilliant'?'#32aaa1':'#548ac1';
 state.animation=target.animate([{boxShadow:`inset 0 0 0 0 ${color}00`,filter:'brightness(1)'},{boxShadow:`inset 0 0 0 6px ${color}, inset 0 0 30px 12px ${color}99`,filter:'brightness(1.28)',offset:.4},{boxShadow:`inset 0 0 0 0 ${color}00`,filter:'brightness(1)'}],{duration:1000,easing:'ease-out',fill:'none'});
 state.animation.onfinish=()=>{state.animation=null;};
}
