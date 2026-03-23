// generate-sitemap.mjs
// This script runs BEFORE `vite build` on Vercel to generate a static sitemap.xml
// It fetches published blog posts from the backend API and writes sitemap.xml to /public
// This avoids relying on Render's free tier (which sleeps) at fetch-time by Google's crawler.

import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const SITE_URL = "https://dailyblogs.website";
// Use VITE_API_URL from Vercel env (production), fallback to Render URL directly
const API_BASE =
  process.env.VITE_API_URL?.replace("/api", "") ||
  "https://daily-blogs-api.onrender.com";

const staticPages = [
  { loc: "/", changefreq: "daily", priority: "1.0" },
  { loc: "/about", changefreq: "monthly", priority: "0.8" },
  { loc: "/contact", changefreq: "monthly", priority: "0.7" },
  { loc: "/privacy", changefreq: "yearly", priority: "0.3" },
  { loc: "/terms", changefreq: "yearly", priority: "0.3" },
];

async function fetchBlogs() {
  try {
    console.log(`📡 Fetching blogs from ${API_BASE}/api/blogs...`);
    const res = await fetch(
      `${API_BASE}/api/blogs?status=published&limit=500&page=1`
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const blogs = data?.data?.blogs || data?.blogs || data?.data || [];
    console.log(`✅ Fetched ${blogs.length} blog posts`);
    return blogs;
  } catch (err) {
    console.warn("⚠️  Could not fetch blogs:", err.message);
    console.warn("    Sitemap will only include static pages.");
    return [];
  }
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
  </url>`
    )
    .join("\n");

  const blogUrls = blogs
    .filter((b) => b.slug)
    .map((b) => {
      const lastmod = b.updatedAt
        ? new Date(b.updatedAt).toISOString().split("T")[0]
        : today;

      let imageTag = "";
      if (b.image && b.image.startsWith("http")) {
        const safeUrl = b.image.replace(/&/g, "&amp;");
        const safeTitle = (b.title || "Blog post")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
        imageTag = `
    <image:image>
      <image:loc>${safeUrl}</image:loc>
      <image:title>${safeTitle}</image:title>
    </image:image>`;
      }

      return `  <url>
    <loc>${SITE_URL}/blog/${b.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>${imageTag}
  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset 
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${staticUrls}
${blogUrls}
</urlset>`;
}

async function main() {
  const blogs = await fetchBlogs();
  const xml = buildXml(blogs);
  const outPath = resolve(__dirname, "public", "sitemap.xml");
  writeFileSync(outPath, xml, "utf-8");
  console.log(`✅ sitemap.xml written to ${outPath}`);
  console.log(`   Total URLs: ${staticPages.length + blogs.filter((b) => b.slug).length}`);
}

main().catch((err) => {
  console.error("❌ Sitemap generation failed:", err);
  // Don't exit with error — allow build to continue even without sitemap
  process.exit(0);
});
