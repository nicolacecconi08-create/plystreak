from pathlib import Path
import json
rows=[];seen=set()
for p in sorted(Path('dist/locales').glob('*.tsv')):
 for i,line in enumerate(p.read_text(encoding='utf-8').splitlines(),1):
  if not line.strip():continue
  row=line.split('|')
  assert len(row)==5,(p,i,len(row))
  assert row[0] not in seen,(p,i,'duplicate',row[0])
  seen.add(row[0]);rows.append(row)
Path('dist/locales/catalog.js').write_text('export const catalog='+json.dumps(rows,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
print(len(rows),'translation entries across five languages')
