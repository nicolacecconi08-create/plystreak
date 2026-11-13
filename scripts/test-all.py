"""Run the unchanged Node test files. No application data is accessed."""
from pathlib import Path
import subprocess,sys
root=Path(__file__).resolve().parents[1]
failed=[]
for p in sorted(root.glob('test*.mjs')):
    print('\n==',p.name,flush=True)
    try:
        if subprocess.run(['node',p.name],cwd=root,timeout=180).returncode: failed.append(p.name)
    except subprocess.TimeoutExpired: failed.append(p.name+' (timeout)')
print('FAILED:',failed)
sys.exit(bool(failed))
