import {maintainBoardGeometry} from './board-geometry.js';
import {mountAnnotations} from './manual-arrows.js';
// Keep decoded piece images and square buttons alive between board updates.
export function updateBoard(board,html){
 const template=document.createElement('template');template.innerHTML=html;
 const desired=[...template.content.children],existing=new Map([...board.children].filter(n=>n.dataset.sq).map(n=>[n.dataset.sq,n]));
 const pool=[...board.querySelectorAll('.square > img')],used=new Set(),images=new Map();
 // Reserve unchanged pieces first, so an identical pawn cannot steal their node.
 for(const next of desired){const wanted=next.querySelector('img'),old=existing.get(next.dataset.sq)?.querySelector('img');if(wanted&&old&&old.getAttribute('src')===wanted.getAttribute('src')){images.set(next,old);used.add(old)}}
 for(const next of desired){const wanted=next.querySelector('img');if(!wanted||images.has(next))continue;const image=pool.find(p=>!used.has(p)&&p.getAttribute('src')===wanted.getAttribute('src'))||wanted;images.set(next,image);used.add(image)}
 for(const [i,next] of desired.entries()){
  const square=existing.get(next.dataset.sq)||next,image=images.get(next);
  for(const attr of [...square.attributes])if(!next.hasAttribute(attr.name)&&attr.name!=='style')square.removeAttribute(attr.name);
  for(const attr of [...next.attributes])if(square.getAttribute(attr.name)!==attr.value)square.setAttribute(attr.name,attr.value);
  if(square!==next){
   for(const child of [...square.childNodes])if(child!==image)child.remove();
   if(image&&image.parentElement!==square)square.prepend(image);
   for(const child of [...next.children])if(child.tagName!=='IMG')square.append(child);
  }else if(image&&image!==square.querySelector('img'))square.querySelector('img')?.replaceWith(image);
  if(board.children[i]!==square)board.insertBefore(square,board.children[i]||null);
 }
 for(const old of [...board.children])if(!old.classList.contains('manual-arrows')&&!desired.some(n=>n.dataset.sq===old.dataset.sq))old.remove();
 maintainBoardGeometry(board);mountAnnotations(board);board.dispatchEvent(new Event('board-updated'));
}
