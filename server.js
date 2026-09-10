import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const mime = {
  '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8',
  '.json':'application/json; charset=utf-8', '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg', '.wav':'audio/wav'
};
const server = http.createServer((req,res)=>{
  try {
    const url = decodeURIComponent(req.url.split('?')[0]);
    let file = path.normalize(path.join(root, url === '/' ? 'index.html' : url));
    if (!file.startsWith(root)) throw new Error('forbidden');
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(root, 'index.html');
    const ext = path.extname(file).toLowerCase();
    res.writeHead(200, {'Content-Type': mime[ext] || 'application/octet-stream', 'Cache-Control':'no-cache'});
    fs.createReadStream(file).pipe(res);
  } catch (e) { res.writeHead(404); res.end('Not found'); }
});
server.listen(5173,'127.0.0.1',()=>console.log('BlockWorld Studio → http://127.0.0.1:5173'));
