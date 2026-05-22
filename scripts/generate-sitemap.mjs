#!/usr/bin/env node
/**
 * Sinh sitemap.xml từ output prerender của Angular SSG.
 *
 * Quy ước:
 *  - Static pages (landing, about, changelog, blog): liệt kê cả 2 lang
 *    với cross-link hreflang vi/en/x-default.
 *  - Blog posts: pair theo `topicId` từ registry để link hreflang ngay
 *    cả khi slug khác nhau giữa các ngôn ngữ.
 *  - Root redirect stub (/) và 404 page (/**): không index.
 *
 * Chạy sau `ng build`:
 *   node scripts/generate-sitemap.mjs
 */
import { writeFile } from 'node:fs/promises';
import { existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const DIST_DIR = 'dist/angular-image-optimizer/browser';
const BASE_URL = 'https://image-optimizer.js-tools.org';
const LANGS = ['vi', 'en'];
const X_DEFAULT_LANG = 'vi';

// ---------- helpers ----------

/** Encode URL cho slug có ký tự đặc biệt (vd. tiếng Việt — hiện tại không có nhưng safe). */
function abs(lang, path) {
  const cleanPath = path.replace(/^\/+|\/+$/g, '');
  const suffix = cleanPath ? `/${cleanPath}` : '';
  return `${BASE_URL}/${lang}${suffix}`;
}

function fileLastMod(file) {
  try {
    const mtime = statSync(file).mtime;
    return mtime.toISOString().split('T')[0];
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

function escapeXml(s) {
  return s.replace(/[<>&'"]/g, (c) =>
    c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '&' ? '&amp;' : c === "'" ? '&apos;' : '&quot;',
  );
}

/**
 * Render <url> với hreflang alternates.
 * @param {{ locales: { lang: string, path: string }[], lastmod?: string }} entry
 */
function renderUrl(entry) {
  const xDefault =
    entry.locales.find((l) => l.lang === X_DEFAULT_LANG) ?? entry.locales[0];
  const lines = [];
  // 1 <url> mỗi locale, mỗi cái có toàn bộ alternates trỏ qua lại.
  for (const loc of entry.locales) {
    const url = abs(loc.lang, loc.path);
    lines.push('  <url>');
    lines.push(`    <loc>${escapeXml(url)}</loc>`);
    if (entry.lastmod) lines.push(`    <lastmod>${entry.lastmod}</lastmod>`);
    for (const alt of entry.locales) {
      lines.push(
        `    <xhtml:link rel="alternate" hreflang="${alt.lang}" href="${escapeXml(abs(alt.lang, alt.path))}"/>`,
      );
    }
    lines.push(
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(abs(xDefault.lang, xDefault.path))}"/>`,
    );
    lines.push('  </url>');
  }
  return lines.join('\n');
}

// ---------- load blog registry (TS via tsx-free workaround) ----------

/**
 * Đọc registry blog posts. Vì script là .mjs chạy Node thuần (không TS),
 * ta extract topicId + slug + lang + publishedAt từ source bằng regex.
 * Đơn giản hơn ts-node và đủ cho mục đích sitemap.
 */
import { readdirSync, readFileSync } from 'node:fs';

function loadBlogPosts() {
  const postsDir = 'src/app/pages/blog/posts';
  const files = readdirSync(postsDir).filter((f) => f.endsWith('.ts'));
  const posts = [];
  for (const file of files) {
    const src = readFileSync(join(postsDir, file), 'utf8');
    const topicId = src.match(/topicId:\s*'([^']+)'/)?.[1];
    const slug = src.match(/slug:\s*'([^']+)'/)?.[1];
    const lang = src.match(/lang:\s*'(vi|en)'/)?.[1];
    const publishedAt = src.match(/publishedAt:\s*'([^']+)'/)?.[1];
    const updatedAt = src.match(/updatedAt:\s*'([^']+)'/)?.[1];
    if (topicId && slug && lang && publishedAt) {
      posts.push({ topicId, slug, lang, publishedAt, updatedAt });
    }
  }
  return posts;
}

// ---------- build entries ----------

function buildEntries() {
  const entries = [];

  // Static pages — cùng path 2 langs
  const staticPages = ['', 'about', 'changelog', 'blog'];
  for (const path of staticPages) {
    const lastmod = fileLastMod(
      join(DIST_DIR, 'vi', path, 'index.html'),
    );
    entries.push({
      locales: LANGS.map((lang) => ({ lang, path })),
      lastmod,
    });
  }

  // Blog posts — pair theo topicId
  const posts = loadBlogPosts();
  const byTopic = new Map();
  for (const p of posts) {
    const list = byTopic.get(p.topicId) ?? [];
    list.push(p);
    byTopic.set(p.topicId, list);
  }
  for (const [, group] of byTopic) {
    const lastmod = group
      .map((p) => p.updatedAt ?? p.publishedAt)
      .sort()
      .reverse()[0];
    entries.push({
      locales: group.map((p) => ({ lang: p.lang, path: `blog/${p.slug}` })),
      lastmod,
    });
  }

  return entries;
}

// ---------- main ----------

async function main() {
  if (!existsSync(DIST_DIR)) {
    console.error(`✕ ${DIST_DIR} not found. Run \`npm run build\` first.`);
    process.exit(1);
  }

  const entries = buildEntries();
  const body = entries.map(renderUrl).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
    xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
    xmlns:xhtml="http://www.w3.org/1999/xhtml">
${body}
</urlset>
`;

  const outPath = join(DIST_DIR, 'sitemap.xml');
  await writeFile(outPath, xml, 'utf8');

  const urlCount = entries.reduce((n, e) => n + e.locales.length, 0);
  console.log(`✓ Wrote ${outPath}`);
  console.log(`  ${entries.length} entries → ${urlCount} URLs with hreflang alternates`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
