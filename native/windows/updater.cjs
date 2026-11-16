const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const zlib = require('node:zlib');
const ORIGIN = 'https://linea-chess-review.svole-scuole.chatgpt.site';
const MANIFEST = ORIGIN + '/desktop-updates/manifest.json';
const MAX_COMPRESSED = 32 * 1024 * 1024, MAX_DECODED = 64 * 1024 * 1024;
const version = value => typeof value === 'string' && /^\d{1,4}\.\d{1,4}\.\d{1,4}$/.test(value);
function compare(a,b) { const x=a.split('.').map(Number),y=b.split('.').map(Number);for(let i=0;i<3;i++)if(x[i]!==y[i])return x[i]-y[i];return 0; }
function validateManifest(m) {
  if (!m || !version(m.version) || !version(m.minShell) || !Number.isSafeInteger(m.size) || m.size<1 || m.size>MAX_COMPRESSED || !/^[a-f0-9]{64}$/.test(m.sha256) || m.path !== `/desktop-updates/plystreak-core-${m.version}.json.gz`) throw Error('Manifest aggiornamento non valido.');
  return {version:m.version,minShell:m.minShell,size:m.size,sha256:m.sha256,path:m.path,notes:typeof m.notes==='string'?m.notes.slice(0,1000):''};
}
async function download(url,limit,fetcher=fetch) {
  const u=new URL(url);if(u.origin!==ORIGIN||u.protocol!=='https:'||u.username||u.password)throw Error('Origine aggiornamento non consentita.');
  const response=await fetcher(u.href,{redirect:'error',signal:AbortSignal.timeout(120000),cache:'no-store'});
  if(!response.ok)throw Error(`Download non disponibile (${response.status}).`);
  const declared=Number(response.headers.get('content-length'));if(declared>limit)throw Error('Download troppo grande.');
  let total=0;const chunks=[];
  for await(const chunk of response.body){total+=chunk.byteLength;if(total>limit)throw Error('Download troppo grande.');chunks.push(Buffer.from(chunk));}
  return Buffer.concat(chunks);
}
function unpack(bytes,manifest) {
  if(bytes.length!==manifest.size||crypto.createHash('sha256').update(bytes).digest('hex')!==manifest.sha256)throw Error('Checksum aggiornamento non valido.');
  const payload=JSON.parse(zlib.gunzipSync(bytes,{maxOutputLength:96*1024*1024}).toString('utf8'));
  if(payload.version!==manifest.version||!Array.isArray(payload.files)||payload.files.length>1000||!payload.files.length)throw Error('Pacchetto aggiornamento non valido.');
  const names=new Set();let size=0;
  const files=payload.files.map(f=>{
    if(!f||typeof f.path!=='string'||f.path.length>240||!f.path.split('/').every(s=>/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(s)&&!/[. ]$/.test(s)&&! /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(s))||/^(updates|desktop-updates)(\/|$)/i.test(f.path)||f.path==='sw.js'||!/\.(?:js|html|css|json|png|svg|woff2?|ttf|txt|tsv|wasm|webmanifest|md)$|(?:^|\/)[A-Za-z0-9_-]*LICENSE$/i.test(f.path))throw Error('Percorso aggiornamento non valido.');
    const key=f.path.toLowerCase();if(names.has(key))throw Error('File duplicato.');names.add(key);
    if(typeof f.data!=='string'||f.data.length%4||/[^A-Za-z0-9+/=]/.test(f.data))throw Error('Contenuto aggiornamento non valido.');
    const data=Buffer.from(f.data,'base64');if(data.toString('base64')!==f.data)throw Error('Base64 non valido.');size+=data.length;if(size>MAX_DECODED)throw Error('Pacchetto espanso troppo grande.');return {path:f.path,data};
  });
  for(const required of ['index.html','app.js','shell.js','vendor/chess.js','vendor/stockfish-19-lite-single.js','vendor/stockfish-19-lite-single.wasm'])if(!names.has(required))throw Error('Pacchetto incompleto.');
  return files;
}
class Updater {
  constructor({directory,bundledRoot,bundledVersion,shellVersion,fetcher=fetch}){Object.assign(this,{directory,bundledRoot,bundledVersion,shellVersion,fetcher});this.state={};this.offer=null;this.busy=false;this.writes=Promise.resolve();this.sequence=0;}
  writeState(){const snapshot=JSON.stringify(this.state);const run=this.writes.catch(()=>{}).then(async()=>{await fs.mkdir(this.directory,{recursive:true});const id=String(++this.sequence).padStart(12,'0');const tmp=path.join(this.directory,`state-${id}.tmp`);await fs.writeFile(tmp,snapshot);await fs.rename(tmp,path.join(this.directory,`state-${id}.json`));});this.writes=run;return run;}
  validEntry(e){return e&&version(e.version)&&/^[a-f0-9]{64}$/.test(e.hash);}
  async rootFor(e){if(!this.validEntry(e))return null;const root=path.join(this.directory,'cores',e.hash);try{await fs.access(path.join(root,'index.html'));return root}catch{return null}}
  async start(){
    try{const names=(await fs.readdir(this.directory)).filter(n=>/^state-\d{12}\.json$/.test(n)).sort().reverse();this.sequence=names.length?Number(names[0].slice(6,18)):0;for(const name of names){try{const s=JSON.parse(await fs.readFile(path.join(this.directory,name),'utf8'));if(!s||typeof s!=='object')continue;this.state={active:this.validEntry(s.active)?s.active:null,previous:this.validEntry(s.previous)?s.previous:null,pending:this.validEntry(s.pending)?s.pending:null,trial:s.trial===true};break;}catch{ /* An interrupted/corrupt journal entry must not erase the last valid state. */ }}}catch{this.state={};}
    if(this.state.trial){this.state.active=this.state.previous;this.state.trial=false;this.state.pending=null;this.recovered=true;}
    if(this.state.pending&&await this.rootFor(this.state.pending)){this.state.previous=this.state.active;this.state.active=this.state.pending;this.state.pending=null;this.state.trial=true;}
    this.root=await this.rootFor(this.state.active);if(!this.root){this.state.active=null;this.state.trial=false;this.root=this.bundledRoot;}
    this.current=this.state.active?.version||this.bundledVersion;await this.writeState();return this.root;
  }
  async healthy(){if(this.state.trial){this.state.trial=false;await this.writeState();}return {status:'current',current:this.current,recovered:!!this.recovered};}
  async check(){const m=validateManifest(JSON.parse((await download(MANIFEST,16384,this.fetcher)).toString('utf8')));this.offer=null;
    if(compare(m.minShell,this.shellVersion)>0)return {status:'shell',version:m.version};
    if(compare(m.version,this.current)<=0)return {status:'current',current:this.current};this.offer=m;return {status:'available',version:m.version,size:m.size,notes:m.notes};}
  async install(){
    if(this.busy)throw Error('Aggiornamento già in corso.');if(!this.offer)throw Error('Controlla prima gli aggiornamenti.');this.busy=true;
    let staging;
    try {const m=this.offer,files=unpack(await download(ORIGIN+m.path,m.size,this.fetcher),m);const cores=path.join(this.directory,'cores');await fs.mkdir(cores,{recursive:true});staging=await fs.mkdtemp(path.join(cores,'stage-'));
      for(const f of files){const target=path.join(staging,...f.path.split('/'));await fs.mkdir(path.dirname(target),{recursive:true});await fs.writeFile(target,f.data,{flag:'wx'});}
      const final=path.join(cores,m.sha256);try{await fs.rename(staging,final)}catch(e){if(!['EEXIST','ENOTEMPTY','EPERM'].includes(e.code)||!await this.rootFor({version:m.version,hash:m.sha256}))throw e;}
      const previousPending=this.state.pending;this.state.pending={version:m.version,hash:m.sha256};
      try{await this.writeState();}catch(error){this.state.pending=previousPending;throw error;}
      return {status:'ready',version:m.version};
    } finally {this.busy=false;if(staging)await fs.rm(staging,{recursive:true,force:true}).catch(()=>{});}
  }
}
module.exports={Updater,validateManifest,unpack,download,compare,ORIGIN,MANIFEST};
