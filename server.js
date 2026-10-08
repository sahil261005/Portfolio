const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.ogg': 'audio/ogg',
  '.mp3': 'audio/mpeg',
  '.pdf': 'application/pdf',
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Handle mock API
  if (pathname === '/api/views') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ views: 1337 }));
    return;
  }

  // Trim trailing slash (except root)
  if (pathname.length > 1 && pathname.endsWith('/')) {
    pathname = pathname.slice(0, -1);
  }

  // Route clean URLs
  if (pathname === '/' || pathname === '') {
    pathname = '/index.html';
  } else if (!path.extname(pathname)) {
    const htmlCandidate = path.join(PUBLIC_DIR, pathname + '.html');
    const indexCandidate = path.join(PUBLIC_DIR, pathname, 'index.html');
    if (fs.existsSync(htmlCandidate)) {
      pathname = pathname + '.html';
    } else if (fs.existsSync(indexCandidate)) {
      pathname = path.join(pathname, 'index.html');
    }
  }

  const filePath = path.join(PUBLIC_DIR, pathname);

  // Security check: ensure path is within PUBLIC_DIR
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // 404 fallback
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="utf-8" />
            <title>404 - Page Not Found</title>
            <style>
              body { background: #f5f3eb; color: #2c3e35; font-family: serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
              h1 { font-size: 5rem; margin: 0; color: #4a5d23; }
              p { font-size: 1.5rem; }
              a { color: #4a5d23; text-decoration: none; border: 2px solid #4a5d23; padding: 10px 20px; border-radius: 999px; }
              a:hover { background: #4a5d23; color: #f5f3eb; }
            </style>
          </head>
          <body>
            <h1>404</h1>
            <p>Looks like you've wandered a bit too far from the camp.</p>
            <a href="/">← Back to Camp</a>
          </body>
        </html>
      `);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Cache-Control': ext === '.html' || ext === '.svg' ? 'no-cache' : 'public, max-age=3600',
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
