// Vercel Edge Middleware — serves fully server-rendered HTML to search engines
// and AI crawlers for blog post routes.
//
// WHY THIS EXISTS:
// The React app is a pure client-side rendered SPA (Vite + BrowserRouter).
// Real users get the full interactive app. But Googlebot's JS rendering is
// delayed/unreliable, and most other crawlers — Bingbot, GPTBot, ClaudeBot,
// PerplexityBot, and social-share bots like facebookexternalhit/WhatsApp —
// do NOT execute JavaScript at all. They only ever see the empty
// <div id="root"></div> shell from index.html.
//
// This middleware detects those bots by User-Agent and, for /blog/:slug
// routes only, returns a plain HTML document containing the real title,
// meta description, canonical URL, Open Graph tags, JSON-LD structured
// data, and the full sanitized article content as real text/HTML — no
// JavaScript execution required to read it.
//
// This is a stopgap ("dynamic rendering"), not a replacement for a proper
// SSR/SSG migration (e.g. Next.js) — see the SEO audit doc for the full
// reasoning. It is, however, a same-day fix for crawler invisibility.
//
// Docs: https://vercel.com/docs/functions/edge-middleware

export const config = {
  matcher: ["/blog/:path*"],
};

const API_BASE =
  (typeof process !== "undefined" && process.env && process.env.VITE_API_URL
    ? process.env.VITE_API_URL.replace(/\/api\/?$/, "")
    : "") ||
  "https://daily-blogs-backend-gnfdatd8eud6g2gd.eastasia-01.azurewebsites.net";

const SITE_URL = "https://dailyblogs.website";

// Crawlers/bots that do NOT reliably execute JavaScript. Anything matching
// this gets served the prerendered HTML below instead of the SPA shell.
// Keep this list updated — new AI crawlers show up often.
const BOT_UA_PATTERN =
  /googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|sogou|exabot|facebot|facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegrambot|discordbot|slackbot|pinterest|redditbot|applebot|ia_archiver|gptbot|oai-searchbot|chatgpt-user|claudebot|claude-web|anthropic-ai|perplexitybot|ccbot|bytespider|semrushbot|ahrefsbot|mj12bot|embedly|quora link preview|showyoubot|outbrain|w3c_validator/i;

