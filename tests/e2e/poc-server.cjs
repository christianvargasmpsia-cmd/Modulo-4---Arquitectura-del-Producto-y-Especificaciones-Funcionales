// Servidor exclusivo del POC: no expone el resto del repositorio.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const page = fs.readFileSync(path.resolve(__dirname, '../../poc/umss_ecommerce.html'));
module.exports = async () => {
const server = http.createServer((req, res) => {
  if (req.url !== '/umss_ecommerce.html') {
    res.writeHead(404).end();
    return;
  }
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(page);
});
await new Promise((resolve, reject) => {
  server.once('error', reject);
  server.listen(4173, '127.0.0.1', resolve);
});
return async () => {
  server.closeAllConnections();
  await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
};
};
