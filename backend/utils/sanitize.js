// Sanitization utilities for user input and HTML content to prevent XSS attacks

const sanitizeHtml = require("sanitize-html");

// Blog content sanitization config - allows safe HTML tags
const blogContentConfig = {
  allowedTags: [
    // Text formatting
    "p",
    "br",
    "b",
    "i",
    "u",
    "strong",
    "em",
    "s",
    "strike",
    // Headings
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    // Lists
    "ul",
    "ol",
    "li",
    // Links (with restrictions)
    "a",
    // Block elements
    "blockquote",
    "hr",
    "div",
    "span",
    // Images (with restrictions)
    "img",
    // Code
    "pre",
    "code",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    img: ["src", "alt", "title", "width", "height"],
    div: ["class"],
    span: ["class"],
    p: ["class"],
    "*": ["style"],
  },
  allowedStyles: {
    "*": {
      // Allow only safe CSS properties
      color: [/^#[0-9a-fA-F]{3,6}$/, /^rgb\(\d+,\s*\d+,\s*\d+\)$/],
      "background-color": [/^#[0-9a-fA-F]{3,6}$/, /^rgb\(\d+,\s*\d+,\s*\d+\)$/],
      "text-align": [/^(left|right|center|justify)$/],
      "font-weight": [/^(normal|bold|\d{3})$/],
      "font-style": [/^(normal|italic)$/],
      "text-decoration": [/^(none|underline|line-through)$/],
    },
  },
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
  // Remove empty elements
  exclusiveFilter: (frame) => {
    return !frame.text.trim() && !["br", "hr", "img"].includes(frame.tag);
  },
  // Disallow javascript: URLs
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesByTag: {
    img: ["http", "https", "data"],
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
