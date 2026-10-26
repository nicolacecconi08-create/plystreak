// Sites strips .html from public URLs; desktop builds keep the extension.
export function navigationPage(pathname){
 const name=pathname.replace(/\/+$/,'').split('/').pop()||'index';
 return name.replace(/\.html$/i,'')+'.html';
}
