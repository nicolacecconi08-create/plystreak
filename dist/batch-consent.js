import {t} from './i18n.js';

export function askBatchConsent(username,count,signal){
 if(signal?.aborted)return Promise.resolve(null);
 return new Promise(resolve=>{
  const dialog=document.createElement('dialog');
  dialog.className='batch-consent';
  const title=document.createElement('h2'),summary=document.createElement('p');
  title.id='batchConsentTitle';title.textContent=t('Analizzare le nuove partite?');
  dialog.setAttribute('aria-labelledby',title.id);
  summary.textContent=t('Partite Chess.com da analizzare per {0}: {1}.',[username,count]);
  const later=document.createElement('button'),allow=document.createElement('button');
  later.className='secondary';later.textContent=t('Più tardi');
  allow.className='primary';allow.textContent=t('Analizza tutte');
  const actions=document.createElement('div');actions.append(later,allow);
  dialog.append(title,summary,actions);
  function finish(answer){
   signal?.removeEventListener('abort',abort);
   dialog.remove();resolve(answer);
  }
  const abort=()=>finish(null);
  later.onclick=()=>finish(false);allow.onclick=()=>finish(true);
  dialog.oncancel=e=>{e.preventDefault();finish(false)};
  signal?.addEventListener('abort',abort,{once:true});
  document.body.append(dialog);dialog.showModal();later.focus();
 });
}

// importLatest appends IDs under the batch lock. A decision covers only that prefix.
export async function approvedQueue(job,records,{manual=false,signal,ask=askBatchConsent,save}){
 const count=job.ids.length;
 const outstanding=records.filter((record,i)=>record&&i>=(job.approvedCount||0)).length;
 if(outstanding&&(manual||count>(job.promptedCount||0))){
  const answer=await ask(job.id.slice(6),outstanding,signal);
  if(answer===null||signal?.aborted)return {pending:[],deferred:true};
  job.promptedCount=count;
  if(answer)job.approvedCount=count;
  await save(job);
 }
 return {pending:records.slice(0,job.approvedCount||0).filter(Boolean),deferred:outstanding>0&&(job.approvedCount||0)<count};
}
