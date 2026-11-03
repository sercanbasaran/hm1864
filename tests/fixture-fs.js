// Historical catalogue fixtures exercise generic UI behavior, not the production import.
// This JSON is test-only and is never imported by the app or Vite data plugin.
import fs from 'node:fs/promises';
import { gunzipSync } from 'node:zlib';
const fixtures = JSON.parse(gunzipSync(await fs.readFile(new URL('./fixtures/legacy-authoring.json.gz', import.meta.url))));
export default { ...fs, async readFile(path, ...args) {
  if (path === 'src/routes.json') return fs.readFile('tests/fixtures/legacy-routes.json', ...args);
  if (typeof path === 'string' && path.startsWith('public/assets/data/')) {
    const key = path.slice('public/assets/data/'.length);
    if (Object.hasOwn(fixtures, key)) { const value = JSON.stringify(fixtures[key]); return args[0] ? value : Buffer.from(value); }
  }
  return fs.readFile(path, ...args);
} };
