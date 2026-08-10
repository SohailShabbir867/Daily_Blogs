// generate-sitemap.mjs
// Generates a static sitemap.xml at build time by fetching live blog data from the backend.
// This file is written to public/sitemap.xml, which Vercel serves from its CDN.
// CDN delivery = instant response for Google → no more cold-start timeouts.
//
// Run automatically on every deployment: `node generate-sitemap.mjs --force`
// Fallback: if backend is unreachable, only static pages are included.
// Manual run: node generate-sitemap.mjs --force

import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FORCE = process.argv.includes("--force");

const SITE_URL = "https://blog.deveolpersohail.online";
const RAW_API_URL = process.env.VITE_API_URL || "";
const API_BASE = RAW_API_URL
  ? RAW_API_URL.replace(/\/api\/?$/, "")
  : "https://daily-blogs-backend-gnfdatd8eud6g2gd.eastasia-01.azurewebsites.net";

const staticPages = [
  { loc: "/",        changefreq: "daily",   priority: "1.0" },
  { loc: "/about",   changefreq: "monthly", priority: "0.8" },
  { loc: "/contact", changefreq: "monthly", priority: "0.7" },
  { loc: "/privacy", changefreq: "yearly",  priority: "0.3" },
  { loc: "/terms",   changefreq: "yearly",  priority: "0.3" },
];

async function fetchBlogs() {
  const pageSize = 100;
  let page = 1;
  let totalPages = 1;
  const allBlogs = [];
  try {
    while (page <= totalPages) {
      const url = `${API_BASE}/api/blogs?limit=${pageSize}&page=${page}&sortBy=publishedAt&sortOrder=desc&status=published`;
      console.log(`   → Fetching page ${page}: ${url}`);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 90000); // 90s — Azure cold start can be slow
      let res;
      try {
        res = await fetch(url, { signal: controller.signal });
      } finally {
        clearTimeout(timeout);
      }
      if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
      const data = await res.json();
      const blogs      = data?.data?.blogs || data?.blogs || data?.data || [];
      const pagination = data?.data?.pagination || {};
      if (!Array.isArray(blogs) || blogs.length === 0) break;
      allBlogs.push(...blogs);
      totalPages = pagination.totalPages || (blogs.length === pageSize ? page + 1 : page);
      page += 1;
    }
    console.log(`✅ Fetched ${allBlogs.length} blog posts from API`);
    return allBlogs;
  } catch (err) {
    console.warn(`⚠️  Could not fetch blogs: ${err.message}`);
    return [];
  }
}

function escapeXml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

function buildXml(blogs) {
  const today = new Date().toISOString().split("T")[0];
  const staticUrls = staticPages.map((p) => `  <url>
    <loc>${SITE_URL}${p.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join("\n");

  const blogUrls = blogs.filter((b) => b.slug).map((b) => {
    const lastmod = b.updatedAt ? new Date(b.updatedAt).toISOString().split("T")[0] : today;
    let imageTag = "";
    if (b.image && b.image.startsWith("http")) {
      imageTag = `\n    <image:image>\n      <image:loc>${escapeXml(b.image)}</image:loc>\n      <image:title>${escapeXml(b.title)}</image:title>\n    </image:image>`;
    }
    return `  <url>\n    <loc>${SITE_URL}/blog/${escapeXml(b.slug)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>${imageTag}\n  </url>`;
  }).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${staticUrls}\n${blogUrls}\n</urlset>`;
}

async function main() {
  if (!FORCE) {
    console.log("ℹ️  Skipping static sitemap generation (no --force flag).");
    return;
  }
  console.log("🌐 SITE_URL:", SITE_URL);
  console.log("📡 API_BASE:", API_BASE);
  const blogs  = await fetchBlogs();
  const xml    = buildXml(blogs);
  const outPath = resolve(__dirname, "public", "sitemap.xml");
  writeFileSync(outPath, xml, "utf-8");
  console.log(`✅ sitemap.xml written → ${outPath} (${staticPages.length} static + ${blogs.filter(b=>b.slug).length} blogs)`);
}

main().catch((err) => {
  console.error("❌ Sitemap generation failed:", err);
  process.exit(0);
});
