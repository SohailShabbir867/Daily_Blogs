// SEO Component - Manages meta tags, Open Graph, Twitter Cards, Structured Data, and Performance hints
import { Helmet } from "react-helmet-async";
import PropTypes from "prop-types";

const SEO = ({
  title,
  description,
  keywords,
  image,
  url,
  type = "website",
  author,
  publishedDate,
  modifiedDate,
  noindex = false,
  category,
  tags,
  readingTime,
  wordCount,
  section,
  locale = "en_US",
  breadcrumbs,
  faqItems,
  rawSchemas,
}) => {
  // Default values
  const siteTitle = "Daily Blogs";
  const defaultDescription =
    "Daily Blogs - Your all-in-one knowledge hub. Explore expert articles on technologies, coding tutorials, study materials, movie & game reviews, government schemes, job guides & resume tips, visa & immigration help, Linux tools, cybersecurity, and much more. Learn, share, and grow every day.";
  const defaultKeywords =
    "daily blogs, blog website, technologies, coding tutorials, study material, movie reviews, game guides, government schemes, job tips, resume writing, visa guide, immigration help, foreign study, Linux tools, cybersecurity, web development, programming, javascript, react, node.js, earning opportunities, mobile apps, data science, university admissions, gadgets, career advice, tech news, how to guides, educational articles";
  const defaultImage = `${window.location.origin}/og-image.png`;
  const baseUrl = window.location.origin;

  const toAbsoluteUrl = (value) => {
    if (!value || typeof value !== "string") return "";
    if (value.startsWith("data:")) return "";
    if (/^https?:\/\//i.test(value)) return value;
    try {
      return new URL(value, baseUrl).href;
    } catch {
      return "";
    }
  };

  const getCanonicalUrl = () => {
    try {
      const parsed = new URL(url || window.location.href);
      // Drop tracking params to reduce duplicate canonical URLs.
      ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "fbclid", "gclid"].forEach((key) => {
        parsed.searchParams.delete(key);
      });
      return parsed.toString();
    } catch {
      return window.location.href;
    }
  };

  // Use provided values or defaults
  const metaTitle = title
    ? `${title} | ${siteTitle}`
    : `${siteTitle} - Tech, Study, Movies, Games, Jobs, Visa & More`;
  const metaDescription = description || defaultDescription;
  const metaKeywords = keywords || defaultKeywords;
  const metaImage = toAbsoluteUrl(image) || defaultImage;
  const metaUrl = getCanonicalUrl();

  // Structured Data for WebSite with SearchAction (enables Google Sitelinks Search)
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteTitle,
    alternateName: "DailyBlogs",
    url: baseUrl,
    description: defaultDescription,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  // Structured Data for Organization
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteTitle,
    url: baseUrl,
    logo: {
      "@type": "ImageObject",
      url: `${baseUrl}/logo.png`,
      width: 512,
      height: 512,
    },
    description: defaultDescription,
    foundingDate: "2025",
    sameAs: [
      // Add your social media URLs here when available
      // 'https://twitter.com/dailyblogs',
      // 'https://facebook.com/dailyblogs',
      // 'https://linkedin.com/company/dailyblogs',
      // 'https://github.com/dailyblogs',
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      url: `${baseUrl}/contact`,
      availableLanguage: ["English"],
    },
  };

  // Structured Data for BlogPosting (richer than Article for blog posts)
  const articleSchema = publishedDate
    ? {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": metaUrl,
        },
        headline: title,
        description: metaDescription,
        image: {
          "@type": "ImageObject",
          url: metaImage,
          width: 1200,
          height: 630,
        },
        datePublished: publishedDate,
        dateModified: modifiedDate || publishedDate,
        author: {
          "@type": "Person",
          name: author || "Daily Blogs Team",
          url: baseUrl,
        },
        publisher: {
          "@type": "Organization",
          name: siteTitle,
          logo: {
            "@type": "ImageObject",
            url: `${baseUrl}/logo.png`,
            width: 512,
            height: 512,
          },
        },
        ...(category && { articleSection: category }),
        ...(tags && { keywords: Array.isArray(tags) ? tags.join(", ") : tags }),
        ...(wordCount && { wordCount }),
        ...(readingTime && { timeRequired: `PT${readingTime}M` }),
        inLanguage: "en",
        isAccessibleForFree: true,
      }
    : null;

  // Breadcrumb Schema (helps Google show breadcrumb trails in search results)
  const breadcrumbSchema = breadcrumbs
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: breadcrumbs.map((crumb, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: crumb.name,
          item: crumb.url ? `${baseUrl}${crumb.url}` : undefined,
        })),
      }
    : null;

  // FAQ Schema (enables FAQ rich snippets in Google search results)
  const faqSchema =
    faqItems && faqItems.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqItems.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.answer,
            },
          })),
        }
      : null;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{metaTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={metaKeywords} />
      {author && <meta name="author" content={author} />}

      {/* Robots - max-image-preview:large enables large image previews in Google Discover */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta
          name="robots"
          content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
        />
      )}

      {/* Canonical URL */}
      <link rel="canonical" href={metaUrl} />

      {/* Language & Locale */}
      <html lang="en" />
      <meta property="og:locale" content={locale} />

      {/* Open Graph / Facebook */}
      <meta
        property="og:type"
        content={type === "article" ? "article" : "website"}
      />
      <meta property="og:title" content={title || siteTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title || siteTitle} />
      <meta property="og:url" content={metaUrl} />
      <meta property="og:site_name" content={siteTitle} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title || siteTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />
      <meta name="twitter:image:alt" content={title || siteTitle} />
      {/* <meta name="twitter:site" content="@dailyblogs" /> */}
      {/* <meta name="twitter:creator" content="@dailyblogs" /> */}

      {/* Article specific meta tags */}
      {type === "article" && publishedDate && (
        <>
          <meta property="article:published_time" content={publishedDate} />
          {modifiedDate && (
            <meta property="article:modified_time" content={modifiedDate} />
          )}
          {author && <meta property="article:author" content={author} />}
          {section && <meta property="article:section" content={section} />}
          {tags &&
            (Array.isArray(tags) ? tags : tags.split(",")).map((tag, i) => (
              <meta key={i} property="article:tag" content={tag.trim()} />
            ))}
        </>
      )}

      {/* Performance: DNS Prefetch & Preconnect for external resources */}
      <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      <link rel="dns-prefetch" href="https://ui-avatars.com" />
      <link
        rel="preconnect"
        href="https://fonts.googleapis.com"
        crossOrigin="anonymous"
      />
      <link
        rel="preconnect"
        href="https://ui-avatars.com"
        crossOrigin="anonymous"
      />

      {/* Structured Data (JSON-LD) */}
      {type === "website" && (
        <script type="application/ld+json">
          {JSON.stringify(websiteSchema)}
        </script>
      )}

      {type === "website" && !publishedDate && (
        <script type="application/ld+json">
          {JSON.stringify(organizationSchema)}
        </script>
      )}

      {articleSchema && (
        <script type="application/ld+json">
          {JSON.stringify(articleSchema)}
        </script>
      )}

      {breadcrumbSchema && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      )}

      {faqSchema && (
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      )}

      {/* Extra JSON-LD extracted from the post body (e.g. FAQ/BlogPosting
          schema embedded by the MCP publishing pipeline) — rendered here
          in <head> instead, since DOMPurify strips <script> tags from the
          post body before it reaches the DOM. */}
      {Array.isArray(rawSchemas) &&
        rawSchemas.map((schemaString, i) => (
          <script key={`raw-schema-${i}`} type="application/ld+json">
            {schemaString}
          </script>
        ))}
    </Helmet>
  );
};

SEO.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  keywords: PropTypes.string,
  image: PropTypes.string,
  url: PropTypes.string,
  type: PropTypes.oneOf(["website", "article"]),
  author: PropTypes.string,
  publishedDate: PropTypes.string,
  modifiedDate: PropTypes.string,
  noindex: PropTypes.bool,
  category: PropTypes.string,
  tags: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.string,
  ]),
  readingTime: PropTypes.number,
  wordCount: PropTypes.number,
  section: PropTypes.string,
  locale: PropTypes.string,
  breadcrumbs: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      url: PropTypes.string,
    }),
  ),
  faqItems: PropTypes.arrayOf(
    PropTypes.shape({
      question: PropTypes.string.isRequired,
      answer: PropTypes.string.isRequired,
    }),
  ),
  rawSchemas: PropTypes.arrayOf(PropTypes.string),
};

export default SEO;
