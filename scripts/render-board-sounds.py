"""Render the bundled WAV cues from Kenney Impact Sounds (CC0).
Usage: python scripts/render-board-sounds.py path/to/kenney-impact-sounds.zip
Build-time dependencies: numpy, soundfile.
"""
import base64
import io
import json
from pathlib import Path
import sys
import wave
from zipfile import ZipFile

import numpy as np
import soundfile as sf

rate = 24000
samples = {}
with ZipFile(sys.argv[1]) as pack:
    for key, name in [('tap','Wood_light_004'), ('knock','Wood_medium_002'), ('bell','Bell_heavy_002')]:
        raw, hz = sf.read(io.BytesIO(pack.read('Audio/impact' + name + '.ogg')), always_2d=True)
        mono = raw.mean(axis=1)
        onset = np.flatnonzero(abs(mono) > abs(mono).max() * .015)[0]
        samples[key] = (mono[onset:] / abs(mono).max(), hz)

# Source, start time, playback rate, amplitude and maximum duration.
scores = {
    'move': [('tap',0,1,.64,.18)],
    'capture': [('tap',0,1.2,.44,.12),('knock',.055,.9,.83,.24)],
    'check': [('knock',0,1.1,.64,.16),('bell',.07,1.42,.43,.34)],
    'mate': [('knock',0,.76,.72,.24),('bell',.11,.9,.52,.64)],
    'win': [('bell',0,1,.45,.29),('bell',.15,1.25,.48,.29),('bell',.31,1.5,.55,.55)],
    'loss': [('bell',0,.96,.52,.36),('bell',.23,.72,.45,.61)],
    'draw': [('tap',0,.93,.44,.15),('bell',.13,1.04,.39,.32),('bell',.39,1.04,.32,.39)],
}
sounds = {}
for event, notes in scores.items():
    mix = np.zeros(round(max(start+length for _,start,_,_,length in notes)*rate))
    for key,start,speed,gain,length in notes:
        source,hz = samples[key]
        offset = round(start*rate)
        size = min(round(length*rate),len(mix)-offset)
        clip = np.interp(np.arange(size)*speed*hz/rate,np.arange(len(source)),source,right=0)
        fade = min(size,round(.025*rate))
        clip[-fade:] *= np.linspace(1,0,fade)
        mix[offset:offset+size] += gain*clip
    buffer = io.BytesIO()
    with wave.open(buffer,'wb') as wav:
        wav.setparams((1,2,rate,0,'NONE','not compressed'))
        wav.writeframes((np.clip(mix,-.95,.95)*32767).astype('<i2').tobytes())
    sounds[event] = 'data:audio/wav;base64,' + base64.b64encode(buffer.getvalue()).decode()
path = Path(__file__).resolve().parents[1] / 'dist/chess-sounds.js'
path.write_text('export const chessSounds='+json.dumps(sounds,separators=(',',':'))+';\n',encoding='utf8')
