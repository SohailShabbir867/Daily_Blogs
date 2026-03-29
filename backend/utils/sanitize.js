// Sanitization utilities for user input and HTML content to prevent XSS attacks

const sanitizeHtml = require("sanitize-html");

// Blog content sanitization config - allows safe HTML tags
const blogContentConfig = {
  allowedTags: [
    // Text formatting
    "p", "br", "b", "i", "u", "strong", "em", "s", "strike", "sub", "sup", "del", "mark",
    // Headings
    "h1", "h2", "h3", "h4", "h5", "h6",
    // Lists
    "ul", "ol", "li", "dl", "dt", "dd",
    // Links (with restrictions)
    "a",
    // Block elements
    "blockquote", "hr", "div", "span", "details", "summary",
    // Images and Media
    "img", "figure", "figcaption", "picture", "source", "iframe",
    // Code
    "pre", "code",
    // Tables
    "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel", "class", "id"],
    img: ["src", "srcset", "sizes", "alt", "title", "width", "height", "class", "id", "loading", "decoding"],
    picture: ["class", "id"],
    source: ["srcset", "sizes", "type", "media", "class", "id"],
    iframe: ["src", "width", "height", "allowfullscreen", "loading", "title", "frameborder", "class", "id"],
    th: ["colspan", "rowspan", "class", "id"],
    td: ["colspan", "rowspan", "class", "id"],
    code: ["class", "id"],
    pre: ["class", "id"],
    "*": ["style", "class", "id"],
  },
  // By omitting allowedStyles entirely, sanitize-html will NOT filter inline styles
  // as long as `style` is an allowed attribute (which it is, for all elements above).
  // This ensures dynamic inline styles (like center alignment and colors) are preserved.
  // Transform links to be safe
  transformTags: {
    a: (tagName, attribs) => {
      // Force external links to open in new tab with security attributes
      if (attribs.href && !attribs.href.startsWith("/")) {
        return {
          tagName: "a",
          attribs: {
            href: attribs.href,
            target: "_blank",
            rel: "noopener noreferrer nofollow",
          },
        };
      }
      return { tagName, attribs };
    },
  },
  // Remove only tags that are truly empty *and* safe to drop.
  // IMPORTANT: Do not treat "no text" as empty when the tag may wrap only media
  // (e.g. <div><img></div>, <p><img></p>) — otherwise sanitize-html drops the
  // opening tag and truncates the whole subtree, stripping images and embeds.
  exclusiveFilter: (frame) => {
    const keepEvenIfNoText = new Set([
      "br",
      "hr",
      "img",
      "iframe",
      "div",
      "span",
      "figure",
      "figcaption",
      "picture",
      "source",
      "p",
      "a",
      "td",
      "th",
      "tr",
      "table",
      "tbody",
      "thead",
      "tfoot",
      "caption",
      "colgroup",
      "col",
      "ul",
      "ol",
      "li",
      "dl",
      "dt",
      "dd",
      "blockquote",
      "pre",
      "code",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "details",
      "summary",
    ]);
    if (keepEvenIfNoText.has(frame.tag)) return false;
    return !frame.text.trim();
  },
  // Disallow javascript: URLs
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesByTag: {
    img: ["http", "https", "data"],
    iframe: ["http", "https"],
  },
  // Prevent protocol-relative URLs
  allowProtocolRelative: false,
};

// Comment sanitization config (more restrictive)
const commentConfig = {
  allowedTags: ["b", "i", "u", "strong", "em", "br", "p", "a"],
  allowedAttributes: {
    a: ["href"],
  },
  transformTags: {
    a: (tagName, attribs) => {
      return {
        tagName: "a",
        attribs: {
          href: attribs.href,
          target: "_blank",
          rel: "noopener noreferrer nofollow",
        },
      };
    },
  },
  allowedSchemes: ["http", "https"],
  allowProtocolRelative: false,
};

// Plain text config - removes all HTML
const plainTextConfig = {
  allowedTags: [],
  allowedAttributes: {},
};

// Sanitize blog content HTML
const sanitizeBlogContent = (html) => {
  if (!html || typeof html !== "string") {
    return "";
  }
  return sanitizeHtml(html, blogContentConfig);
};

// Sanitize comment HTML (more restrictive)
const sanitizeComment = (html) => {
  if (!html || typeof html !== "string") {
    return "";
  }
  return sanitizeHtml(html, commentConfig);
};

// Strip all HTML tags and return plain text
const stripHtml = (html) => {
  if (!html || typeof html !== "string") {
    return "";
  }
  return sanitizeHtml(html, plainTextConfig);
};

// Escape HTML special characters for safe display
const escapeHtml = (text) => {
  if (!text || typeof text !== "string") {
    return "";
  }

  const htmlEntities = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
  };

  return text.replace(/[&<>"'/]/g, (char) => htmlEntities[char]);
};

// Recursively sanitize object properties, removing dangerous characters
const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== "object") {
    return obj;
  }

  const sanitized = Array.isArray(obj) ? [] : {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];

      if (typeof value === "string") {
        // Remove null bytes and other dangerous characters
        sanitized[key] = value
          .replace(/\0/g, "")
          .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
      } else if (typeof value === "object" && value !== null) {
        sanitized[key] = sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
  }

  return sanitized;
};

module.exports = {
  sanitizeBlogContent,
  sanitizeComment,
  stripHtml,
  escapeHtml,
  sanitizeObject,
  blogContentConfig,
  commentConfig,
};
