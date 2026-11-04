// Resolve the final flex/grid width before assigning height. This also avoids
// WebKit's transferred aspect-ratio size stretching the board beside an eval rail.
const watched=new WeakSet();
export function syncBoardSize(board){
 const width=board.getBoundingClientRect().width;
 if(width>0&&Math.abs(parseFloat(board.style.height||'0')-width)>.1)board.style.height=width+'px';
}
const observer=typeof ResizeObserver==='undefined'?null:new ResizeObserver(entries=>{
 for(const {target} of entries)syncBoardSize(target);
});
export function maintainBoardGeometry(board){
 syncBoardSize(board);
 if(!watched.has(board)){watched.add(board);observer?.observe(board);}
}
