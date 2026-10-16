import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createApi} from './api.mjs';
import {loadCatalogue} from '../scripts/catalogue.mjs';
const root=fileURLToPath(new URL('../public/',import.meta.url));
const api=createApi(await loadCatalogue());
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.jpg':'image/jpeg'};
const server=createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost:'+Number(process.env.PORT||4173));
  const request=new Request(url,{method:req.method,headers:req.headers});
  const response=await api(request,process.env);
  if(response){res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));return;}
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
  const file=resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
  if(!file.startsWith(root)){res.writeHead(403);res.end();return;}
  const bytes=await readFile(file);res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:bytes);
 }catch{res.writeHead(404);res.end('Not found');}
});
server.listen(Number(process.env.PORT||4173),'0.0.0.0',()=>console.log('Wigan Connect: http://localhost:'+Number(process.env.PORT||4173)));
