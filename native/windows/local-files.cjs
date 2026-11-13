const path=require('node:path');
function resolveAsset(root,raw){
  const url=new URL(raw);if(url.protocol!=='plystreak:'||url.hostname!=='app')return null;
  let pathname;try{pathname=decodeURIComponent(url.pathname)}catch{return null}
  if(pathname.includes('\\')||pathname.includes('\0'))return null;
  const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
  return file.startsWith(path.resolve(root)+path.sep)?file:null;
}
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.webmanifest':'application/manifest+json','.wasm':'application/wasm','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2','.ttf':'font/ttf'};
module.exports={resolveAsset,mime};
