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

const ROOT_HTML = 'dist/angular-image-optimizer/browser/index.html';
const NOINDEX_TAG = '<meta name="robots" content="noindex,nofollow">';

async function main() {
  if (!existsSync(ROOT_HTML)) {
    console.error(`✕ ${ROOT_HTML} not found. Run \`ng build\` first.`);
    process.exit(1);
  }

  const html = await readFile(ROOT_HTML, 'utf8');

  if (html.includes('name="robots"')) {
    console.log(`✓ ${ROOT_HTML} đã có robots meta — skip.`);
    return;
  }

  // Chèn ngay sau <meta charset>, đảm bảo nằm trong <head>
  const updated = html.replace(
    /(<meta charset="utf-8">)/i,
    `$1\n    ${NOINDEX_TAG}`,
  );

  if (updated === html) {
    console.error(`✕ Không tìm thấy <meta charset> trong ${ROOT_HTML}`);
    process.exit(1);
  }

  await writeFile(ROOT_HTML, updated, 'utf8');
  console.log(`✓ Injected noindex meta vào ${ROOT_HTML}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
