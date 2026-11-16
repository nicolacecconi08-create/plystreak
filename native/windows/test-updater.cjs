const assert=require('node:assert/strict');
const fs=require('node:fs/promises'),path=require('node:path'),zlib=require('node:zlib'),crypto=require('node:crypto');
const {Updater,validateManifest,unpack,download,ORIGIN}=require('./updater.cjs');
const required=['index.html','app.js','shell.js','vendor/chess.js','vendor/stockfish-19-lite-single.js','vendor/stockfish-19-lite-single.wasm'];
function fixture(version='1.24.2',extra=[]){const body=zlib.gzipSync(JSON.stringify({version,files:[...required.map(path=>({path,data:Buffer.from('fixture').toString('base64')})),...extra]}));return {body,manifest:{version,minShell:'0.2.0',path:`/desktop-updates/plystreak-core-${version}.json.gz`,size:body.length,sha256:crypto.createHash('sha256').update(body).digest('hex')}};}
(async()=>{
 const f=fixture();assert.equal(unpack(f.body,validateManifest(f.manifest)).length,6);
 assert.throws(()=>unpack(Buffer.from('corrupt'),f.manifest));
 for(const name of ['../escape.js','a/../../escape.js','/absolute.js','a\\b.js','C:/escape.js','CON.js','updates/payload.js','desktop-updates/manifest.json','sw.js','main.cjs','app.js']){const x=fixture('1.24.2',[{path:name,data:'eA=='}]);assert.throws(()=>unpack(x.body,x.manifest),name);}
 assert.throws(()=>validateManifest({...f.manifest,path:'https://evil.example/a'}));
 assert.throws(()=>validateManifest({...f.manifest,size:40*1024*1024}));
 await assert.rejects(download('https://evil.example/payload',10,()=>{throw Error('must not fetch')}));
 await assert.rejects(download(ORIGIN+'/x',2,async()=>new Response('123')));
 const directory=await fs.mkdtemp(path.join(__dirname,'test-work-'));
 try {
 const userData=path.join(directory,'visitor-records');await fs.writeFile(userData,'preserve');
 let served=f;const fetcher=async(url,options)=>{assert.equal(options.redirect,'error');return new Response(url.endsWith('manifest.json')?JSON.stringify(served.manifest):served.body)};
 const options={directory:path.join(directory,'core-updates'),bundledRoot:'bundled-fixture',bundledVersion:'1.24.1',shellVersion:'0.2.0',fetcher};
 let u=new Updater(options);assert.equal(await u.start(),'bundled-fixture');assert.equal((await u.check()).status,'available');assert.equal((await u.install()).status,'ready');assert.equal(u.current,'1.24.1','staging does not change running content');
 u=new Updater(options);const next=await u.start();assert(next.endsWith(f.manifest.sha256));assert.equal(u.state.trial,true);
 u=new Updater(options);assert.equal(await u.start(),'bundled-fixture','unhealthy launch rolls back');assert.equal(u.recovered,true);
 await u.check();await u.install();u=new Updater(options);await u.start();await u.healthy();u=new Updater(options);assert((await u.start()).endsWith(f.manifest.sha256));assert.equal((await u.check()).status,'current');
 served=fixture('1.24.3');await u.check();await u.install();u=new Updater(options);await u.start();u=new Updater(options);assert((await u.start()).endsWith(f.manifest.sha256),'rollback keeps last healthy core');
 served={...fixture('1.24.4')};served.manifest.minShell='0.3.0';assert.equal((await u.check()).status,'shell');await assert.rejects(u.install());
 served=fixture('1.24.4');await u.check();const originalBody=served.body;served.body=Buffer.from('corrupt');await assert.rejects(u.install());assert.equal(u.busy,false);assert.equal(u.state.pending,null,'failed download does not schedule activation');served.body=originalBody;
 const writeState=u.writeState.bind(u);u.writeState=async()=>{throw Error('fixture disk failure')};await assert.rejects(u.install(),/fixture disk failure/);assert.equal(u.state.pending,null,'failed journal write does not schedule activation');u.writeState=writeState;
 assert(!(await fs.readdir(path.join(options.directory,'cores'))).some(n=>n.startsWith('stage-')),'staging directories cleaned');
 const corruptJournal=path.join(options.directory,`state-${String(u.sequence+1).padStart(12,'0')}.json`);await fs.writeFile(corruptJournal,'{');u=new Updater(options);assert((await u.start()).endsWith(f.manifest.sha256),'invalid journal entry preserves last valid state');
 assert.equal(await fs.readFile(userData,'utf8'),'preserve');
 console.log('PASS updater: manifest, HTTPS, bounded download, hash, hostile paths, atomic staging, activation, healthy persistence, rollback, shell requirement, failed download/journal, staging cleanup, corrupt journal recovery, user data preserved');
 } finally { await fs.rm(directory,{recursive:true,force:true}); }
})().catch(e=>{console.error(e);process.exitCode=1});

