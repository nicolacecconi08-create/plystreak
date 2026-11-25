// Each distinct position counts once, including solves recorded before the journey existed.
export const milestones=[1,3,6,10,15,21];
export function puzzleJourney(attempts){
 const solved=new Set(attempts.filter(a=>a.cardId&&a.success&&!a.assisted).map(a=>a.cardId)).size;
 // Keep the finished chapter visible until the player solves the next puzzle.
 const chapter=Math.floor(Math.max(0,solved-1)/21);
 return {solved,chapter,targets:milestones.map(n=>21*chapter+n)};
}