export default async function middleware(request) {
  const ua = request.headers.get("user-agent") || "";

  // Real users and unrecognized agents: let Vercel's normal rewrite serve
  // the SPA (index.html) exactly as it does today. Do nothing here.
  if (!BOT_UA_PATTERN.test(ua)) {
    return;
  }

  const url = new URL(request.url);
  const slug = decodeURIComponent(
    url.pathname.replace(/^\/blog\//, "").replace(/\/$/, "")
  );

  if (!slug) {
    return;
  }

  try {
    const apiRes = await fetch(
      `${API_BASE}/api/blogs/${encodeURIComponent(slug)}`,
      { headers: { Accept: "application/json" } }
    );

    // Blog genuinely doesn't exist — tell crawlers with a real 404,
    // not a 200 "soft 404" wrapped in the SPA shell.
    if (apiRes.status === 404) {
      return new Response(renderNotFoundHtml(slug), {
        status: 404,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    // Members-only post the crawler hit while logged out — the API
    // returns 401 with a preview payload. Serve a thin, honest preview
    // page instead of the full content or an empty shell.
    if (apiRes.status === 401) {
      const previewJson = await apiRes.json().catch(() => null);
      const previewBlog = previewJson?.data?.blog;
      if (previewBlog) {
        return new Response(renderPreviewHtml(previewBlog), {
          status: 200,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        });
      }
      return; // fall through to SPA if the shape is unexpected
    }

    if (!apiRes.ok) {
      // Backend hiccup — never show crawlers an error page for a transient
      // issue. Fall through to the normal SPA rewrite.
      return;
    }

    const json = await apiRes.json();
    const blog = json?.data?.blog;

    if (!blog || !blog.title) {
      return;
    }

    const html = renderBlogHtml(blog);
    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        // Short edge cache so a fresh publish/edit shows up quickly,
        // matches the caching approach already used on /api/sitemap.xml.
        "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
      },
    });
  } catch (err) {
    // Never break the page for a crawler because of an upstream network
    // error — fall through to the SPA rather than returning a 500.
    return;
  }
}

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function toIso(dateLike) {
  if (!dateLike) return null;
  const d = new Date(dateLike);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function renderBlogHtml(blog) {
  const title = `${escapeHtml(blog.title)} | Daily Blogs`;
  const description = escapeHtml((blog.description || "").slice(0, 160));
  const canonical = `${SITE_URL}/blog/${blog.slug}`;
  const image =
    blog.image && /^https?:\/\//i.test(blog.image)
      ? blog.image
      : `${SITE_URL}/og-image.png`;
  const author = blog.author?.name || blog.authorName || "Daily Blogs Team";
  const publishedIso = toIso(blog.publishedAt || blog.createdAt);
  const modifiedIso = toIso(blog.updatedAt) || publishedIso;
  const tags = Array.isArray(blog.tags) ? blog.tags : [];

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
    headline: blog.title,
    description: blog.description,
    image: { "@type": "ImageObject", url: image, width: 1200, height: 630 },
    ...(publishedIso ? { datePublished: publishedIso } : {}),
    ...(modifiedIso ? { dateModified: modifiedIso } : {}),
    author: { "@type": "Person", name: author },
    publisher: {
      "@type": "Organization",
      name: "Daily Blogs",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.png`,
        width: 512,
        height: 512,
      },
    },
    ...(blog.category ? { articleSection: blog.category } : {}),
    ...(tags.length ? { keywords: tags.join(", ") } : {}),
    inLanguage: "en",
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      ...(blog.category
        ? [
            {
              "@type": "ListItem",
              position: 2,
              name: blog.category,
              item: `${SITE_URL}/?category=${encodeURIComponent(blog.category)}`,
            },
          ]
        : []),
      {
        "@type": "ListItem",
        position: blog.category ? 3 : 2,
        name: blog.title,
        item: canonical,
      },
    ],
  };

  const metaTags = `<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title}</title>
<meta name="description" content="${description}" />
${tags.length ? `<meta name="keywords" content="${escapeHtml(tags.join(", "))}" />\n` : ""}<meta name="author" content="${escapeHtml(author)}" />
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
<link rel="canonical" href="${canonical}" />
<meta property="og:type" content="article" />
<meta property="og:title" content="${escapeHtml(blog.title)}" />
<meta property="og:description" content="${description}" />
<meta property="og:image" content="${escapeHtml(image)}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:url" content="${canonical}" />
<meta property="og:site_name" content="Daily Blogs" />
${publishedIso ? `<meta property="article:published_time" content="${publishedIso}" />\n` : ""}${modifiedIso ? `<meta property="article:modified_time" content="${modifiedIso}" />\n` : ""}<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escapeHtml(blog.title)}" />
<meta name="twitter:description" content="${description}" />
<meta name="twitter:image" content="${escapeHtml(image)}" />
<script type="application/ld+json">${JSON.stringify(articleSchema)}</script>
<script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>`;

  return `<!doctype html>
<html lang="en">
<head>
${metaTags}
</head>
<body>
<article>
<h1>${escapeHtml(blog.title)}</h1>
<p><em>By ${escapeHtml(author)}${blog.category ? ` &middot; ${escapeHtml(blog.category)}` : ""}${publishedIso ? ` &middot; ${new Date(publishedIso).toDateString()}` : ""}</em></p>
<p>${description}</p>
${blog.content || ""}
${tags.length ? `<p>Tags: ${tags.map(escapeHtml).join(", ")}</p>` : ""}
</article>
<p><a href="${SITE_URL}/">Back to Daily Blogs</a></p>
</body>
</html>`;
}

function renderPreviewHtml(blog) {
  const canonical = `${SITE_URL}/blog/${blog.slug}`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>${escapeHtml(blog.title)} | Daily Blogs</title>
<meta name="description" content="${escapeHtml(blog.description || "")}" />
<link rel="canonical" href="${canonical}" />
<meta name="robots" content="index, follow" />
</head>
<body>
<h1>${escapeHtml(blog.title)}</h1>
<p>${escapeHtml(blog.description || "")}</p>
<p>This article is exclusive to registered Daily Blogs members.</p>
<p><a href="${SITE_URL}/register">Register for free</a> or <a href="${SITE_URL}/login">log in</a> to read the full article.</p>
</body>
</html>`;
}

function renderNotFoundHtml(slug) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Article Not Found | Daily Blogs</title>
<meta name="robots" content="noindex, follow" />
</head>
<body>
<h1>Article Not Found</h1>
<p>The article "${escapeHtml(slug)}" doesn't exist or may have been removed.</p>
<p><a href="${SITE_URL}/">Back to Daily Blogs</a></p>
</body>
</html>`;
}
