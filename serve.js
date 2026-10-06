const http = require('http');
const fs = require('fs');
const path = require('path');
const mime = {'.html':'text/html','.js':'application/javascript','.css':'text/css','.wasm':'application/wasm','.data':'application/octet-stream','.svg':'image/svg+xml','.png':'image/png','.pdf':'application/pdf','.ico':'image/x-icon','.mp4':'video/mp4','.webm':'video/webm','.gif':'image/gif'};
http.createServer((req,res)=>{
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  const full = path.join(__dirname, p);
  fs.stat(full, (statErr, stat) => {
    if (statErr) { res.writeHead(404); res.end('not found: '+p); return; }
    const ext = path.extname(full);
    const contentType = mime[ext] || 'application/octet-stream';
    const range = req.headers.range;
    if (range) {
      const match = /bytes=(\d*)-(\d*)/.exec(range);
      const start = match[1] ? parseInt(match[1], 10) : 0;
      const end = match[2] ? parseInt(match[2], 10) : stat.size - 1;
      res.writeHead(206, {
        'Content-Type': contentType,
        'Content-Range': 'bytes ' + start + '-' + end + '/' + stat.size,
        'Accept-Ranges': 'bytes',
        'Content-Length': end - start + 1
      });
      fs.createReadStream(full, {start, end}).pipe(res);
      return;
    }
    res.writeHead(200, {'Content-Type': contentType, 'Accept-Ranges': 'bytes', 'Content-Length': stat.size});
    fs.createReadStream(full).pipe(res);
  });
}).listen(8080, () => console.log('listening on 8080'));
