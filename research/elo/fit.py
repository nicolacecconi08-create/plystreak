"""Chronological, player-disjoint pilot; never export unvalidated weights to dist."""
from pathlib import Path
import json,math,hashlib
import numpy as np
p=Path(__file__).parent;rows=json.loads((p/'features.json').read_text());keys=list(rows[0]['x'])
parts=[];used=set()
for year in ('2024','2025','2026'):
 a=[r for r in rows if r['date'].startswith(year) and used.isdisjoint(r['players'])];parts.append(a);used.update(k for r in a for k in r['players'])
train,cal,test=parts
assert all(parts)
def xy(a):return np.array([[r['x'][k] for k in keys] for r in a],float),np.array([r['target'] for r in a],float)
X,y=xy(train);mu=X.mean(axis=0);sd=X.std(axis=0);sd[sd==0]=1;Z=(X-mu)/sd;center=float(y.mean());alpha=10.;A=Z.T@Z+alpha*np.eye(Z.shape[1]);b=Z.T@(y-center);coef=np.zeros(len(keys));step=1/np.linalg.norm(A,2)
# Monotonic quality constraints prevent rewarding worse accuracy or more losses.
positive={'accuracy','bestShare','tacticalFound'};negative={'meanLoss','mistakeShare'}
for _ in range(10000):
 new=coef-step*(A@coef-b)
 for i,key in enumerate(keys):
  if key in positive:new[i]=max(0,new[i])
  if key in negative:new[i]=min(0,new[i])
 if np.max(abs(new-coef))<1e-9:break
 coef=new
assert all(coef[i]>=0 for i,k in enumerate(keys) if k in positive)
assert all(coef[i]<=0 for i,k in enumerate(keys) if k in negative)
def residuals(a):
 x,y=xy(a);return ((x-mu)/sd)@coef+center-y
err=residuals(test);calerr=residuals(cal)
# Game-sized blocks avoid counting both sides of one game as independent calibration draws.
blocks=sorted(max(abs(v) for v,r in zip(calerr,cal) if r['id']==g) for g in set(r['id'] for r in cal));k=math.ceil(.8*(len(blocks)+1));radius=float(blocks[k-1]) if k<=len(blocks) else None
def stats(mask):
 e=err[mask];return dict(n=len(e),mae=float(abs(e).mean()),bias=float(e.mean()))
out={'researchOnly':True,'version':2,'featureSHA256':hashlib.sha256((p/'features.json').read_bytes()).hexdigest(),'features':keys,'alpha':alpha,'weights':coef.tolist(),'mean':mu.tolist(),'scale':sd.tolist(),'intercept':center,'splitGames':[sorted(set(r['id'] for r in a)) for a in parts],'holdout':stats(np.ones(len(err),bool)),'baselineMAE':float(np.mean(abs(xy(test)[1]-np.median(y)))),'byPace':{v:stats(np.array([r['pace']==v for r in test])) for v in set(r['pace'] for r in test)},'byBand':{str(v):stats(np.array([r['target']//400==v for r in test])) for v in set(r['target']//400 for r in test)},'coverage80':float(np.mean(abs(err)<=radius)) if radius is not None else None,'testGames':len(set(r['id'] for r in test)),'calibrationGames':len(blocks),'interval80Radius':radius}
(p/'pilot-model.json').write_text(json.dumps(out,indent=2));print(out['holdout'],out['baselineMAE'],[len(a) for a in parts],radius)
