const fs = require('node:fs');
const path = require('node:path');

const distDir = path.resolve(__dirname, '../dist');
const indexPath = path.join(distDir, 'index.html');
const notFoundPath = path.join(distDir, '404.html');

if (!fs.existsSync(indexPath)) {
  console.error('index.html was not found in dist/.');
  process.exit(1);
}

fs.copyFileSync(indexPath, notFoundPath);
console.log('Created dist/404.html for GitHub Pages SPA fallback.');
