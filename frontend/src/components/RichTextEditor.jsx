// RichTextEditor - Enhanced MS Word-like WYSIWYG editor
// Features: Auto-expand, Image upload, MS Word paste support, Improved toolbar
import { useState, useRef, useCallback, useEffect } from "react";
import DOMPurify from "dompurify";

// Toolbar Button Component
const ToolbarButton = ({ onClick, title, children, active = false, disabled = false }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    disabled={disabled}
    className={`p-2 rounded-lg transition-all duration-200 flex items-center justify-center min-w-[36px] min-h-[36px] ${active
      ? "bg-emerald-500 text-white shadow-md"
      : "text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 border border-transparent hover:border-emerald-200"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
  >
    {children}
  </button>
);

// Toolbar Group Component
const ToolbarGroup = ({ children, label }) => (
  <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-lg border border-gray-200">
    {label && <span className="text-[10px] text-gray-500 mr-1 font-medium uppercase">{label}</span>}
    {children}
  </div>
);

const RichTextEditor = ({
  value,
  onChange,
  placeholder = "Start writing your blog content here... You can paste from MS Word!",
}) => {
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const containerRef = useRef(null);

  // Modals
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);

  // Link state
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");

  // Image state
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMethod, setUploadMethod] = useState("upload"); // "upload" or "url"

  // Code block state
  const [codeContent, setCodeContent] = useState("");
  const [codeLanguage, setCodeLanguage] = useState("javascript");
  const [isInline, setIsInline] = useState(false);

  // Table state
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);

  // Editor state
  const [showPreview, setShowPreview] = useState(false);
  const [fontSize, setFontSize] = useState("16px");
  const [editorHeight, setEditorHeight] = useState(400); // Default height in pixels
  const [isResizing, setIsResizing] = useState(false);

  const lastValueRef = useRef(value);
  const isUserEditingRef = useRef(false);

  // Initialize editor content and restore when switching from Preview to Edit
  useEffect(() => {
    if (editorRef.current && !showPreview) {
      // Always restore content when switching back to edit mode
      const currentContent = editorRef.current.innerHTML;
      const valueChanged = value !== lastValueRef.current;
      const editorIsEmpty = !currentContent || currentContent === "<br>" || currentContent === "";

      // Restore content if editor is empty or value changed
      if (editorIsEmpty || valueChanged || value !== currentContent) {
        editorRef.current.innerHTML = value || "";
        lastValueRef.current = value;
      }
    }
  }, [value, showPreview]); // Added showPreview dependency to restore content when switching modes

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

  // Manual resize handler - drag to resize
  const handleResizeMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsResizing(true);
    const startY = e.clientY;
    const startHeight = editorHeight;

    const handleMouseMove = (moveEvent) => {
      const delta = moveEvent.clientY - startY;
      const newHeight = Math.max(200, startHeight + delta); // Min 200px
      setEditorHeight(newHeight);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [editorHeight]);

  // MS Word Paste Handler - Preserves formatting
  const handlePaste = useCallback((e) => {
    e.preventDefault();

    // Try to get HTML content first (preserves MS Word formatting)
    let pastedContent = e.clipboardData.getData("text/html");

    if (pastedContent) {
      // Clean up MS Word specific tags and styles but preserve structure
      pastedContent = cleanWordHTML(pastedContent);
    } else {
      // Fallback to plain text
      pastedContent = e.clipboardData.getData("text/plain");
      // Convert plain text line breaks to HTML
      pastedContent = pastedContent
        .split("\n\n")
        .map(p => `<p>${p.replace(/\n/g, "<br>")}</p>`)
        .join("");
    }

    // Insert the cleaned content
    document.execCommand("insertHTML", false, pastedContent);
    handleInput();
  }, [handleInput]);

  // Clean MS Word HTML while preserving formatting
  const cleanWordHTML = (html) => {
    // Remove Word-specific XML and comments
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

    // Keep important attributes but remove Word-specific ones
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
          const sizes = { 1: "10px", 2: "13px", 3: "16px", 4: "18px", 5: "24px", 6: "32px", 7: "48px" };
          style += `font-size:${sizes[sizeMatch[1]] || "16px"};`;
        }
        return style ? `<span style="${style}">` : "<span>";
      })
      .replace(/<\/font>/gi, "</span>");

    // Sanitize while keeping safe tags
    return DOMPurify.sanitize(cleaned, {
      ALLOWED_TAGS: [
        "p", "br", "span", "div",
        "b", "strong", "i", "em", "u", "s", "strike", "del", "sub", "sup", "mark",
        "h1", "h2", "h3", "h4", "h5", "h6",
        "ul", "ol", "li",
        "a", "img",
        "blockquote", "hr",
        "pre", "code",
        "table", "thead", "tbody", "tfoot", "tr", "th", "td",
      ],
      ALLOWED_ATTR: ["href", "target", "rel", "src", "alt", "class", "style", "width", "height", "colspan", "rowspan"],
      ALLOW_DATA_ATTR: false,
    });
  };

  const execCommand = useCallback(
    (command, value = null) => {
      if (editorRef.current) {
        editorRef.current.focus();
        document.execCommand(command, false, value);
        handleInput();
      }
    },
    [handleInput]
  );

  // Text formatting
  const handleBold = () => execCommand("bold");
  const handleItalic = () => execCommand("italic");
  const handleUnderline = () => execCommand("underline");
  const handleStrikethrough = () => execCommand("strikeThrough");

  const handleHeading = (level) => {
    execCommand("formatBlock", `<h${level}>`);
  };

  // Link handling
  const handleLinkClick = () => {
    const selection = window.getSelection();
    const selectedText = selection.toString();
    if (selectedText) {
      setLinkText(selectedText);
      setLinkUrl("");
      setShowLinkModal(true);
    } else {
      alert("Please select text first to add a link");
    }
  };

  const insertLink = () => {
    if (linkUrl && linkText) {
      const linkHtml = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer" class="text-emerald-600 underline hover:text-emerald-700">${linkText}</a>`;
      execCommand("insertHTML", linkHtml);
    }
    setShowLinkModal(false);
    setLinkUrl("");
    setLinkText("");
  };

  // Image handling - with file upload support
  const handleImageClick = () => {
    setImageUrl("");
    setImageAlt("");
    setImageFile(null);
    setImagePreview("");
    setUploadMethod("upload");
    setShowImageModal(true);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert("Image size should be less than 5MB");
        return;
      }
      setImageFile(file);
      // Create preview
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
        // Convert to base64 for inline embedding (works without server upload)
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
      const imageHtml = `<img src="${finalImageUrl}" alt="${imageAlt || "Blog image"}" class="max-w-full h-auto rounded-lg my-4 shadow-md" style="max-width: 100%;" />`;
      execCommand("insertHTML", imageHtml);
    }

    setShowImageModal(false);
    setImageUrl("");
    setImageAlt("");
    setImageFile(null);
    setImagePreview("");
  };

  // Lists and formatting
  const handleBulletList = () => execCommand("insertUnorderedList");
  const handleNumberedList = () => execCommand("insertOrderedList");
  const handleBlockquote = () => execCommand("formatBlock", "<blockquote>");
  const handleHorizontalRule = () => execCommand("insertHorizontalRule");
  const handleClearFormatting = () => execCommand("removeFormat");
  const handleIndent = () => execCommand("indent");
  const handleOutdent = () => execCommand("outdent");

  // Color options for text color picker
  const colors = ["#000000", "#dc2626", "#ea580c", "#ca8a04", "#16a34a", "#0891b2", "#2563eb", "#7c3aed", "#db2777"];

  // Save selection (called when user clicks in editor)
  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      savedSelectionRef.current = selection.getRangeAt(0);
    }
  };

  // Restore previously saved selection
  const restoreSelection = () => {
    if (savedSelectionRef.current) {
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(savedSelectionRef.current);
    }
  };

  const handleTextColor = (color) => {
    restoreSelection(); // Restore selection before applying color
    execCommand("foreColor", color);
    editorRef.current?.focus(); // Return focus to editor
  };
  const handleHighlight = (color) => execCommand("hiliteColor", color);
  const handleAlign = (alignment) => execCommand("justify" + alignment);

  const handleFontSize = (size) => {
    setFontSize(size);
    execCommand("fontSize", "7");
    const fontElements = editorRef.current.querySelectorAll('font[size="7"]');
    fontElements.forEach((element) => {
      element.removeAttribute("size");
      element.style.fontSize = size;
    });
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
      const codeHtml = `<code class="inline-code bg-gray-100 text-red-600 px-2 py-1 rounded text-sm font-mono">${codeContent}</code>`;
      execCommand("insertHTML", codeHtml);
    } else {
      const escapedCode = codeContent.replace(/</g, "&lt;").replace(/>/g, "&gt;");
      const uniqueId = `code-${Date.now()}`;
      // Create code block with header (language + copy button) like AI tools
      const codeHtml = `
        <div class="code-block-wrapper my-4 rounded-lg overflow-hidden border border-gray-700" contenteditable="false">
          <div class="code-block-header bg-gray-800 px-4 py-2 flex items-center justify-between border-b border-gray-700">
            <span class="text-gray-400 text-xs font-medium uppercase tracking-wide">${codeLanguage}</span>
            <button onclick="navigator.clipboard.writeText(document.getElementById('${uniqueId}').innerText).then(() => { this.innerHTML='✓ Copied!'; setTimeout(() => this.innerHTML='📋 Copy', 2000); })" class="copy-code-btn text-gray-400 hover:text-white text-xs px-2 py-1 rounded hover:bg-gray-700 transition-all flex items-center gap-1">
              📋 Copy
            </button>
          </div>
          <pre class="code-block bg-gray-900 text-gray-100 p-4 m-0 overflow-x-auto"><code id="${uniqueId}" class="language-${codeLanguage}">${escapedCode}</code></pre>
        </div>
      `;
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
    let tableHtml = '<table class="border-collapse border border-gray-300 w-full my-4"><tbody>';
    for (let i = 0; i < tableRows; i++) {
      tableHtml += "<tr>";
      for (let j = 0; j < tableCols; j++) {
        if (i === 0) {
          tableHtml += '<th class="border border-gray-300 px-4 py-2 bg-gray-100 font-semibold">Header</th>';
        } else {
          tableHtml += '<td class="border border-gray-300 px-4 py-2">Cell</td>';
        }
      }
      tableHtml += "</tr>";
    }
    tableHtml += "</tbody></table>";
    execCommand("insertHTML", tableHtml);
    setShowTableModal(false);
  };

  // Stats
  const getStats = () => {
    if (!value) return { words: 0, chars: 0 };
    const text = value.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ");
    const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
    const chars = text.length;
    return { words, chars };
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
          case "b": e.preventDefault(); handleBold(); break;
          case "i": e.preventDefault(); handleItalic(); break;
          case "u": e.preventDefault(); handleUnderline(); break;
          case "k": e.preventDefault(); handleLinkClick(); break;
          default: break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="w-full">
      {/* Toolbar */}
      <div className="bg-white border-2 border-gray-200 rounded-t-xl shadow-sm sticky top-0 z-10">
        {/* Top Bar - Mode Switch & Stats */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowPreview(false)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${!showPreview
                ? "bg-emerald-500 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
            >
              ✏️ Edit
            </button>
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${showPreview
                ? "bg-emerald-500 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
            >
              👁️ Preview
            </button>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-500">Words: <strong className="text-gray-700">{stats.words}</strong></span>
            <span className="text-gray-500">Characters: <strong className="text-gray-700">{stats.chars}</strong></span>
          </div>
        </div>

        {/* Toolbar Rows - Only show in edit mode */}
        {!showPreview && (
          <div className="p-3 space-y-3">
            {/* Row 1: Text Formatting */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Font Size */}
              <select
                value={fontSize}
                onChange={(e) => handleFontSize(e.target.value)}
                className="px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white font-medium"
                title="Font Size"
              >
                <option value="12px">Small (12px)</option>
                <option value="16px">Normal (16px)</option>
                <option value="20px">Large (20px)</option>
                <option value="24px">Huge (24px)</option>
                <option value="32px">Giant (32px)</option>
              </select>

              {/* Text Style */}
              <ToolbarGroup label="Style">
                <ToolbarButton onClick={handleBold} title="Bold (Ctrl+B)">
                  <span className="font-bold text-base">B</span>
                </ToolbarButton>
                <ToolbarButton onClick={handleItalic} title="Italic (Ctrl+I)">
                  <span className="italic text-base">I</span>
                </ToolbarButton>
                <ToolbarButton onClick={handleUnderline} title="Underline (Ctrl+U)">
                  <span className="underline text-base">U</span>
                </ToolbarButton>
                <ToolbarButton onClick={handleStrikethrough} title="Strikethrough">
                  <span className="line-through text-base">S</span>
                </ToolbarButton>
              </ToolbarGroup>

              {/* Headings */}
              <ToolbarGroup label="Heading">
                <ToolbarButton onClick={() => handleHeading(1)} title="Heading 1">
                  <span className="font-bold text-sm">H1</span>
                </ToolbarButton>
                <ToolbarButton onClick={() => handleHeading(2)} title="Heading 2">
                  <span className="font-bold text-sm">H2</span>
                </ToolbarButton>
                <ToolbarButton onClick={() => handleHeading(3)} title="Heading 3">
                  <span className="font-bold text-sm">H3</span>
                </ToolbarButton>
              </ToolbarGroup>

              {/* Alignment */}
              <ToolbarGroup label="Align">
                <ToolbarButton onClick={() => handleAlign("Left")} title="Align Left">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 21h18v-2H3v2zm0-4h12v-2H3v2zm0-4h18v-2H3v2zm0-4h12V7H3v2zm0-6v2h18V3H3z" />
                  </svg>
                </ToolbarButton>
                <ToolbarButton onClick={() => handleAlign("Center")} title="Align Center">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 15v2h10v-2H7zm-4 6h18v-2H3v2zm0-8h18v-2H3v2zm4-6v2h10V7H7zM3 3v2h18V3H3z" />
                  </svg>
                </ToolbarButton>
                <ToolbarButton onClick={() => handleAlign("Right")} title="Align Right">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 21h18v-2H3v2zm6-4h12v-2H9v2zm-6-4h18v-2H3v2zm6-4h12V7H9v2zM3 3v2h18V3H3z" />
                  </svg>
                </ToolbarButton>
                <ToolbarButton onClick={() => handleAlign("Full")} title="Justify">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 21h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18V7H3v2zm0-6v2h18V3H3z" />
                  </svg>
                </ToolbarButton>
              </ToolbarGroup>
            </div>

            {/* Row 2: Lists, Insert & Colors */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Lists */}
              <ToolbarGroup label="Lists">
                <ToolbarButton onClick={handleBulletList} title="Bullet List">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6C3.17 4.5 2.5 5.17 2.5 6s.67 1.5 1.5 1.5S5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.67 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z" />
                  </svg>
                </ToolbarButton>
                <ToolbarButton onClick={handleNumberedList} title="Numbered List">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-4h1V9H2v1h1v4zm-1-8h1.8L2 5.1v.9zm5 16h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z" />
                  </svg>
                </ToolbarButton>
                <ToolbarButton onClick={handleBlockquote} title="Quote">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
                  </svg>
                </ToolbarButton>
              </ToolbarGroup>

              {/* Insert */}
              <ToolbarGroup label="Insert">
                <ToolbarButton onClick={handleLinkClick} title="Add Link (Ctrl+K)">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
                  </svg>
                </ToolbarButton>
                <ToolbarButton onClick={handleImageClick} title="Insert Image">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                  </svg>
                </ToolbarButton>
                <ToolbarButton onClick={handleTableClick} title="Insert Table">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM8 20H4v-4h4v4zm0-6H4v-4h4v4zm0-6H4V4h4v4zm6 12h-4v-4h4v4zm0-6h-4v-4h4v4zm0-6h-4V4h4v4zm6 12h-4v-4h4v4zm0-6h-4v-4h4v4zm0-6h-4V4h4v4z" />
                  </svg>
                </ToolbarButton>
                <ToolbarButton onClick={handleCodeClick} title="Insert Code">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" />
                  </svg>
                </ToolbarButton>
                <ToolbarButton onClick={handleHorizontalRule} title="Horizontal Line">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 13H5v-2h14v2z" />
                  </svg>
                </ToolbarButton>
              </ToolbarGroup>

              {/* Colors */}
              <ToolbarGroup label="Color">
                <div className="flex gap-0.5">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleTextColor(color)}
                      title={`Text color: ${color}`}
                      className="w-5 h-5 rounded-full border border-gray-300 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </ToolbarGroup>

              {/* Utilities */}
              <ToolbarGroup label="Format">
                <ToolbarButton onClick={handleIndent} title="Increase Indent">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 21h18v-2H3v2zM3 8v8l4-4-4-4zm8 9h10v-2H11v2zm0-4h10v-2H11v2zm0-4h10V7H11v2zM3 3v2h18V3H3z" />
                  </svg>
                </ToolbarButton>
                <ToolbarButton onClick={handleOutdent} title="Decrease Indent">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11 17h10v-2H11v2zm-8-5l4 4V8l-4 4zm0 9h18v-2H3v2zM3 3v2h18V3H3zm8 6h10V7H11v2zm0 4h10v-2H11v2z" />
                  </svg>
                </ToolbarButton>
                <ToolbarButton onClick={handleClearFormatting} title="Clear Formatting">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3.27 5L2 6.27l6.97 6.97L6.5 19h3l1.57-3.66L16.73 21 18 19.73 3.27 5zM6 5v.18L8.82 8h2.4l-.72 1.68 2.1 2.1L14.21 8H20V5H6z" />
                  </svg>
                </ToolbarButton>
              </ToolbarGroup>
            </div>
          </div>
        )}
      </div>

      {/* Editor Content Area - Auto-expanding */}
      <div ref={containerRef} className="relative">
        {showPreview ? (
          <div
            className="p-8 prose prose-lg max-w-none overflow-y-auto
              prose-headings:text-gray-900 prose-headings:font-bold prose-headings:mb-4 prose-headings:mt-6
              prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
              prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
              prose-a:text-emerald-600 prose-a:underline hover:prose-a:text-emerald-800
              prose-strong:text-gray-900 prose-strong:font-bold
              prose-em:italic prose-em:text-gray-800
              prose-ul:list-disc prose-ul:ml-6 prose-ul:mb-4
              prose-ol:list-decimal prose-ol:ml-6 prose-ol:mb-4
              prose-li:text-gray-700
              prose-blockquote:border-l-4 prose-blockquote:border-emerald-500 prose-blockquote:pl-4 prose-blockquote:py-2 prose-blockquote:italic prose-blockquote:bg-emerald-50
              prose-code:bg-gray-100 prose-code:text-red-600 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm
              prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto
              prose-table:w-full prose-table:border-collapse
              prose-th:border prose-th:border-gray-300 prose-th:px-4 prose-th:py-2 prose-th:bg-gray-100
              prose-td:border prose-td:border-gray-300 prose-td:px-4 prose-td:py-2
              prose-img:rounded-xl prose-img:shadow-lg
              prose-hr:border-gray-300 prose-hr:my-6
              border-2 border-t-0 border-gray-200 bg-white min-h-[500px] rounded-b-xl"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(value || "<p class='text-gray-400'>Nothing to preview yet. Start writing!</p>", {
                ALLOWED_TAGS: [
                  "p", "br", "span", "div",
                  "b", "strong", "i", "em", "u", "s", "strike", "del", "sub", "sup", "mark",
                  "h1", "h2", "h3", "h4", "h5", "h6",
                  "ul", "ol", "li",
                  "a", "img",
                  "blockquote", "hr",
                  "pre", "code",
                  "table", "thead", "tbody", "tfoot", "tr", "th", "td",
                  "font", "button"
                ],
                ALLOWED_ATTR: ["href", "target", "rel", "src", "alt", "class", "style", "width", "height", "color", "size", "face", "colspan", "rowspan", "align", "valign", "id", "onclick", "contenteditable"],
              })
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
            className="p-8 outline-none prose prose-lg max-w-none
              prose-headings:text-gray-900 prose-headings:font-bold prose-headings:mb-4
              prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
              prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
              prose-a:text-emerald-600 prose-a:underline
              prose-strong:text-gray-900 prose-strong:font-bold
              prose-em:text-gray-700 prose-em:italic
              prose-blockquote:border-l-4 prose-blockquote:border-emerald-500 prose-blockquote:pl-4 prose-blockquote:italic
              prose-code:bg-gray-100 prose-code:text-red-600 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm
              prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-4 prose-pre:rounded-lg
              prose-ul:list-disc prose-ul:ml-6
              prose-ol:list-decimal prose-ol:ml-6
              prose-li:text-gray-700
              prose-table:w-full prose-table:border-collapse
              prose-th:border prose-th:border-gray-300 prose-th:px-4 prose-th:py-2 prose-th:bg-gray-100
              prose-td:border prose-td:border-gray-300 prose-td:px-4 prose-td:py-2
              focus:ring-2 focus:ring-emerald-500 border-2 border-t-0 border-gray-200 bg-white text-gray-800"
            style={{ minHeight: `${editorHeight}px`, fontSize }}
            data-placeholder={placeholder}
          />
        )}

        {/* Resize Handle - Drag to resize editor */}
        {!showPreview && (
          <div
            onMouseDown={handleResizeMouseDown}
            className={`h-3 bg-gray-100 border-2 border-t-0 border-gray-200 rounded-b-xl cursor-ns-resize flex items-center justify-center hover:bg-emerald-100 transition-colors ${isResizing ? 'bg-emerald-200' : ''}`}
            title="Drag to resize editor"
          >
            <div className="flex gap-1">
              <div className="w-8 h-1 bg-gray-300 rounded-full" />
            </div>
          </div>
        )}
      </div>

      {/* Paste from Word hint */}
      {!showPreview && !value && (
        <div className="text-center py-4 text-sm text-gray-500 bg-gray-50 border-t border-gray-200">
          💡 <strong>Tip:</strong> You can paste directly from MS Word and the formatting will be preserved!
        </div>
      )}

      {/* Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">🔗 Add Link</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Link Text</label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                  placeholder="e.g., Click here"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">URL</label>
                <input
                  type="text"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                  placeholder="https://example.com"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button type="button" onClick={() => setShowLinkModal(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                Cancel
              </button>
              <button type="button" onClick={insertLink} className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600">
                Add Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal - Enhanced with file upload */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">🖼️ Insert Image</h3>

            {/* Upload Method Toggle */}
            <div className="flex gap-2 mb-6">
              <button
                type="button"
                onClick={() => setUploadMethod("upload")}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${uploadMethod === "upload"
                  ? "bg-emerald-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
              >
                📁 Upload from Device
              </button>
              <button
                type="button"
                onClick={() => setUploadMethod("url")}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${uploadMethod === "url"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Image File</label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all"
                  >
                    {imagePreview ? (
                      <div>
                        <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded-lg shadow-md" />
                        <p className="text-sm text-gray-500 mt-2">Click to change image</p>
                      </div>
                    ) : (
                      <div>
                        <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="mt-2 text-sm text-gray-600">Click to select an image</p>
                        <p className="text-xs text-gray-400">Max 5MB, JPG/PNG/GIF/WebP</p>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Alt Text (SEO)</label>
                <input
                  type="text"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                  placeholder="Describe the image for accessibility"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button type="button" onClick={() => setShowImageModal(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                Cancel
              </button>
              <button
                type="button"
                onClick={insertImage}
                disabled={isUploading || (uploadMethod === "upload" ? !imageFile : !imageUrl)}
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? "Processing..." : "Insert Image"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Code Modal */}
      {showCodeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">💻 Insert Code</h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input type="radio" checked={!isInline} onChange={() => setIsInline(false)} className="text-emerald-500" />
                  <span className="text-sm">Code Block</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" checked={isInline} onChange={() => setIsInline(true)} className="text-emerald-500" />
                  <span className="text-sm">Inline Code</span>
                </label>
              </div>
              {!isInline && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                  <select
                    value={codeLanguage}
                    onChange={(e) => setCodeLanguage(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="html">HTML</option>
                    <option value="css">CSS</option>
                    <option value="java">Java</option>
                    <option value="csharp">C#</option>
                    <option value="php">PHP</option>
                    <option value="sql">SQL</option>
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Code</label>
                <textarea
                  value={codeContent}
                  onChange={(e) => setCodeContent(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-mono text-sm"
                  placeholder="Enter your code here..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button type="button" onClick={() => setShowCodeModal(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                Cancel
              </button>
              <button type="button" onClick={insertCode} className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600">
                Insert Code
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table Modal */}
      {showTableModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">📊 Insert Table</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rows</label>
                <input
                  type="number"
                  value={tableRows}
                  onChange={(e) => setTableRows(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  max="20"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Columns</label>
                <input
                  type="number"
                  value={tableCols}
                  onChange={(e) => setTableCols(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  max="10"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button type="button" onClick={() => setShowTableModal(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                Cancel
              </button>
              <button type="button" onClick={insertTable} className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600">
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
};

export default RichTextEditor;
