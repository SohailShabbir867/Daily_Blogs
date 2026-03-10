// RichTextEditor - Professional WYSIWYG Blog Editor
// Features: Undo/Redo, Fullscreen, YouTube embed, Find & Replace, Emoji,
// Subscript/Superscript, Highlight colors, Code blocks (20+ languages),
// MS Word paste support, Image upload, Tables, Keyboard shortcuts
import { useState, useRef, useCallback, useEffect } from "react";
import DOMPurify from "dompurify";

// Toolbar Button Component
const ToolbarButton = ({
  onClick,
  title,
  children,
  active = false,
  disabled = false,
}) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    disabled={disabled}
    className={`p-2 rounded-lg transition-all duration-200 flex items-center justify-center min-w-9 min-h-9 ${
      active
        ? "bg-emerald-500 text-white shadow-md"
        : "text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 border border-transparent hover:border-emerald-200"
    } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
  >
    {children}
  </button>
);

// Toolbar Group Component
const ToolbarGroup = ({ children }) => (
  <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-lg border border-gray-200">
    {children}
  </div>
);

// Emoji categories
const EMOJI_LIST = [
  "😀",
  "😂",
  "😍",
  "🤔",
  "😎",
  "🥳",
  "😢",
  "😡",
  "👍",
  "👎",
  "👏",
  "🙌",
  "🔥",
  "⭐",
  "💡",
  "✅",
  "❌",
  "⚠️",
  "📌",
  "🎯",
  "🚀",
  "💻",
  "📱",
  "🎮",
  "🎬",
  "📚",
  "💼",
  "🏆",
  "🎨",
  "🔧",
  "📊",
  "📈",
  "🔍",
  "💰",
  "🌍",
  "❤️",
  "💪",
  "🎉",
  "📝",
  "🔗",
];

// Code languages
const CODE_LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "csharp", label: "C#" },
  { value: "cpp", label: "C++" },
  { value: "c", label: "C" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "ruby", label: "Ruby" },
  { value: "php", label: "PHP" },
  { value: "swift", label: "Swift" },
  { value: "kotlin", label: "Kotlin" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "scss", label: "SCSS" },
  { value: "sql", label: "SQL" },
  { value: "bash", label: "Bash / Shell" },
  { value: "powershell", label: "PowerShell" },
  { value: "json", label: "JSON" },
  { value: "yaml", label: "YAML" },
  { value: "xml", label: "XML" },
  { value: "markdown", label: "Markdown" },
  { value: "docker", label: "Dockerfile" },
  { value: "plaintext", label: "Plain Text" },
];

const RichTextEditor = ({
  value,
  onChange,
  placeholder = "Start writing your blog content here... You can paste from MS Word!",
}) => {
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const containerRef = useRef(null);
  const savedSelectionRef = useRef(null);
  const editorWrapperRef = useRef(null);

  // Modals
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showHighlightColors, setShowHighlightColors] = useState(false);
  const [showTextColors, setShowTextColors] = useState(false);

  // Link state
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");

  // Image state
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMethod, setUploadMethod] = useState("upload");
  const [imageSize, setImageSize] = useState("100"); // percentage: 25, 50, 75, 100
  const [imageWidth, setImageWidth] = useState("");
  const [imageHeight, setImageHeight] = useState("");
  const [imageSizeMode, setImageSizeMode] = useState("percentage"); // percentage or custom

  // Code block state
  const [codeContent, setCodeContent] = useState("");
  const [codeLanguage, setCodeLanguage] = useState("javascript");
  const [isInline, setIsInline] = useState(false);

  // Table state
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);

  // Video state
  const [videoUrl, setVideoUrl] = useState("");

  // Find & Replace state
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [findCount, setFindCount] = useState(0);

  // Editor state
  const [showPreview, setShowPreview] = useState(false);
  const [showHtml, setShowHtml] = useState(false);
  // 18px = 1.125rem — matches .blog-content CSS so the editor looks exactly like the published viewer
  const [fontSize, setFontSize] = useState("18px");
  const [editorHeight, setEditorHeight] = useState(550);
  const [isResizing, setIsResizing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const lastValueRef = useRef(value);
  const isUserEditingRef = useRef(false);

  // Initialize editor content and restore when switching from Preview/HTML to Edit
  useEffect(() => {
    if (editorRef.current && !showPreview && !showHtml) {
      const currentContent = editorRef.current.innerHTML;
      const valueChanged = value !== lastValueRef.current;
      const editorIsEmpty =
        !currentContent || currentContent === "<br>" || currentContent === "";

      if (editorIsEmpty || valueChanged || value !== currentContent) {
        editorRef.current.innerHTML = value || "";
        lastValueRef.current = value;
      }
    }
  }, [value, showPreview, showHtml]);

  // Handle Escape for fullscreen
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isFullscreen]);

  // Lock body scroll in fullscreen
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isFullscreen]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      isUserEditingRef.current = true;
      const content = editorRef.current.innerHTML;
      lastValueRef.current = content;
      onChange(content);
      setTimeout(() => {
        isUserEditingRef.current = false;
      }, 100);
    }
  }, [onChange]);

  const handleFocus = useCallback(() => {
    isUserEditingRef.current = true;
  }, []);

  const handleBlur = useCallback(() => {
    isUserEditingRef.current = false;
  }, []);

  // Manual resize handler
  const handleResizeMouseDown = useCallback(
    (e) => {
      e.preventDefault();
      setIsResizing(true);
      const startY = e.clientY;
      const startHeight = editorHeight;

      const handleMouseMove = (moveEvent) => {
        const delta = moveEvent.clientY - startY;
        const newHeight = Math.max(200, startHeight + delta);
        setEditorHeight(newHeight);
      };

      const handleMouseUp = () => {
        setIsResizing(false);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [editorHeight],
  );

  // Clean MS Word HTML
  const cleanWordHTML = useCallback((html) => {
    // (moved before handlePaste to avoid forward reference)
    let cleaned = html
      .replace(/<!--\[if[\s\S]*?endif\]-->/gi, "")
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/<o:p>[\s\S]*?<\/o:p>/gi, "")
      .replace(/<w:[\s\S]*?<\/w:[\s\S]*?>/gi, "")
      .replace(/<m:[\s\S]*?<\/m:[\s\S]*?>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<xml[\s\S]*?<\/xml>/gi, "")
      .replace(/<!\[if[\s\S]*?\]>/gi, "")
      .replace(/<!\[endif\]>/gi, "");

    cleaned = cleaned
      .replace(/class="Mso[\w]+"/gi, "")
      .replace(/style="mso-[\s\S]*?"/gi, "")
      .replace(/\s+style=""/g, "")
      .replace(/<font[\s\S]*?>/gi, (match) => {
        const colorMatch = match.match(/color="([^"]+)"/i);
        const sizeMatch = match.match(/size="([^"]+)"/i);
        let style = "";
        if (colorMatch) style += `color:${colorMatch[1]};`;
        if (sizeMatch) {
          const sizes = {
            1: "10px",
            2: "13px",
            3: "16px",
            4: "18px",
            5: "24px",
            6: "32px",
            7: "48px",
          };
          style += `font-size:${sizes[sizeMatch[1]] || "16px"};`;
        }
        return style ? `<span style="${style}">` : "<span>";
      })
      .replace(/<\/font>/gi, "</span>");

    return DOMPurify.sanitize(cleaned, {
      ALLOWED_TAGS: [
        "p",
        "br",
        "span",
        "div",
        "b",
        "strong",
        "i",
        "em",
        "u",
        "s",
        "strike",
        "del",
        "sub",
        "sup",
        "mark",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "ul",
        "ol",
        "li",
        "a",
        "img",
        "blockquote",
        "hr",
        "pre",
        "code",
        "table",
        "thead",
        "tbody",
        "tfoot",
        "tr",
        "th",
        "td",
      ],
      ALLOWED_ATTR: [
        "href",
        "target",
        "rel",
        "src",
        "alt",
        "class",
        "style",
        "width",
        "height",
        "colspan",
        "rowspan",
      ],
      ALLOW_DATA_ATTR: false,
    });
  }, []);

  // MS Word Paste Handler
  const handlePaste = useCallback(
    (e) => {
      e.preventDefault();
      let pastedContent = e.clipboardData.getData("text/html");

      if (pastedContent) {
        pastedContent = cleanWordHTML(pastedContent);
      } else {
        pastedContent = e.clipboardData.getData("text/plain");
        pastedContent = pastedContent
          .split("\n\n")
          .map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`)
          .join("");
      }

      document.execCommand("insertHTML", false, pastedContent);
      handleInput();
    },
    [handleInput, cleanWordHTML],
  );

  const execCommand = useCallback(
    (command, value = null) => {
      if (editorRef.current) {
        editorRef.current.focus();
        document.execCommand(command, false, value);
        handleInput();
      }
    },
    [handleInput],
  );

  // Text formatting
  const handleBold = useCallback(() => execCommand("bold"), [execCommand]);
  const handleItalic = useCallback(() => execCommand("italic"), [execCommand]);
  const handleUnderline = useCallback(
    () => execCommand("underline"),
    [execCommand],
  );
  const handleStrikethrough = useCallback(
    () => execCommand("strikeThrough"),
    [execCommand],
  );
  const handleSubscript = useCallback(
    () => execCommand("subscript"),
    [execCommand],
  );
  const handleSuperscript = useCallback(
    () => execCommand("superscript"),
    [execCommand],
  );

  // Undo/Redo
  const handleUndo = useCallback(() => execCommand("undo"), [execCommand]);
  const handleRedo = useCallback(() => execCommand("redo"), [execCommand]);

  // Headings & paragraph
  const handleHeading = useCallback(
    (level) => {
      execCommand("formatBlock", `<h${level}>`);
    },
    [execCommand],
  );
  const handleParagraph = useCallback(() => {
    execCommand("formatBlock", "<p>");
  }, [execCommand]);

  // Link handling
  const handleLinkClick = useCallback(() => {
    saveSelection();
    const selection = window.getSelection();
    const selectedText = selection.toString();
    if (selectedText) {
      setLinkText(selectedText);
      setLinkUrl("");
      setShowLinkModal(true);
    } else {
      setLinkText("");
      setLinkUrl("");
      setShowLinkModal(true);
    }
  }, []);

  const insertLink = () => {
    if (linkUrl) {
      const displayText = linkText || linkUrl;
      // Use inline style so the link color is preserved identically in the viewer
      const linkHtml = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer" style="color: #059669; text-decoration: underline; font-weight: 500;">${displayText}</a>`;
      restoreSelection();
      execCommand("insertHTML", linkHtml);
    }
    setShowLinkModal(false);
    setLinkUrl("");
    setLinkText("");
  };

  // Image handling
  const handleImageClick = () => {
    saveSelection();
    setImageUrl("");
    setImageAlt("");
    setImageFile(null);
    setImagePreview("");
    setUploadMethod("upload");
    setImageSize("100");
    setImageWidth("");
    setImageHeight("");
    setImageSizeMode("percentage");
    setShowImageModal(true);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const insertImage = async () => {
    let finalImageUrl = "";

    if (uploadMethod === "upload" && imageFile) {
      setIsUploading(true);
      try {
        const reader = new FileReader();
        finalImageUrl = await new Promise((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(imageFile);
        });
      } catch (error) {
        console.error("Error processing image:", error);
        alert("Error processing image. Please try again.");
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    } else if (uploadMethod === "url" && imageUrl) {
      finalImageUrl = imageUrl;
    }

    if (finalImageUrl) {
      let sizeStyle = "";
      if (imageSizeMode === "custom" && (imageWidth || imageHeight)) {
        if (imageWidth) sizeStyle += `width: ${imageWidth}px;`;
        if (imageHeight) sizeStyle += ` height: ${imageHeight}px;`;
        if (imageWidth && !imageHeight) sizeStyle += " height: auto;";
      } else {
        sizeStyle =
          imageSize === "100"
            ? "max-width: 100%; height: auto;"
            : `max-width: ${imageSize}%; height: auto;`;
      }
      // No Tailwind classes — rely purely on inline styles + .blog-content img CSS rules
      const imageHtml = `<div style="text-align: center; margin: 1.5rem 0;"><img src="${finalImageUrl}" alt="${imageAlt || "Blog image"}" style="${sizeStyle} display: inline-block;" /></div>`;
      restoreSelection();
      execCommand("insertHTML", imageHtml);
    }

    setShowImageModal(false);
    setImageUrl("");
    setImageAlt("");
    setImageFile(null);
    setImagePreview("");
  };

  // Video embed (YouTube / Vimeo)
  const handleVideoClick = () => {
    saveSelection();
    setVideoUrl("");
    setShowVideoModal(true);
  };

  const extractVideoId = (url) => {
    // YouTube
    const ytMatch = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/,
    );
    if (ytMatch) return { platform: "youtube", id: ytMatch[1] };

    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return { platform: "vimeo", id: vimeoMatch[1] };

    return null;
  };

  const insertVideo = () => {
    if (!videoUrl) return;
    const videoInfo = extractVideoId(videoUrl);

    if (!videoInfo) {
      alert("Invalid video URL. Please use a YouTube or Vimeo URL.");
      return;
    }

    let embedUrl = "";
    if (videoInfo.platform === "youtube") {
      embedUrl = `https://www.youtube.com/embed/${videoInfo.id}`;
    } else if (videoInfo.platform === "vimeo") {
      embedUrl = `https://player.vimeo.com/video/${videoInfo.id}`;
    }

    const videoHtml = `
      <div class="video-embed my-6" contenteditable="false" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;max-width:100%;border-radius:12px;">
        <iframe src="${embedUrl}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allowfullscreen loading="lazy" title="Embedded video"></iframe>
      </div>
      <p><br></p>
    `;
    restoreSelection();
    execCommand("insertHTML", videoHtml);
    setShowVideoModal(false);
    setVideoUrl("");
  };

  // Lists and formatting
  const handleBulletList = () => execCommand("insertUnorderedList");
  const handleNumberedList = () => execCommand("insertOrderedList");
  const handleBlockquote = () => execCommand("formatBlock", "<blockquote>");
  const handleHorizontalRule = () => execCommand("insertHorizontalRule");
  const handleClearFormatting = () => execCommand("removeFormat");
  const handleIndent = () => execCommand("indent");
  const handleOutdent = () => execCommand("outdent");

  // Text colors
  const textColors = [
    "#000000",
    "#374151",
    "#dc2626",
    "#ea580c",
    "#ca8a04",
    "#16a34a",
    "#0891b2",
    "#2563eb",
    "#7c3aed",
    "#db2777",
  ];

  // Highlight colors
  const highlightColors = [
    "#fef08a",
    "#bbf7d0",
    "#bfdbfe",
    "#fecaca",
    "#e9d5ff",
    "#fed7aa",
    "#99f6e4",
    "#fce7f3",
    "#d1d5db",
    "#ffffff",
  ];

  // Save/Restore selection
  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      savedSelectionRef.current = selection.getRangeAt(0);
    }
  };

  const restoreSelection = () => {
    if (savedSelectionRef.current) {
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(savedSelectionRef.current);
    }
  };

  const handleTextColor = (color) => {
    restoreSelection();
    execCommand("foreColor", color);
    editorRef.current?.focus();
  };

  const handleHighlight = (color) => {
    restoreSelection();
    execCommand("hiliteColor", color);
    editorRef.current?.focus();
    setShowHighlightColors(false);
  };

  const handleAlign = (alignment) => execCommand("justify" + alignment);

  const fontSizeSteps = [
    "12px",
    "14px",
    "16px",
    "18px",
    "20px",
    "24px",
    "28px",
    "32px",
    "36px",
    "42px",
    "48px",
    "56px",
    "64px",
    "72px",
  ];

  const getSelectedFontSize = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed)
      return fontSize;
    let node = selection.focusNode;
    if (node?.nodeType === 3) node = node.parentElement;
    while (node && node !== editorRef.current) {
      if (node.style && node.style.fontSize) return node.style.fontSize;
      node = node.parentElement;
    }
    return fontSize;
  };

  const applyFontSizeToSelection = (newSize) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    if (selection.isCollapsed) {
      setFontSize(newSize);
      return;
    }

    execCommand("fontSize", "7");
    const fontElements = editorRef.current.querySelectorAll('font[size="7"]');
    fontElements.forEach((element) => {
      element.removeAttribute("size");
      element.style.fontSize = newSize;
    });
    setFontSize(newSize);
  };

  const handleFontSize = (size) => {
    applyFontSizeToSelection(size);
  };

  const increaseFontSize = () => {
    const current = getSelectedFontSize();
    const currentPx = Math.round(parseFloat(current));
    const next = Math.min(currentPx + 1, 72);
    applyFontSizeToSelection(next + "px");
  };

  const decreaseFontSize = () => {
    const current = getSelectedFontSize();
    const currentPx = Math.round(parseFloat(current));
    const next = Math.max(currentPx - 1, 8);
    applyFontSizeToSelection(next + "px");
  };

  // Find & Replace
  const handleFind = () => {
    if (!findText || !editorRef.current) {
      setFindCount(0);
      return;
    }
    const content = editorRef.current.innerText;
    const regex = new RegExp(findText, "gi");
    const matches = content.match(regex);
    setFindCount(matches ? matches.length : 0);

    // Highlight matches using window.find
    if (matches && matches.length > 0) {
      window.getSelection().removeAllRanges();
      editorRef.current.focus();
      window.find(findText, false, false, true);
    }
  };

  const handleReplace = () => {
    if (!findText || !editorRef.current) return;
    const selection = window.getSelection();
    if (selection.toString().toLowerCase() === findText.toLowerCase()) {
      document.execCommand("insertText", false, replaceText);
      handleInput();
      // Find next
      window.find(findText, false, false, true);
    } else {
      window.find(findText, false, false, true);
    }
  };

  const handleReplaceAll = () => {
    if (!findText || !editorRef.current) return;
    const content = editorRef.current.innerHTML;
    const regex = new RegExp(
      findText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "gi",
    );
    editorRef.current.innerHTML = content.replace(regex, replaceText);
    handleInput();
    setFindCount(0);
  };

  // Code block
  const handleCodeClick = () => {
    setCodeContent("");
    setCodeLanguage("javascript");
    setIsInline(false);
    setShowCodeModal(true);
  };

  const insertCode = () => {
    if (!codeContent) return;
    if (isInline) {
      // Inline style so it renders identically in the viewer
      const codeHtml = `<code style="background: #f3f4f6; color: #dc2626; padding: 0.15em 0.4em; border-radius: 0.25rem; font-size: 0.875em; font-family: ui-monospace, monospace;">${codeContent}</code>`;
      execCommand("insertHTML", codeHtml);
    } else {
      const escapedCode = codeContent
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      const uniqueId = `code-${Date.now()}`;
      const langLabel =
        CODE_LANGUAGES.find((l) => l.value === codeLanguage)?.label ||
        codeLanguage;
      // Use inline styles everywhere so this renders correctly in any context (viewer, email, etc.)
      const codeHtml = `<div class="code-block-wrapper" style="margin: 1.5rem 0; border-radius: 8px; overflow: hidden; border: 1px solid #374151; font-size: 0.9em;"><div class="code-block-header" style="background: #1f2937; padding: 0.5rem 1rem; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #374151;"><span style="color: #9ca3af; font-size: 0.75rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em;">${langLabel}</span><button class="copy-code-btn" style="color: #9ca3af; font-size: 0.75rem; padding: 0.25rem 0.5rem; border-radius: 4px; cursor: pointer; background: transparent; border: none;">📋 Copy</button></div><pre style="background: #111827; color: #f3f4f6; padding: 1rem 1.25rem; margin: 0; overflow-x: auto; font-family: ui-monospace, 'Cascadia Code', monospace; line-height: 1.6;"><code id="${uniqueId}" class="language-${codeLanguage}" style="background: none; color: inherit; padding: 0;">${escapedCode}</code></pre></div>`;
      execCommand("insertHTML", codeHtml);
    }
    setShowCodeModal(false);
    setCodeContent("");
  };

  // Table
  const handleTableClick = () => {
    setTableRows(3);
    setTableCols(3);
    setShowTableModal(true);
  };

  const insertTable = () => {
    // Use inline styles so the table renders identically in the blog viewer
    let tableHtml =
      '<table style="border-collapse: collapse; width: 100%; margin: 1.5rem 0;"><tbody>';
    for (let i = 0; i < tableRows; i++) {
      tableHtml += "<tr>";
      for (let j = 0; j < tableCols; j++) {
        if (i === 0) {
          tableHtml +=
            '<th style="border: 1px solid #d1d5db; padding: 0.6rem 1rem; background: #f3f4f6; font-weight: 600; text-align: left; color: #111827;">Header</th>';
        } else {
          tableHtml += '<td style="border: 1px solid #d1d5db; padding: 0.6rem 1rem; color: #374151;">Cell</td>';
        }
      }
      tableHtml += "</tr>";
    }
    tableHtml += "</tbody></table>";
    execCommand("insertHTML", tableHtml);
    setShowTableModal(false);
  };

  // Emoji insert
  const insertEmoji = (emoji) => {
    restoreSelection();
    execCommand("insertText", emoji);
    setShowEmojiPicker(false);
  };

  // Stats
  const getStats = () => {
    if (!value) return { words: 0, chars: 0, readTime: 0 };
    const text = value.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ");
    const words = text
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0).length;
    const chars = text.length;
    const readTime = Math.max(1, Math.ceil(words / 200));
    return { words, chars, readTime };
  };

  const stats = getStats();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!editorRef.current?.contains(document.activeElement)) return;
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      if (modKey) {
        switch (e.key.toLowerCase()) {
          case "b":
            e.preventDefault();
            handleBold();
            break;
          case "i":
            e.preventDefault();
            handleItalic();
            break;
          case "u":
            e.preventDefault();
            handleUnderline();
            break;
          case "k":
            e.preventDefault();
            handleLinkClick();
            break;
          case "h":
            if (e.shiftKey) {
              e.preventDefault();
              setShowFindReplace((prev) => !prev);
            }
            break;
          default:
            break;
        }
      }

      // F11 for fullscreen
      if (e.key === "F11") {
        e.preventDefault();
        setIsFullscreen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleBold, handleItalic, handleUnderline, handleLinkClick]);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showEmojiPicker && !e.target.closest(".emoji-picker-container")) {
        setShowEmojiPicker(false);
      }
      if (
        showHighlightColors &&
        !e.target.closest(".highlight-picker-container")
      ) {
        setShowHighlightColors(false);
      }
      if (showTextColors && !e.target.closest(".text-color-picker-container")) {
        setShowTextColors(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showEmojiPicker, showHighlightColors, showTextColors]);

  const editorContent = (
    <div
      ref={editorWrapperRef}
      className={`w-full ${isFullscreen ? "fixed inset-0 z-50 bg-white flex flex-col" : ""}`}
    >
      {/* Toolbar */}
      <div
        className={`bg-white border-2 border-gray-200 shadow-sm sticky z-10 ${isFullscreen ? "top-0 rounded-none border-x-0 border-t-0" : "rounded-t-xl top-0"}`}
      >
        {/* Top Bar - Mode Switch, Stats & Controls */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-linear-to-r from-gray-50 to-white">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setShowPreview(false);
                setShowHtml(false);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                !showPreview && !showHtml
                  ? "bg-emerald-500 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              ✏️ Edit
            </button>
            <button
              type="button"
              onClick={() => {
                setShowPreview(true);
                setShowHtml(false);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                showPreview && !showHtml
                  ? "bg-emerald-500 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              👁️ Preview
            </button>
            <button
              type="button"
              onClick={() => {
                setShowHtml(true);
                setShowPreview(false);
              }}
              title="Edit raw HTML source"
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                showHtml
                  ? "bg-amber-500 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              &lt;/&gt; HTML
            </button>
          </div>

          <div className="flex items-center gap-4">
            {/* Stats */}
            <div className="hidden sm:flex items-center gap-4 text-sm">
              <span className="text-gray-500">
                Words: <strong className="text-gray-700">{stats.words}</strong>
              </span>
              <span className="text-gray-500">
                Chars: <strong className="text-gray-700">{stats.chars}</strong>
              </span>
              <span className="text-gray-500">
                ⏱️{" "}
                <strong className="text-gray-700">
                  ~{stats.readTime} min read
                </strong>
              </span>
            </div>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={() => setIsFullscreen((prev) => !prev)}
              title={
                isFullscreen ? "Exit Fullscreen (Esc)" : "Fullscreen (F11)"
              }
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-emerald-600 transition-all"
            >
              {isFullscreen ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 9L4 4m0 0v4m0-4h4m6 10l5 5m0 0v-4m0 4h-4M9 15l-5 5m0 0h4m-4 0v-4m10-6l5-5m0 0h-4m4 0v4"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Stats */}
        <div className="sm:hidden flex items-center justify-center gap-4 px-4 py-2 text-xs border-b border-gray-100 bg-gray-50">
          <span className="text-gray-500">{stats.words} words</span>
          <span className="text-gray-500">{stats.chars} chars</span>
          <span className="text-gray-500">~{stats.readTime} min read</span>
        </div>

        {/* Find & Replace Bar */}
        {showFindReplace && !showPreview && !showHtml && (
          <div className="px-4 py-3 border-b border-gray-200 bg-amber-50">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-50">
                <input
                  type="text"
                  value={findText}
                  onChange={(e) => setFindText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleFind()}
                  placeholder="Find..."
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none flex-1"
                />
                <input
                  type="text"
                  value={replaceText}
                  onChange={(e) => setReplaceText(e.target.value)}
                  placeholder="Replace..."
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none flex-1"
                />
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleFind}
                  className="px-3 py-1.5 bg-emerald-500 text-white text-sm rounded-lg hover:bg-emerald-600"
                >
                  Find
                </button>
                <button
                  type="button"
                  onClick={handleReplace}
                  className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
                >
                  Replace
                </button>
                <button
                  type="button"
                  onClick={handleReplaceAll}
                  className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setShowFindReplace(false)}
                  className="p-1.5 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                >
                  ✕
                </button>
              </div>
              {findCount > 0 && (
                <span className="text-xs text-emerald-700 font-medium">
                  {findCount} found
                </span>
              )}
            </div>
          </div>
        )}

        {/* Toolbar Rows - Only show in edit mode */}
        {!showPreview && !showHtml && (
          <div className="p-3 space-y-3">
            {/* Row 1: Undo/Redo, Format Block, Font Size, Text Style, Headings */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Undo/Redo */}
              <ToolbarGroup label="History">
                <ToolbarButton onClick={handleUndo} title="Undo (Ctrl+Z)">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h10a5 5 0 015 5v2M3 10l4-4m-4 4l4 4"
                    />
                  </svg>
                </ToolbarButton>
                <ToolbarButton onClick={handleRedo} title="Redo (Ctrl+Y)">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 10H11a5 5 0 00-5 5v2m15-7l-4-4m4 4l-4 4"
                    />
                  </svg>
                </ToolbarButton>
              </ToolbarGroup>

              {/* Block Format */}
              <select
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "p") handleParagraph();
                  else handleHeading(parseInt(val));
                  e.target.value = "";
                }}
                defaultValue=""
                className="px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white font-medium"
                title="Text Block Format"
              >
                <option value="" disabled>
                  Block Format
                </option>
                <option value="p">¶ Normal Text</option>
                <option value="1">H1 — Main Title</option>
                <option value="2">H2 — Section</option>
                <option value="3">H3 — Subsection</option>
                <option value="4">H4 — Minor Heading</option>
              </select>

              {/* Font Size with +/- */}
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={decreaseFontSize}
                  className="p-2 rounded-lg border-2 border-gray-200 hover:bg-gray-100 text-gray-700 font-bold text-sm transition"
                  title="Decrease Font Size (selected text)"
                >
                  A<span className="text-xs">-</span>
                </button>
                <input
                  type="number"
                  value={parseInt(fontSize)}
                  onChange={(e) => {
                    const val = Math.max(
                      8,
                      Math.min(120, parseInt(e.target.value) || 8),
                    );
                    handleFontSize(val + "px");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const val = Math.max(
                        8,
                        Math.min(120, parseInt(e.target.value) || 8),
                      );
                      handleFontSize(val + "px");
                    }
                  }}
                  min="8"
                  max="120"
                  className="w-14 px-2 py-2 border-2 border-gray-200 rounded-lg text-sm text-center focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white font-medium"
                  title="Type a font size in px"
                />
                <button
                  type="button"
                  onClick={increaseFontSize}
                  className="p-2 rounded-lg border-2 border-gray-200 hover:bg-gray-100 text-gray-700 font-bold text-sm transition"
                  title="Increase Font Size (selected text)"
                >
                  A<span className="text-xs">+</span>
                </button>
              </div>

              {/* Text Style */}
              <ToolbarGroup label="Style">
                <ToolbarButton onClick={handleBold} title="Bold (Ctrl+B)">
                  <span className="font-bold text-base">B</span>
                </ToolbarButton>
                <ToolbarButton onClick={handleItalic} title="Italic (Ctrl+I)">
                  <span className="italic text-base">I</span>
                </ToolbarButton>
                <ToolbarButton
                  onClick={handleUnderline}
                  title="Underline (Ctrl+U)"
                >
                  <span className="underline text-base">U</span>
                </ToolbarButton>
                <ToolbarButton
                  onClick={handleStrikethrough}
                  title="Strikethrough"
                >
                  <span className="line-through text-base">S</span>
                </ToolbarButton>
              </ToolbarGroup>

              {/* Alignment */
              <ToolbarGroup label="Align">
                <ToolbarButton
                  onClick={() => handleAlign("Left")}
                  title="Align Left"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M3 21h18v-2H3v2zm0-4h12v-2H3v2zm0-4h18v-2H3v2zm0-4h12V7H3v2zm0-6v2h18V3H3z" />
                  </svg>
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => handleAlign("Center")}
                  title="Align Center"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M7 15v2h10v-2H7zm-4 6h18v-2H3v2zm0-8h18v-2H3v2zm4-6v2h10V7H7zM3 3v2h18V3H3z" />
                  </svg>
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => handleAlign("Right")}
                  title="Align Right"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M3 21h18v-2H3v2zm6-4h12v-2H9v2zm-6-4h18v-2H3v2zm6-4h12V7H9v2zM3 3v2h18V3H3z" />
                  </svg>
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => handleAlign("Full")}
                  title="Justify"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M3 21h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18V7H3v2zm0-6v2h18V3H3z" />
                  </svg>
                </ToolbarButton>
              </ToolbarGroup>
            </div>

            {/* Row 2: Lists, Insert, Colors, Emoji, Utilities */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Lists */}
              <ToolbarGroup label="Lists">
                <ToolbarButton onClick={handleBulletList} title="Bullet List">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6C3.17 4.5 2.5 5.17 2.5 6s.67 1.5 1.5 1.5S5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.67 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z" />
                  </svg>
                </ToolbarButton>
                <ToolbarButton
                  onClick={handleNumberedList}
                  title="Numbered List"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-4h1V9H2v1h1v4zm-1-8h1.8L2 5.1v.9zm5 16h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z" />
                  </svg>
                </ToolbarButton>
                <ToolbarButton onClick={handleBlockquote} title="Quote">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
                  </svg>
                </ToolbarButton>
              </ToolbarGroup>

              {/* Insert */}
              <ToolbarGroup label="Insert">
                <ToolbarButton
                  onClick={handleLinkClick}
                  title="Add Link (Ctrl+K)"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
                  </svg>
                </ToolbarButton>
                <ToolbarButton onClick={handleImageClick} title="Insert Image">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                  </svg>
                </ToolbarButton>
                <ToolbarButton
                  onClick={handleVideoClick}
                  title="Embed YouTube / Vimeo"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 13l-5-3 5-3v6z" />
                  </svg>
                </ToolbarButton>
                <ToolbarButton onClick={handleTableClick} title="Insert Table">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM8 20H4v-4h4v4zm0-6H4v-4h4v4zm0-6H4V4h4v4zm6 12h-4v-4h4v4zm0-6h-4v-4h4v4zm0-6h-4V4h4v4zm6 12h-4v-4h4v4zm0-6h-4v-4h4v4zm0-6h-4V4h4v4z" />
                  </svg>
                </ToolbarButton>
                <ToolbarButton onClick={handleCodeClick} title="Insert Code">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" />
                  </svg>
                </ToolbarButton>
                <ToolbarButton
                  onClick={handleHorizontalRule}
                  title="Horizontal Line"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 13H5v-2h14v2z" />
                  </svg>
                </ToolbarButton>
              </ToolbarGroup>

              {/* Text Color */}
              <div className="relative text-color-picker-container">
                <ToolbarButton
                  onClick={() => {
                    saveSelection();
                    setShowTextColors((prev) => !prev);
                  }}
                  title="Text Color"
                  active={showTextColors}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11 3L5.5 17h2.25l1.12-3h6.25l1.12 3h2.25L13 3h-2zm-1.38 9L12 5.67 14.38 12H9.62z" />
                    <rect x="4" y="20" width="16" height="2" />
                  </svg>
                </ToolbarButton>
                {showTextColors && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl p-2 z-50 flex gap-1 flex-wrap w-36">
                    {textColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => { handleTextColor(color); setShowTextColors(false); }}
                        title={`Text: ${color}`}
                        className="w-6 h-6 rounded-full border border-gray-300 hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Highlight */}
              <div className="relative highlight-picker-container">
                <ToolbarButton
                  onClick={() => {
                    saveSelection();
                    setShowHighlightColors((prev) => !prev);
                  }}
                  title="Highlight Color"
                  active={showHighlightColors}
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.75 7L14 3.25l-10 10V17h3.75l10-10zm2.96-2.96a.996.996 0 000-1.41L18.37.29a.996.996 0 00-1.41 0L15 2.25 18.75 6l1.96-1.96z" />
                    <path d="M2 20h20v4H2z" fill="#fef08a" />
                  </svg>
                </ToolbarButton>
                {showHighlightColors && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl p-2 z-50 flex gap-1 flex-wrap w-32">
                    {highlightColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => handleHighlight(color)}
                        title={
                          color === "#ffffff"
                            ? "Remove highlight"
                            : `Highlight: ${color}`
                        }
                        className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Emoji */}
              <div className="relative emoji-picker-container">
                <ToolbarButton
                  onClick={() => {
                    saveSelection();
                    setShowEmojiPicker((prev) => !prev);
                  }}
                  title="Insert Emoji"
                  active={showEmojiPicker}
                >
                  <span className="text-base">😊</span>
                </ToolbarButton>
                {showEmojiPicker && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl p-3 z-50 w-64">
                    <p className="text-xs text-gray-500 mb-2 font-medium">
                      Click an emoji to insert
                    </p>
                    <div className="grid grid-cols-8 gap-1">
                      {EMOJI_LIST.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => insertEmoji(emoji)}
                          className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-lg transition-all hover:scale-110"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Utilities */}
              <ToolbarGroup>
                <ToolbarButton
                  onClick={handleClearFormatting}
                  title="Clear Formatting"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M3.27 5L2 6.27l6.97 6.97L6.5 19h3l1.57-3.66L16.73 21 18 19.73 3.27 5zM6 5v.18L8.82 8h2.4l-.72 1.68 2.1 2.1L14.21 8H20V5H6z" />
                  </svg>
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => setShowFindReplace((prev) => !prev)}
                  title="Find & Replace (Ctrl+Shift+H)"
                  active={showFindReplace}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </ToolbarButton>
              </ToolbarGroup>
            </div>
          </div>
        )}
      </div>

      {/* Editor Content Area */}
      <div
        ref={containerRef}
        className={`relative ${isFullscreen ? "flex-1 overflow-hidden" : ""}`}
      >
        {/* ── Raw HTML source editor ── */}
        {showHtml ? (
          <div
            className={`border-2 border-t-0 border-amber-300 bg-gray-950 ${isFullscreen ? "h-full flex flex-col rounded-none" : "rounded-b-xl"}`}
          >
            <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-700">
              <span className="text-amber-400 text-xs font-mono font-semibold">
                HTML Source Editor — changes apply immediately
              </span>
              <button
                type="button"
                onClick={() => {
                  if (editorRef.current) {
                    editorRef.current.innerHTML = value || "";
                  }
                  setShowHtml(false);
                }}
                className="text-xs text-gray-400 hover:text-white px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 transition"
              >
                ✓ Done
              </button>
            </div>
            <textarea
              className="w-full bg-gray-950 text-green-300 font-mono text-sm p-4 outline-none resize-none"
              style={{ minHeight: isFullscreen ? "100%" : `${editorHeight}px` }}
              value={value || ""}
              onChange={(e) => {
                lastValueRef.current = e.target.value;
                onChange(e.target.value);
              }}
              spellCheck={false}
              autoComplete="off"
              autoCorrect="off"
              placeholder="<!-- Write or paste raw HTML here... -->"
            />
          </div>
        ) : showPreview ? (
          <div
            className={`p-8 blog-content overflow-y-auto border-2 border-t-0 border-gray-200 bg-white ${isFullscreen ? "h-full rounded-none" : "min-h-125 rounded-b-xl"}`}
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(
                value ||
                  "<p class='text-gray-400'>Nothing to preview yet. Start writing!</p>",
                {
                  ALLOWED_TAGS: [
                    "p",
                    "br",
                    "span",
                    "div",
                    "b",
                    "strong",
                    "i",
                    "em",
                    "u",
                    "s",
                    "strike",
                    "del",
                    "sub",
                    "sup",
                    "mark",
                    "h1",
                    "h2",
                    "h3",
                    "h4",
                    "h5",
                    "h6",
                    "ul",
                    "ol",
                    "li",
                    "a",
                    "img",
                    "blockquote",
                    "hr",
                    "pre",
                    "code",
                    "table",
                    "thead",
                    "tbody",
                    "tfoot",
                    "tr",
                    "th",
                    "td",
                    "font",
                    "button",
                    "iframe",
                  ],
                  ALLOWED_ATTR: [
                    "href",
                    "target",
                    "rel",
                    "src",
                    "alt",
                    "class",
                    "style",
                    "width",
                    "height",
                    "color",
                    "size",
                    "face",
                    "colspan",
                    "rowspan",
                    "align",
                    "valign",
                    "id",
                    "onclick",
                    "contenteditable",
                    "allowfullscreen",
                    "loading",
                    "title",
                  ],
                  ADD_TAGS: ["iframe"],
                  ADD_ATTR: ["allowfullscreen", "loading"],
                },
              ),
            }}
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onPaste={handlePaste}
            onMouseUp={saveSelection}
            onKeyUp={saveSelection}
            suppressContentEditableWarning={true}
            className={`p-8 outline-none blog-content focus:ring-2 focus:ring-emerald-500 border-2 border-t-0 border-gray-200 bg-white text-gray-800 ${isFullscreen ? "h-full overflow-y-auto rounded-none" : ""}`}
            style={{
              minHeight: isFullscreen ? "100%" : `${editorHeight}px`,
              fontSize,
            }}
            data-placeholder={placeholder}
          />
        )}

        {/* Resize Handle - Only in non-fullscreen edit mode */}
        {!showPreview && !showHtml && !isFullscreen && (
          <div
            onMouseDown={handleResizeMouseDown}
            className={`h-3 bg-gray-100 border-2 border-t-0 border-gray-200 rounded-b-xl cursor-ns-resize flex items-center justify-center hover:bg-emerald-100 transition-colors ${isResizing ? "bg-emerald-200" : ""}`}
            title="Drag to resize editor"
          >
            <div className="flex gap-1">
              <div className="w-8 h-1 bg-gray-300 rounded-full" />
            </div>
          </div>
        )}
      </div>

      {/* Tips & Shortcuts */}
      {!showPreview && !showHtml && !value && !isFullscreen && (
        <div className="text-center py-4 text-sm text-gray-500 bg-gray-50 border-t border-gray-200 space-y-1">
          <p>
            💡 <strong>Tip:</strong> Paste directly from MS Word — formatting is
            preserved!
          </p>
          <p className="text-xs text-gray-400">
            Shortcuts:{" "}
            <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">
              Ctrl+B
            </kbd>{" "}
            Bold
            {" · "}
            <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">
              Ctrl+I
            </kbd>{" "}
            Italic
            {" · "}
            <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">
              Ctrl+U
            </kbd>{" "}
            Underline
            {" · "}
            <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">
              Ctrl+K
            </kbd>{" "}
            Link
            {" · "}
            <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">
              F11
            </kbd>{" "}
            Fullscreen
          </p>
        </div>
      )}

      {/* ═══════════════════════ MODALS ═══════════════════════ */}

      {/* Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              🔗 Add Link
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link Text
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                  placeholder="e.g., Click here"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL
                </label>
                <input
                  type="text"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && insertLink()}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                  placeholder="https://example.com"
                  autoFocus
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={insertLink}
                disabled={!linkUrl}
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              🖼️ Insert Image
            </h3>

            {/* Upload Method Toggle */}
            <div className="flex gap-2 mb-6">
              <button
                type="button"
                onClick={() => setUploadMethod("upload")}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                  uploadMethod === "upload"
                    ? "bg-emerald-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                📁 Upload from Device
              </button>
              <button
                type="button"
                onClick={() => setUploadMethod("url")}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                  uploadMethod === "url"
                    ? "bg-emerald-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                🔗 From URL
              </button>
            </div>

            <div className="space-y-4">
              {uploadMethod === "upload" ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Image File
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all"
                  >
                    {imagePreview ? (
                      <div>
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="max-h-48 mx-auto rounded-lg shadow-md"
                        />
                        <p className="text-sm text-gray-500 mt-2">
                          Click to change image
                        </p>
                      </div>
                    ) : (
                      <div>
                        <svg
                          className="w-12 h-12 mx-auto text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <p className="mt-2 text-sm text-gray-600">
                          Click to select an image
                        </p>
                        <p className="text-xs text-gray-400">
                          Max 5MB, JPG/PNG/GIF/WebP
                        </p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL
                  </label>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                    placeholder="https://example.com/image.jpg"
                    autoFocus
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alt Text (SEO)
                </label>
                <input
                  type="text"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                  placeholder="Describe the image for accessibility"
                />
              </div>

              {/* Image Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image Size
                </label>

                {/* Size Mode Toggle */}
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setImageSizeMode("percentage")}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      imageSizeMode === "percentage"
                        ? "bg-emerald-500 text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"
                    }`}
                  >
                    % Percentage
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageSizeMode("custom")}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      imageSizeMode === "custom"
                        ? "bg-emerald-500 text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"
                    }`}
                  >
                    📐 Custom (px)
                  </button>
                </div>

                {imageSizeMode === "percentage" ? (
                  <div className="flex gap-2">
                    {[
                      { value: "25", label: "25%" },
                      { value: "50", label: "50%" },
                      { value: "75", label: "75%" },
                      { value: "100", label: "100%" },
                    ].map((size) => (
                      <button
                        key={size.value}
                        type="button"
                        onClick={() => setImageSize(size.value)}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                          imageSize === size.value
                            ? "bg-emerald-500 text-white shadow-md"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"
                        }`}
                      >
                        {size.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">
                        Width (px)
                      </label>
                      <input
                        type="number"
                        value={imageWidth}
                        onChange={(e) => setImageWidth(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm"
                        placeholder="e.g. 600"
                        min="50"
                        max="2000"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">
                        Height (px)
                      </label>
                      <input
                        type="number"
                        value={imageHeight}
                        onChange={(e) => setImageHeight(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm"
                        placeholder="Auto"
                        min="50"
                        max="2000"
                      />
                    </div>
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  Image will be centered in the content area
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={insertImage}
                disabled={
                  isUploading ||
                  (uploadMethod === "upload" ? !imageFile : !imageUrl)
                }
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? "Processing..." : "Insert Image"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Embed Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              🎬 Embed Video
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video URL
                </label>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && insertVideo()}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                  placeholder="https://www.youtube.com/watch?v=..."
                  autoFocus
                />
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500 space-y-1">
                <p className="font-medium text-gray-700">Supported formats:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>YouTube: youtube.com/watch?v=... or youtu.be/...</li>
                  <li>YouTube Shorts: youtube.com/shorts/...</li>
                  <li>Vimeo: vimeo.com/...</li>
                </ul>
              </div>
              {videoUrl && extractVideoId(videoUrl) && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <p className="text-xs text-gray-500 px-3 py-1 bg-gray-50">
                    Preview:
                  </p>
                  <div
                    style={{
                      position: "relative",
                      paddingBottom: "56.25%",
                      height: 0,
                    }}
                  >
                    <iframe
                      src={
                        extractVideoId(videoUrl)?.platform === "youtube"
                          ? `https://www.youtube.com/embed/${extractVideoId(videoUrl).id}`
                          : `https://player.vimeo.com/video/${extractVideoId(videoUrl).id}`
                      }
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        border: 0,
                      }}
                      allowFullScreen
                      loading="lazy"
                      title="Video preview"
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowVideoModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={insertVideo}
                disabled={!videoUrl || !extractVideoId(videoUrl)}
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Embed Video
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Code Modal */}
      {showCodeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              💻 Insert Code
            </h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={!isInline}
                    onChange={() => setIsInline(false)}
                    className="text-emerald-500"
                  />
                  <span className="text-sm">Code Block</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={isInline}
                    onChange={() => setIsInline(true)}
                    className="text-emerald-500"
                  />
                  <span className="text-sm">Inline Code</span>
                </label>
              </div>
              {!isInline && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language
                  </label>
                  <select
                    value={codeLanguage}
                    onChange={(e) => setCodeLanguage(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  >
                    {CODE_LANGUAGES.map((lang) => (
                      <option key={lang.value} value={lang.value}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code
                </label>
                <textarea
                  value={codeContent}
                  onChange={(e) => setCodeContent(e.target.value)}
                  rows={8}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-mono text-sm bg-gray-50"
                  placeholder="Enter your code here..."
                  autoFocus
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowCodeModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={insertCode}
                disabled={!codeContent}
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Insert Code
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table Modal */}
      {showTableModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              📊 Insert Table
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rows (including header)
                </label>
                <input
                  type="number"
                  value={tableRows}
                  onChange={(e) =>
                    setTableRows(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  min="1"
                  max="20"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Columns
                </label>
                <input
                  type="number"
                  value={tableCols}
                  onChange={(e) =>
                    setTableCols(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  min="1"
                  max="10"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              {/* Table Preview */}
              <div className="border border-gray-200 rounded-lg p-3 overflow-x-auto">
                <p className="text-xs text-gray-500 mb-2">Preview:</p>
                <table className="border-collapse border border-gray-300 text-xs">
                  <tbody>
                    {Array.from({ length: Math.min(tableRows, 6) }).map(
                      (_, i) => (
                        <tr key={i}>
                          {Array.from({ length: Math.min(tableCols, 6) }).map(
                            (_, j) => (
                              <td
                                key={j}
                                className={`border border-gray-300 px-3 py-1 ${i === 0 ? "bg-gray-100 font-semibold" : ""}`}
                              >
                                {i === 0 ? `H${j + 1}` : `R${i}C${j + 1}`}
                              </td>
                            ),
                          )}
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
                {(tableRows > 6 || tableCols > 6) && (
                  <p className="text-xs text-gray-400 mt-1">
                    ...preview limited to 6×6
                  </p>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowTableModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={insertTable}
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
              >
                Insert Table
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
      `}</style>
    </div>
  );

  return editorContent;
};

export default RichTextEditor;
