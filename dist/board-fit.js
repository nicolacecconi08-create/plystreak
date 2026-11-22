// Size the board from actual surrounding controls, not a fixed viewport deduction.
let queued=false;
export function fitReviewBoard(){
 if(queued)return;queued=true;
 requestAnimationFrame(()=>{
  queued=false;
  const wrap=document.querySelector('.analysis-page .board-wrap'),toolbar=document.querySelector('.board-toolbar');
  if(!wrap||!toolbar)return;
  if(document.body.classList.contains('mobile-review')){
   // Phones use normal page scrolling: keep all eight files readable instead of
   // squeezing the board beside a panel or into the remaining viewport height.
   const workspace=document.querySelector('.workspace');
   const width=workspace.clientWidth;
   wrap.style.setProperty('--review-board-width',Math.floor(width)+'px');return;
  }
  const viewport=window.visualViewport;
  if(viewport&&viewport.scale!==1)return;
  const height=viewport?.height||window.innerHeight,small=window.matchMedia('(max-width:700px)').matches;
  const nav=document.querySelector('.app-nav');
  const box=wrap.getBoundingClientRect(),bar=toolbar.getBoundingClientRect();
  // The distance below the board includes player, margins, gaps and navigation controls.
  const important=document.querySelector('.important-navigation');
  const below=(important?important.getBoundingClientRect().bottom:bar.bottom)-box.bottom;
  const reserve=small&&nav?nav.getBoundingClientRect().height+12:16;
  const workspace=document.querySelector('.workspace');
  // Use the normal document position, unaffected by the sticky column while scrolling.
  const top=small?box.top+window.scrollY:workspace.getBoundingClientRect().top+window.scrollY+wrap.offsetTop;
  const available=height-top-below-reserve;
  const rail=(wrap.querySelector('.eval-track')?.getBoundingClientRect().width||0)+(parseFloat(getComputedStyle(wrap).gap)||0);
  const parent=small?document.querySelector('.workspace'):wrap.parentElement;
  const max=parent.getBoundingClientRect().width;
  // Keep squares usable on unusually short screens; normal phone/tablet/desktop fit fully.
  const size=Math.min(max,Math.max((small||height<700?256:420)+rail+18,available+rail-2));
  wrap.style.setProperty('--review-board-width',Math.floor(size)+'px');
 });
}
window.addEventListener('resize',fitReviewBoard);
window.visualViewport?.addEventListener('resize',fitReviewBoard);
document.fonts?.ready.then(fitReviewBoard);
const observer=new ResizeObserver(fitReviewBoard);
for(const selector of ['header','.intro','.workspace','.board-toolbar','.important-navigation','.player:has(#bottomName)','.app-nav']){const el=document.querySelector(selector);if(el)observer.observe(el);}
fitReviewBoard();
