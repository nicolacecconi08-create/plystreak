// Render original mono PCM cues with a wooden transient and damped resonances.
import fs from 'node:fs';
const sounds={};
const rate=24000;
const touch=[0,610,.10,.28], knock=[0,320,.12,.42];
const cues={
 move:[touch,[.009,208,.085,.21]],
 capture:[knock,[.034,790,.075,.27],[.037,173,.15,.22]],
 check:[touch,[.044,740,.20,.20],[.10,988,.24,.18]],
 mate:[knock,[.09,392,.27,.21],[.19,523.25,.30,.20],[.31,783.99,.40,.19]],
 win:[touch,[.06,523.25,.25,.22],[.15,659.25,.29,.21],[.25,783.99,.36,.20],[.36,1046.5,.41,.13]],
 loss:[knock,[.065,392,.25,.18],[.19,329.63,.28,.20],[.31,261.63,.46,.22]],
 draw:[touch,[.08,440,.32,.16],[.085,659.25,.32,.12],[.30,440,.40,.17]]
};
for(const [name,notes] of Object.entries(cues)){
 const length=Math.ceil(rate*Math.max(...notes.map(([start,,tail])=>start+tail)));
 const wav=Buffer.alloc(44+2*length);
 wav.write('RIFF');wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);
 wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);
 wav.writeUInt32LE(rate,24);wav.writeUInt32LE(rate*2,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);
 wav.write('data',36);wav.writeUInt32LE(2*length,40);
 let seed=941;
 for(let i=0;i<length;i++){
  let sample=0;
  for(const [start,hz,tail,gain] of notes){
   const age=i/rate-start;
   if(age<0||age>=tail)continue;
   const angle=2*Math.PI*hz*age;
   const env=Math.min(1,age/.0025,(tail-age)/.01)*Math.exp(-5*age/tail);
   sample+=gain*env*(Math.sin(angle)+.32*Math.sin(2.71*angle)*Math.exp(-65*age));
  }
  seed=(Math.imul(seed,1664525)+1013904223)>>>0;
  sample+=(seed/2147483648-1)*.23*Math.min(1,i/18)*Math.exp(-i/(rate*.003));
  wav.writeInt16LE(Math.round(30000*Math.tanh(sample)),44+2*i);
 }
 sounds[name]='data:audio/wav;base64,'+wav.toString('base64');
}

fs.writeFileSync(new URL('../dist/chess-sounds.js',import.meta.url),'export const chessSounds='+JSON.stringify(sounds)+';\n');
