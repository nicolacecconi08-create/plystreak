import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {gzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const version=JSON.parse(await fs.readFile(path.join(root,'native/windows/core-version.json'),'utf8')).version;
if(!/^\d+\.\d+\.\d+$/.test(version))throw Error('Invalid core version');
const files=[];
async function walk(dir,prefix='') {for(const entry of (await fs.readdir(dir,{withFileTypes:true})).sort((a,b)=>a.name<b.name?-1:a.name>b.name?1:0)){const rel=prefix+entry.name;if(!prefix&&['updates','desktop-updates','sw.js'].includes(entry.name))continue;if(entry.isSymbolicLink())throw Error('Symlinks are not allowed');if(entry.isDirectory())await walk(path.join(dir,entry.name),rel+'/');else files.push({path:rel,data:(await fs.readFile(path.join(dir,entry.name))).toString('base64')});}}
await walk(path.join(root,'dist'));
const bytes=gzipSync(JSON.stringify({version,files}));
const manifest={version,minShell:'0.2.0',path:`/desktop-updates/plystreak-core-${version}.json.gz`,size:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),notes:'Analisi più efficiente, nuovi suoni e interfaccia, correzioni backup e aggiornamenti desktop.'};
const {unpack,validateManifest}=await import('../native/windows/updater.cjs');unpack(bytes,validateManifest(manifest));
await fs.mkdir(path.join(root,'dist/desktop-updates'),{recursive:true});
await fs.writeFile(path.join(root,'dist',manifest.path),bytes);
await fs.writeFile(path.join(root,'dist/desktop-updates/manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({version,files:files.length,size:bytes.length,sha256:manifest.sha256}));
