import {defineConfig} from 'vite';
import fs from 'node:fs/promises';
import path from 'node:path';
import {loadAuthoringData} from './src/data-loader.js';

const root=path.resolve('public/assets/data');
const load=()=>loadAuthoringData(async file=>JSON.parse(await fs.readFile(path.join(root,file),'utf8')));
export default defineConfig({plugins:[{
  name:'modular-store-data',
  configureServer(server){
    server.middlewares.use('/assets/data/runtime.json',async(req,res)=>{try{const data=await load();res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');res.end(JSON.stringify(data))}catch(error){res.statusCode=500;res.end(JSON.stringify({error:error.message}))}});
    server.watcher.on('change',file=>{if(file.startsWith(root)&&file.endsWith('.json'))server.ws.send({type:'full-reload'})});
  },
  async generateBundle(){this.emitFile({type:'asset',fileName:'assets/data/runtime.json',source:JSON.stringify(await load())})}
}]});
