import {fetchProfile} from './chess-api.js';
import {putRecord} from './archive.js';

export async function connectChessProfile(username,signal){
 const profile=await fetchProfile(username.trim(),signal);
 if(signal.aborted)throw Error('Importazione interrotta.');
 await putRecord(profile,'meta');
 try{
  localStorage.setItem('plystreak-chess-user',profile.username);
  localStorage.removeItem('plystreak-batch-paused');
 }catch{}
 return profile;
}
