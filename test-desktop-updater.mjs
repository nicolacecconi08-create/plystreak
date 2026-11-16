// Included by scripts/test-all.py alongside the web runtime regression tests.
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const test=fileURLToPath(new URL('./native/windows/test-updater.cjs',import.meta.url));
const result=spawnSync(process.execPath,[test],{stdio:'inherit'});
if(result.error)throw result.error;
process.exitCode=result.status??1;
