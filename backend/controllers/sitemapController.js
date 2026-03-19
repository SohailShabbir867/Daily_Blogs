const Blog = require("../models/Blog");
const { asyncHandler } = require("../utils/helpers");

// @desc    Generate dynamic sitemap
// @route   GET /api/sitemap.xml
// @access  Public
const generateSitemap = asyncHandler(async (req, res) => {
  const frontendUrl = "https://dailyblogs.website";
  
  // Get all published blogs
  const blogs = await Blog.find({ status: "published" })
    .select("slug updatedAt title image")
    .sort({ updatedAt: -1 })
    .lean();

  // Create the XML string
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
  <!-- Static Pages -->
  <url>
    <loc>${frontendUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${frontendUrl}/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${frontendUrl}/contact</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${frontendUrl}/privacy</loc>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>${frontendUrl}/terms</loc>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>

  <!-- Dynamic Blog Posts -->
${blogs.map((blog) => {
    const date = new Date(blog.updatedAt).toISOString().split('T')[0];
    let imageTag = "";
    
    // Add image if available (some blogs might not have images or have basic placeholder paths)
    if (blog.image && typeof blog.image === 'string' && blog.image.startsWith('http')) {
        // Escaping ampersands is required for XML compliance
        const safeUrl = blog.image.replace(/&/g, '&amp;');
        const safeTitle = (blog.title || "Blog Image").replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        
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
  }).join("\n")}
</urlset>`;

  res.header("Content-Type", "application/xml");
  res.send(xml);
});

module.exports = { generateSitemap };
