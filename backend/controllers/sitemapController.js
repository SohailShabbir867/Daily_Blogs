const Blog = require("../models/Blog");
const { asyncHandler } = require("../utils/helpers");

// @desc    Generate dynamic sitemap
// @route   GET /api/sitemap.xml
// @access  Public
const generateSitemap = asyncHandler(async (req, res) => {
  const frontendUrl = "https://dailyblogs.website";
  const today = new Date().toISOString().split('T')[0];
  
  // Get all published blogs
  const blogs = await Blog.find({ status: "published" })
    .select("slug updatedAt title image")
    .sort({ updatedAt: -1 })
    .lean();

  // Build XML parts
  const staticPages = [
    { loc: `${frontendUrl}/`, changefreq: 'daily', priority: '1.0', lastmod: today },
    { loc: `${frontendUrl}/about`, changefreq: 'monthly', priority: '0.8', lastmod: today },
    { loc: `${frontendUrl}/contact`, changefreq: 'monthly', priority: '0.7', lastmod: today },
    { loc: `${frontendUrl}/privacy`, changefreq: 'yearly', priority: '0.3', lastmod: today },
    { loc: `${frontendUrl}/terms`, changefreq: 'yearly', priority: '0.3', lastmod: today },
  ];

  const staticXml = staticPages.map(page => `  <url>
    <loc>${page.loc}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n');

  const blogXml = blogs.map((blog) => {
    const date = new Date(blog.updatedAt).toISOString().split('T')[0];
    let imageTag = "";
    
    if (blog.image && typeof blog.image === 'string' && blog.image.startsWith('http')) {
      const safeUrl = blog.image.replace(/&/g, '&amp;');
      const safeTitle = (blog.title || "Blog Image")
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
      
      imageTag = `
    <image:image>
      <image:loc>${safeUrl}</image:loc>
      <image:title>${safeTitle}</image:title>
    </image:image>`;
    }

    return `  <url>
    <loc>${frontendUrl}/blog/${blog.slug}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>${imageTag}
  </url>`;
  }).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${staticXml}
${blogXml}
</urlset>`;

  res.header("Content-Type", "application/xml; charset=utf-8");
  res.header("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
  res.send(xml);
});

module.exports = { generateSitemap };
