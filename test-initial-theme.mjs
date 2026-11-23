import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const dist=new URL('./dist/',import.meta.url);
for(const name of readdirSync(dist).filter(n=>n.endsWith('.html'))){
 const head=readFileSync(new URL(name,dist),'utf8').split('</head>')[0];
 assert.match(head,/name="color-scheme"/);
 if(name==='aggiorna.html')continue;
 const early=head.split('<link')[0];
 const script=early.match(/<script>(.*?)<\/script>/s)?.[1];
 assert.ok(script,name);
 for(const [saved,dark,expected] of [[null,false,'dark'],['light',true,'light'],['dark',false,'dark'],['system',true,'dark'],['system',false,'light'],['blocked',false,'dark']]){
  const root={dataset:{}},meta={};
  runInNewContext(script,{document:{documentElement:root,querySelector:()=>meta},matchMedia:()=>({matches:dark}),localStorage:{getItem(){if(saved==='blocked')throw Error();return JSON.stringify({theme:saved})}}});
  assert.equal(root.dataset.theme,expected,name);
  assert.equal(meta.content,expected==='dark'?'#170e18':'#f7efe6');
 }
}
console.log('PASS initial theme on all HTML entries before external resources');
