#!/usr/bin/env node
/**
 * Inject `<meta name="robots" content="noindex,nofollow">` vào root `/index.html`
 * (file redirect stub do Angular SSR sinh ra). Mục đích: tránh GSC report
 * "Page with redirect" cho `/` vì đó là intentional redirect tới /{lang}/.
 *
 * Chạy sau `ng build`:
 *   node scripts/postprocess-root-redirect.mjs
 */
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

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
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
