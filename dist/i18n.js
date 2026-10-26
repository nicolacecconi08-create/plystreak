import {catalog} from './locales/catalog.js';
export const languages=['it','en','es','fr','de'];
let language='it';try{const s=JSON.parse(localStorage.getItem('plystreak-settings'));if(languages.includes(s?.language))language=s.language}catch{}
export const getLanguage=()=>language;
export const locale=()=>({it:'it-IT',en:'en-GB',es:'es-ES',fr:'fr-FR',de:'de-DE'})[language];
const exact=new Map(catalog.map(row=>[row[0],row]));
const escape=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const patterns=catalog.filter(r=>/\{\d+\}/.test(r[0])).map(row=>{const keys=[];let last=0,source='';for(const m of row[0].matchAll(/\{(\d+)\}/g)){source+=escape(row[0].slice(last,m.index))+'(.+?)';keys.push(+m[1]);last=m.index+m[0].length}return {row,keys,re:new RegExp('^'+source+escape(row[0].slice(last))+'$')}});
function tr(s,depth=0){if(language==='it'||!s||depth>6)return s;const n=languages.indexOf(language),row=exact.get(s);if(row)return row[n]||s;for(const p of patterns){const m=s.match(p.re);if(m){const values={};p.keys.forEach((k,i)=>values[k]=tr(m[i+1],depth+1));return p.row[n].replace(/\{(\d+)\}/g,(_,k)=>values[k]??'')}}
 // Translate independently authored sentences and UI separators, preserving notation.
 const parts=s.split(/( · |\n|(?<=[.!?])\s+)/);if(parts.length>1)return parts.map(p=>/^( · |\n|\s+)$/.test(p)?p:tr(p,depth+1)).join('');
 const match=s.match(/^(←\s*|＋\s*|↥\s*)?(.+?)(\s*[→↗])?$/);if(match&&(match[1]||match[3]))return (match[1]||'')+tr(match[2],depth+1)+(match[3]||'');
 if(/[.!?:]$/.test(s)){const base=s.slice(0,-1),r=exact.get(base);if(r)return r[n]+s.at(-1)}
 return s;
}
export function t(source,values={}){return tr(source).replace(/\{(\d+)\}/g,(m,k)=>values[k]??m)}
export function setLanguage(value){language=languages.includes(value)?value:'it';if(typeof document!=='undefined'){document.documentElement.lang=language;translateTree(document.body);translateTree(document.head)}}
const original=new WeakMap(),attributes=new WeakMap();
const skip='script,style,textarea,code,pre,[translate="no"],#pgn,#setupName,#opponentName,#dialogueName,#whiteName,#blackName,#topName,#bottomName,#gameRecap,.archive-row strong';
function textNode(node){const parent=node.parentElement;if(!parent||parent.closest(skip))return;const value=node.nodeValue,old=original.get(node);const source=old&&value===old.output?old.source:value;const clean=source.trim();if(!clean)return;const label=language==='de'&&parent.closest('.app-nav')?({'Analizza':'Analyse','Impostazioni':'Optionen'}[clean]||tr(clean)):tr(clean);const output=source.replace(clean,()=>label);original.set(node,{source,output});if(value!==output)node.nodeValue=output}
function element(el){if(el.closest(skip))return;const saved=attributes.get(el)||{};for(const key of ['title','aria-label','placeholder']){const value=el.getAttribute(key);if(value==null)continue;const old=saved[key],source=old&&value===old.output?old.source:value;let output=tr(source);if(key==='aria-label'&&/^[a-h][1-8] (Bianco|Nero) /.test(source)){const [square,color,...piece]=source.split(' ');output=square+' '+tr(color)+' '+tr(piece.join(' '))}saved[key]={source,output};if(output!==value)el.setAttribute(key,output)}attributes.set(el,saved)}
export function translateTree(root){if(!root)return;if(root.nodeType===3){textNode(root);return}if(root.nodeType===1)element(root);const walker=document.createTreeWalker(root,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT);let node;while(node=walker.nextNode()){if(node.nodeType===3)textNode(node);else element(node)}}
if(typeof document!=='undefined'){
 const pending=new Set();let scheduled=false;
 const observer=new MutationObserver(records=>{for(const r of records){if(r.type==='childList')r.addedNodes.forEach(n=>pending.add(n));else pending.add(r.target)}if(!scheduled){scheduled=true;queueMicrotask(()=>{scheduled=false;observer.disconnect();for(const n of pending)if(n.isConnected)translateTree(n);pending.clear();observe()})}});
 const observe=()=>observer.observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['title','aria-label','placeholder']});
 const start=()=>{setLanguage(language);observe()};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
 window.addEventListener('ply-settings',e=>{observer.disconnect();setLanguage(e.detail.language);observe()});
}
