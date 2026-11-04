"""Preserve native-only differences while updating shared files from Git changes."""
from pathlib import Path
import gzip,json,base64,subprocess,hashlib
root=Path('dist');old=json.loads(gzip.decompress((root/'updates/plystreak-core-1.16.0.json.gz').read_bytes()));files={f['path']:base64.b64decode(f['data']) for f in old['files']}
changed=subprocess.check_output(['git','diff','--name-only','bb4b070ec7a442cfef13a1a2fcb2fe8fe1582ff4','--','dist'],text=True).splitlines()
changed+=['dist/'+x for x in ['board-geometry.js']]
for path in set(changed):
 if path.startswith('dist/updates/') or not Path(path).is_file():continue
 name=path.removeprefix('dist/');new=Path(path).read_bytes()
 if name in files:
  base=subprocess.check_output(['git','show','bb4b070ec7a442cfef13a1a2fcb2fe8fe1582ff4:'+path])
  if files[name]!=base:
   if name!='app.js':raise RuntimeError('Unreviewed native differences: '+name)
   start=b"$('export').onclick=";end=b"$('methodButton').onclick="
   native=files[name];a=native.index(start);b=native.index(end,a)
   na=new.index(start);nb=new.index(end,na);new=new[:na]+native[a:b]+new[nb:]
 files[name]=new
payload={'version':'1.16.1','files':[{'path':p,'data':base64.b64encode(data).decode()} for p,data in files.items()]}
blob=gzip.compress(json.dumps(payload,separators=(',',':')).encode(),mtime=0);name='plystreak-core-1.16.1.json.gz';(root/'updates'/name).write_bytes(blob)
manifest={'version':'1.16.1','minShell':'1.3.0','path':'/updates/'+name,'size':len(blob),'sha256':hashlib.sha256(blob).hexdigest(),'notes':'Scacchiera quadrata con 64 celle uniformi, coordinate esterne, ridimensionamento condiviso e menu mobile senza etichette spezzate.'}
(root/'updates/manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
assert b'Capacitor' in files['app.js'];assert all(p in files for p in ['overhaul.css','manual-arrows.js','accuracy-metric.js','live-material.js']);print('PC core: native export preserved,',len(files),'files;',len(blob),'bytes;',manifest['sha256'])
