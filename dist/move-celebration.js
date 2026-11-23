const states=new WeakMap();
export function celebrateMove(board,{key,square,type,enabled=true}){
 const old=states.get(board);if(old?.key===key)return;
 old?.animation?.cancel();const state={key};states.set(board,state);
 const colors={brilliant:'#287f80',great:'#7162a8',best:'#4f795d',excellent:'#68864c',good:'#747968',inaccuracy:'#a47a24',mistake:'#b76532',blunder:'#b5485d',miss:'#a05c80'};
 if(!enabled||!colors[type])return;
 const target=board.querySelector(`[data-sq="${square}"]`);if(!target?.animate)return;
 const color=colors[type];
 if(['brilliant','great'].includes(type)){board.animate?.([{boxShadow:`0 0 0 0 ${color}00`},{boxShadow:`0 0 0 8px ${color}bb, 0 0 30px ${color}88`,offset:.35},{boxShadow:`0 0 0 0 ${color}00`}],{duration:1600,easing:'ease-out'});const badge=target.ownerDocument?.createElement('span');if(badge){badge.textContent=type==='brilliant'?'!!':'!';badge.setAttribute('aria-hidden','true');badge.style.cssText=`position:absolute;z-index:12;right:4%;top:4%;border-radius:50%;padding:.15em .3em;background:${color};color:white;font:bold clamp(12px,2vw,24px) system-ui;pointer-events:none`;target.append(badge);const a=badge.animate([{opacity:0,transform:'translateY(12px) scale(.4)'},{opacity:1,transform:'translateY(-5px) scale(1.2)',offset:.35},{opacity:0,transform:'translateY(-20px) scale(.9)'}],{duration:1600,easing:'ease-out'});a.onfinish=a.oncancel=()=>badge.remove();}}
 state.animation=target.animate([{boxShadow:`inset 0 0 0 0 ${color}00`,filter:'brightness(1)'},{boxShadow:`inset 0 0 0 6px ${color}, inset 0 0 30px 12px ${color}99`,filter:'brightness(1.28)',offset:.4},{boxShadow:`inset 0 0 0 0 ${color}00`,filter:'brightness(1)'}],{duration:1500,easing:'cubic-bezier(.16,1,.3,1)',fill:'none'});
 const piece=target.querySelector('img');if(['brilliant','great'].includes(type)&&piece?.animate)piece.animate([{transform:'scale(1) rotate(0deg)'},{transform:'scale(1.22) rotate(-7deg)',offset:.28},{transform:'scale(.96) rotate(3deg)',offset:.58},{transform:'scale(1) rotate(0deg)'}],{duration:1250,easing:'ease-out'});
 state.animation.onfinish=()=>{state.animation=null;};
}
