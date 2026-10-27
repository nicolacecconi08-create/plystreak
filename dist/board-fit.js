// Size the board from actual surrounding controls, not a fixed viewport deduction.
let queued=false;
export function fitReviewBoard(){
 if(queued)return;queued=true;
 requestAnimationFrame(()=>{
  queued=false;
  const wrap=document.querySelector('.analysis-page .board-wrap'),toolbar=document.querySelector('.board-toolbar');
  if(!wrap||!toolbar)return;
  const viewport=window.visualViewport;
  if(viewport&&viewport.scale!==1)return;
  const height=viewport?.height||window.innerHeight,small=window.matchMedia('(max-width:700px)').matches;
  const nav=document.querySelector('.app-nav');
  const box=wrap.getBoundingClientRect(),bar=toolbar.getBoundingClientRect();
  // The distance below the board includes player, margins, gaps and navigation controls.
  const below=bar.bottom-box.bottom;
  const reserve=small&&nav?nav.getBoundingClientRect().height+12:16;
  const workspace=document.querySelector('.workspace');
  // Use the normal document position, unaffected by the sticky column while scrolling.
  const top=small?box.top+window.scrollY:workspace.getBoundingClientRect().top+window.scrollY+wrap.offsetTop;
  const available=height-top-below-reserve;
  const rail=document.querySelector('.eval-track').getBoundingClientRect().width+parseFloat(getComputedStyle(wrap).gap||0);
  const parent=small?document.querySelector('.workspace'):wrap.parentElement;
  const max=parent.getBoundingClientRect().width;
  // Keep squares usable on unusually short screens; normal phone/tablet/desktop fit fully.
  const size=Math.min(max,Math.max(256+rail,available+rail));
  wrap.style.setProperty('--review-board-width',Math.floor(size)+'px');
 });
}
window.addEventListener('resize',fitReviewBoard);
window.visualViewport?.addEventListener('resize',fitReviewBoard);
document.fonts?.ready.then(fitReviewBoard);
const observer=new ResizeObserver(fitReviewBoard);
for(const selector of ['header','.intro','.board-toolbar','.player:has(#bottomName)','.app-nav']){const el=document.querySelector(selector);if(el)observer.observe(el);}
fitReviewBoard();
