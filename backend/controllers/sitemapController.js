// sitemapController.js
// @desc    Generate a live XML sitemap from all published blog posts in MongoDB
// @route   GET /api/sitemap.xml
// @access  Public
// NOTE: This endpoint is proxied by Vercel → blog.developersohail.online/sitemap.xml

const Blog = require("../models/Blog");
const { asyncHandler } = require("../utils/helpers");

const SITE_URL = process.env.SITE_URL || "https://blog.developersohail.online";

const staticPages = [
  { loc: `${SITE_URL}/`,        changefreq: "daily",   priority: "1.0" },
  { loc: `${SITE_URL}/about`,   changefreq: "monthly", priority: "0.8" },
  { loc: `${SITE_URL}/contact`, changefreq: "monthly", priority: "0.7" },
  { loc: `${SITE_URL}/privacy`, changefreq: "yearly",  priority: "0.3" },
  { loc: `${SITE_URL}/terms`,   changefreq: "yearly",  priority: "0.3" },
];

function escapeXml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// @desc    Generate dynamic sitemap
// @route   GET /api/sitemap.xml
// @access  Public
const generateSitemap = asyncHandler(async (req, res) => {
  const today = new Date().toISOString().split("T")[0];

  // Fetch all published blogs — only the fields we need (fast, lean query)
  const blogs = await Blog.find({ status: "published" })
    .select("slug updatedAt publishedAt title image")
    .sort({ updatedAt: -1 })
    .lean();

  // Static pages XML
  const staticXml = staticPages
    .map(
      (page) => `  <url>
    <loc>${page.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
    )
    .join("\n");

  // Blog posts XML
  const blogXml = blogs
    .filter((blog) => blog.slug && typeof blog.slug === "string")
    .map((blog) => {
      const lastmod = blog.updatedAt
        ? new Date(blog.updatedAt).toISOString().split("T")[0]
        : blog.publishedAt
        ? new Date(blog.publishedAt).toISOString().split("T")[0]
        : today;

      let imageTag = "";
      if (
        blog.image &&
        typeof blog.image === "string" &&
        blog.image.startsWith("http")
      ) {
        const safeUrl   = escapeXml(blog.image);
        const safeTitle = escapeXml(blog.title || "Blog Image");
        imageTag = `
    <image:image>
      <image:loc>${safeUrl}</image:loc>
      <image:title>${safeTitle}</image:title>
    </image:image>`;
      }

      return `  <url>
    <loc>${SITE_URL}/blog/${escapeXml(blog.slug)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>${imageTag}
  </url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Daily Blogs Sitemap — Generated ${today} — ${blogs.length} blog posts + ${staticPages.length} static pages -->
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${staticXml}
${blogXml}
</urlset>`;

  // Allow Vercel and Google to cache for 1 hour, serve stale for 24h
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
  // Allow cross-origin access (Vercel proxy needs this)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.status(200).send(xml);
});

module.exports = { generateSitemap };
