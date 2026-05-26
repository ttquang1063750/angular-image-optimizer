#!/usr/bin/env node
/**
 * Quét tất cả index.html trong dist/.../browser/ và assert mỗi page có đầy đủ
 * SEO meta + JSON-LD parse được. Chạy sau `npm run build`:
 *
 *   node scripts/verify-seo.mjs
 *
 * Exit code 0 = pass, 1 = fail (CI-friendly).
 */
import { readFile } from 'node:fs/promises';
import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST_DIR = 'dist/angular-image-optimizer/browser';

// Pages dưới đây là prerendered SEO targets. Root index.html và các trang redirect
// stubs như optimize/index.html chỉ là redirect stubs nên skip — chúng không cần meta đầy đủ.
const SKIP = new Set(['index.html', 'optimize/index.html']);

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const stat = statSync(full);
    if (stat.isDirectory()) out.push(...walk(full));
    else if (name === 'index.html') out.push(full);
  }
  return out;
}

function findAll(html, regex) {
  return [...html.matchAll(regex)];
}

function findOne(html, regex) {
  const m = html.match(regex);
  return m ? m[0] : null;
}

async function check(file) {
  const html = await readFile(file, 'utf8');
  const errors = [];

  const rel = relative(DIST_DIR, file);

  // <html lang="...">
  if (!/<html[^>]*\blang="(vi|en)"/i.test(html)) {
    errors.push('missing <html lang="vi|en">');
  }

  // <title>
  const title = findOne(html, /<title>([^<]+)<\/title>/);
  if (!title) errors.push('missing <title>');
  else if (/^<title>(ImageOptimizer|Image Optimizer)<\/title>$/.test(title)) {
    errors.push(`title looks like fallback (not set by SeoService): ${title}`);
  }

  // meta description
  if (!/<meta[^>]+name="description"[^>]+content="[^"]+"/i.test(html)) {
    errors.push('missing meta description');
  }

  // canonical
  if (!/<link[^>]+rel="canonical"[^>]+href="https:\/\/[^"]+"/i.test(html)) {
    errors.push('missing canonical link with absolute URL');
  }

  // hreflang × 3 (vi, en, x-default)
  const hreflangs = findAll(html, /<link[^>]+rel="alternate"[^>]+hreflang="([^"]+)"/g).map(
    (m) => m[1],
  );
  for (const lang of ['vi', 'en', 'x-default']) {
    if (!hreflangs.includes(lang)) errors.push(`missing hreflang="${lang}"`);
  }

  // robots
  if (!/<meta[^>]+name="robots"[^>]+content="(index|noindex)/i.test(html)) {
    errors.push('missing meta robots');
  }

  // og:title / og:description / og:url / og:image / og:type / og:locale
  for (const prop of ['og:title', 'og:description', 'og:url', 'og:image', 'og:type', 'og:locale']) {
    if (!new RegExp(`<meta[^>]+property="${prop}"[^>]+content="[^"]+"`, 'i').test(html)) {
      errors.push(`missing ${prop}`);
    }
  }

  // twitter card
  if (!/<meta[^>]+name="twitter:card"[^>]+content="summary/i.test(html)) {
    errors.push('missing twitter:card');
  }

  // JSON-LD: parse mọi <script type="application/ld+json"> phải valid JSON với @context schema.org
  const ldMatches = findAll(html, /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g);
  for (let i = 0; i < ldMatches.length; i++) {
    const raw = ldMatches[i][1];
    try {
      const data = JSON.parse(raw);
      const items = Array.isArray(data) ? data : [data];
      for (const it of items) {
        if (it['@context'] !== 'https://schema.org') {
          errors.push(`JSON-LD #${i + 1} missing @context schema.org`);
        }
        if (!it['@type']) {
          errors.push(`JSON-LD #${i + 1} missing @type`);
        }
      }
    } catch (e) {
      errors.push(`JSON-LD #${i + 1} parse error: ${e.message}`);
    }
  }

  return { rel, errors };
}

async function main() {
  const files = walk(DIST_DIR).filter((f) => !SKIP.has(relative(DIST_DIR, f)));
  if (files.length === 0) {
    console.error(`✕ No prerendered HTML found under ${DIST_DIR}/. Did you run \`npm run build\`?`);
    process.exit(1);
  }

  let failed = 0;
  for (const f of files) {
    const { rel, errors } = await check(f);
    if (errors.length === 0) {
      console.log(`✓ ${rel}`);
    } else {
      failed++;
      console.error(`✕ ${rel}`);
      for (const e of errors) console.error(`    - ${e}`);
    }
  }

  console.log('');
  if (failed > 0) {
    console.error(`${failed} of ${files.length} prerendered pages failed SEO checks.`);
    process.exit(1);
  } else {
    console.log(`All ${files.length} prerendered pages pass SEO checks.`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
