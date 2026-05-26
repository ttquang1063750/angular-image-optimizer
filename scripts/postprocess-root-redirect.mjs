#!/usr/bin/env node
/**
 * Inject `<meta name="robots" content="noindex,nofollow">` vào root `/index.html`
 * (file redirect stub do Angular SSR sinh ra). Mục đích: tránh GSC report
 * "Page with redirect" cho `/` vì đó là intentional redirect tới /{lang}/.
 *
 * Chạy sau `ng build`:
 *   node scripts/postprocess-root-redirect.mjs
 */
import { readFile, writeFile, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const TARGETS = [
  'dist/angular-image-optimizer/browser/index.html',
  'dist/angular-image-optimizer/browser/optimize/index.html'
];
const NOINDEX_TAG = '<meta name="robots" content="noindex,nofollow">';

async function processFile(filePath) {
  if (!existsSync(filePath)) {
    return;
  }

  const html = await readFile(filePath, 'utf8');

  if (html.includes('name="robots"')) {
    console.log(`✓ ${filePath} đã có robots meta — skip.`);
    return;
  }

  // Chèn ngay sau <meta charset>, đảm bảo nằm trong <head>
  const updated = html.replace(
    /(<meta charset="utf-8">)/i,
    `$1\n    ${NOINDEX_TAG}`,
  );

  if (updated === html) {
    console.error(`✕ Không tìm thấy <meta charset> trong ${filePath}`);
    process.exit(1);
  }

  await writeFile(filePath, updated, 'utf8');
  console.log(`✓ Injected noindex meta vào ${filePath}`);
}

async function getAllHtmlFiles(dir) {
  const files = await readdir(dir);
  const htmlFiles = [];
  for (const file of files) {
    const fullPath = join(dir, file);
    const s = await stat(fullPath);
    if (s.isDirectory()) {
      htmlFiles.push(...(await getAllHtmlFiles(fullPath)));
    } else if (file.endsWith('.html')) {
      htmlFiles.push(fullPath);
    }
  }
  return htmlFiles;
}

async function makePathsAbsolute(filePath) {
  let html = await readFile(filePath, 'utf8');

  // Sửa các đường dẫn relative thành absolute
  // 1. Sửa chunk JS preloads: href="chunk-... -> href="/chunk-...
  html = html.replace(/(href=")(chunk-[a-zA-Z0-9_-]+\.js")/g, '$1/$2');
  
  // 2. Sửa main script: src="main-... -> src="/main-...
  html = html.replace(/(src=")(main-[a-zA-Z0-9_-]+\.js")/g, '$1/$2');
  
  // 3. Sửa styles CSS: href="styles-... -> href="/styles-...
  html = html.replace(/(href=")(styles-[a-zA-Z0-9_-]+\.css")/g, '$1/$2');
  
  // 4. Sửa favicon và manifest:
  html = html.replace(/(href=")(favicon\.(ico|svg)")/g, '$1/$2');
  html = html.replace(/(href=")(manifest\.webmanifest")/g, '$1/$2');

  await writeFile(filePath, html, 'utf8');
}

async function main() {
  for (const target of TARGETS) {
    await processFile(target);
  }

  // Tạo file 404.html từ index.csr.html làm SPA Fallback cho Cloudflare Pages
  const csrPath = 'dist/angular-image-optimizer/browser/index.csr.html';
  const error404Path = 'dist/angular-image-optimizer/browser/404.html';
  if (existsSync(csrPath)) {
    const csrHtml = await readFile(csrPath, 'utf8');
    await writeFile(error404Path, csrHtml, 'utf8');
    console.log(`✓ Đã tạo file 404.html từ index.csr.html thành công.`);
  } else {
    console.warn(`⚠️ Cảnh báo: Không tìm thấy ${csrPath} để tạo 404.html.`);
  }

  // Biến toàn bộ các đường dẫn assets trong các file HTML thành absolute paths bắt đầu bằng /
  const distDir = 'dist/angular-image-optimizer/browser';
  if (existsSync(distDir)) {
    const htmlFiles = await getAllHtmlFiles(distDir);
    for (const file of htmlFiles) {
      await makePathsAbsolute(file);
    }
    console.log(`✓ Đã cập nhật đường dẫn tuyệt đối (absolute paths) cho ${htmlFiles.length} file HTML.`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
