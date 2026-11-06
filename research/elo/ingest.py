"""Read complete PGNs from reproducible prefixes of Lichess standard rated exports.
Sample acquisition only: these first-of-month prefixes are not a population sample.
Usage: python3 research/elo/ingest.py /tmp/ply-YYYY-MM.zst [...]
"""
import hashlib,sys,json,re,zstandard
from pathlib import Path
from collections import defaultdict
dest=Path(__file__).parent
def digest(s):return hashlib.sha256(s.encode()).hexdigest()
groups=defaultdict(list);sources=[];seen=set()
for fname in sorted(sys.argv[1:]):
 p=Path(fname);month=re.search(r'(\d{4}-\d{2})',p.name)[1];blob=p.read_bytes()
 with zstandard.ZstdDecompressor().stream_reader(blob,read_across_frames=True) as r: data=r.read().decode('utf8','replace')
 src={'url':f'https://database.lichess.org/standard/lichess_db_standard_rated_{month}.pgn.zst','range':[0,len(blob)-1],'sha256':hashlib.sha256(blob).hexdigest(),'complete':0,'eligible':0};sources.append(src)
 for record in data.split('[Event ')[1:-1]:
  record='[Event '+record;h=dict(re.findall(r'^\[(\w+) "([^"\n]*)"\]',record,re.M));moves=re.sub(r'\{[^}]*\}','',record.split('\n\n',1)[-1]).strip()
  if not moves.endswith(('1-0','0-1','1/2-1/2')):continue
  src['complete']+=1
  if not re.fullmatch(r'Rated (Bullet|Blitz|Rapid|Classical) game',h.get('Event','')) or not re.fullmatch(r'\d+\+\d+',h.get('TimeControl','')) or h.get('Termination') not in ('Normal','Time forfeit'):continue
  if any(h.get(k+'Title')=='BOT' or not h.get(k+'Elo','').isdigit() or h.get(k+'RatingDiff') is None for k in ('White','Black')):continue
  players=[digest(h[k].casefold()) for k in ('White','Black')];ratings=[int(h[k+'Elo']) for k in ('White','Black')];key=h['Site'].split('/')[-1];pace=h['Event'].split()[1]
  if key in seen or len(set(players))<2 or min(ratings)<400 or max(ratings)>4000:continue
  seen.add(key);src['eligible']+=1
  band=sum(ratings)//2//400*400
  groups[month,pace,band].append({'id':key,'date':h['UTCDate'],'players':players,'ratings':ratings,'timeControl':h['TimeControl'],'pace':pace,'moves':' '.join(moves.split())})
games=[g for k,items in sorted(groups.items()) for g in sorted(items,key=lambda g:digest('plystreak-pilot-v1'+g['id']))[:2]]
(dest/'pilot.json').write_text(json.dumps({'version':1,'license':'CC0','sources':sources,'games':games},separators=(',',':')))
print('complete',sum(x['complete'] for x in sources),'eligible',sum(x['eligible'] for x in sources),'strata',len(groups),'selected',len(games))
