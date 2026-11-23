export function startupUpdateGuard({storage,now=()=>Date.now(),referrer='',origin='',limit=30000}){
 let interacted=false,first=false;
 try{first=!storage.getItem('plystreak-session-started')&&(!referrer||new URL(referrer).origin!==origin);storage.setItem('plystreak-session-started','1')}catch{}
 const start=now();return {interact(){interacted=true},canApply(){return first&&!interacted&&now()-start<limit}};
}
