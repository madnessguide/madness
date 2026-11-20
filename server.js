const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;
const ROOT_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  const urlPath = (req.url || '/').split('?')[0];
  let relativePath = urlPath === '/' ? 'info.html' : decodeURIComponent(urlPath.replace(/^\/+/, ''));

  const resolvedRoot = path.resolve(ROOT_DIR);
  const filePath = path.resolve(resolvedRoot, relativePath);

  // Захист від виходу за межі папки Site
  if (!filePath.startsWith(resolvedRoot + path.sep) && filePath !== resolvedRoot) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (statErr, stats) => {
    if (statErr || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: 'Not found' }));
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // Заборона кешування для актуального фонового оновлення JSON
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-store'
    });

    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Сервер запущено: http://127.0.0.1:${PORT}/info.html`);
});