import {createServer} from 'node:http';
import {readFile, stat} from 'node:fs/promises';
import {extname, join, normalize} from 'node:path';

const TYPES = {'.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.ico': 'image/x-icon'};

export function serve(dir, port) {
  const server = createServer(async (req, res) => {
    const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
    let file = join(dir, path);
    try { if ((await stat(file)).isDirectory()) file = join(file, 'index.html'); } catch {}
    try {
      const body = await readFile(file);
      res.writeHead(200, {'content-type': TYPES[extname(file)] ?? 'application/octet-stream'});
      res.end(body);
    } catch { res.writeHead(404); res.end('not found'); }
  });
  return new Promise(resolve => server.listen(port, '127.0.0.1', () =>
    resolve({url: `http://127.0.0.1:${port}`, close: () => server.close()})));
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const [dir = 'dist', port = '4173'] = process.argv.slice(2);
  serve(dir, Number(port)).then(s => console.log(`serving ${dir} at ${s.url}`));
}
