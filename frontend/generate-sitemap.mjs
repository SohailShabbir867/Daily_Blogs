// generate-sitemap.mjs
// Runs BEFORE `vite build` on Vercel to generate a static sitemap.xml in /public.
// This static file acts as a FALLBACK — the live sitemap is served dynamically
// from the backend at /api/sitemap.xml and proxied via vercel.json.
// Fetches all published blog slugs from the backend API.
// Falls back to a static-only sitemap if the API is unreachable.

import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const SITE_URL = "https://dailyblogs.website";

// VITE_API_URL on Vercel is set to https://...azure.net/api
// Strip /api to get the base host URL for the sitemap fetch
const RAW_API_URL = process.env.VITE_API_URL || "";
const API_BASE = RAW_API_URL
  ? RAW_API_URL.replace(/\/api\/?$/, "")
  : "https://daily-blogs-backend-gnfdatd8eud6g2gd.eastasia-01.azurewebsites.net";

console.log(`🌐 SITE_URL:  ${SITE_URL}`);
console.log(`📡 API_BASE:  ${API_BASE}`);

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
      const timeout = setTimeout(() => controller.abort(), 20000); // 20s timeout

      let res;
      try {
        res = await fetch(url, { signal: controller.signal });
      } finally {
        clearTimeout(timeout);
      }

      if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);

      const data = await res.json();
      const blogs     = data?.data?.blogs || data?.blogs || data?.data || [];
      const pagination = data?.data?.pagination || {};

      if (!Array.isArray(blogs) || blogs.length === 0) break;

      allBlogs.push(...blogs);

      const serverTotalPages = pagination.totalPages;
      if (serverTotalPages) {
        totalPages = serverTotalPages;
      } else {
        // Infer: if we got a full page, there might be more
        totalPages = blogs.length === pageSize ? page + 1 : page;
      }
      page += 1;
    }

    console.log(`✅ Fetched ${allBlogs.length} blog posts from API`);
    return allBlogs;
  } catch (err) {
    console.warn(`⚠️  Could not fetch blogs from API: ${err.message}`);
    console.warn("    Sitemap will only include static pages.");
    return [];
  }
}

function escapeXml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildXml(blogs) {
  const today = new Date().toISOString().split("T")[0];

  const staticUrls = staticPages
    .map(
      (p) => `  <url>
    <loc>${SITE_URL}${p.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`,
    )
    .join("\n");

  const blogUrls = blogs
    .filter((b) => b.slug && typeof b.slug === "string")
    .map((b) => {
      const lastmod = b.updatedAt
        ? new Date(b.updatedAt).toISOString().split("T")[0]
        : today;

      let imageTag = "";
      if (b.image && typeof b.image === "string" && b.image.startsWith("http")) {
        const safeUrl   = escapeXml(b.image);
        const safeTitle = escapeXml(b.title || "Blog post");
        imageTag = `
    <image:image>
      <image:loc>${safeUrl}</image:loc>
      <image:title>${safeTitle}</image:title>
    </image:image>`;
      }

      return `  <url>
    <loc>${SITE_URL}/blog/${escapeXml(b.slug)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>${imageTag}
  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- Daily Blogs sitemap — Generated ${today} -->
<!-- Live dynamic version available at /sitemap.xml (proxied from backend) -->
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${staticUrls}
${blogUrls}
</urlset>`;
}

async function main() {
  const blogs  = await fetchBlogs();
  const xml    = buildXml(blogs);
  const outPath = resolve(__dirname, "public", "sitemap.xml");
  writeFileSync(outPath, xml, "utf-8");

  const totalUrls = staticPages.length + blogs.filter((b) => b.slug).length;
  console.log(`✅ sitemap.xml written → ${outPath}`);
  console.log(`   Static pages: ${staticPages.length}`);
  console.log(`   Blog posts:   ${blogs.filter((b) => b.slug).length}`);
  console.log(`   Total URLs:   ${totalUrls}`);
}

main().catch((err) => {
  console.error("❌ Sitemap generation failed:", err);
  process.exit(0); // Don't fail the build — sitemap is not critical
});
