// RichTextEditor - MS Word-like WYSIWYG editor with advanced formatting
import { useState, useRef, useCallback, useEffect } from "react";
import DOMPurify from "dompurify";

const ToolbarButton = ({ onClick, title, children, active = false, disabled = false }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    disabled={disabled}
    className={`p-2 rounded-lg transition-colors ${active
        ? "bg-emerald-100 text-emerald-600"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
  >
    {children}
  </button>
);

const Divider = () => <div className="w-px h-6 bg-gray-300 mx-1" />;

const RichTextEditor = ({
  value,
  onChange,
  placeholder = "Write your content here...",
  rows = 15,
}) => {
  const editorRef = useRef(null);
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

  // Code block state
  const [codeContent, setCodeContent] = useState("");
  const [codeLanguage, setCodeLanguage] = useState("javascript");
  const [isInline, setIsInline] = useState(false);

  // Table state
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);

  // Editor state
  const [editorHeight, setEditorHeight] = useState(rows * 24);
  const [isResizing, setIsResizing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [fontSize, setFontSize] = useState("16px");

  const lastValueRef = useRef(value);
  const isUserEditingRef = useRef(false);

  // Initialize editor content and handle external value changes
  useEffect(() => {
    if (editorRef.current) {
      const currentContent = editorRef.current.innerHTML;
      const valueChanged = value !== lastValueRef.current;
      const editorIsEmpty =
        !currentContent || currentContent === "<br>" || currentContent === "";

      if (!isUserEditingRef.current && valueChanged) {
        if (editorIsEmpty || (value && value !== currentContent)) {
          editorRef.current.innerHTML = value || "";
          lastValueRef.current = value;
        }
      }
    }
  }, [value]);

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

  const handleMouseDown = useCallback((e) => {
    if (e.target === containerRef.current) {
      const handleResizeMove = (moveEvent) => {
        const newHeight = Math.max(
          100,
          moveEvent.clientY - containerRef.current.getBoundingClientRect().top
        );
        setEditorHeight(newHeight);
      };

      const handleResizeEnd = () => {
        setIsResizing(false);
        document.removeEventListener("mousemove", handleResizeMove);
        document.removeEventListener("mouseup", handleResizeEnd);
      };

      setIsResizing(true);
      document.addEventListener("mousemove", handleResizeMove);
      document.addEventListener("mouseup", handleResizeEnd);
    }
  }, []);

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

  const handleBold = () => execCommand("bold");
  const handleItalic = () => execCommand("italic");
  const handleUnderline = () => execCommand("underline");
  const handleStrikethrough = () => execCommand("strikeThrough");

  const handleHeading = (level) => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const text = selection.toString();
      if (text) {
        execCommand("formatBlock", `<h${level}>`);
      }
    }
  };

  // Removed: getCurrentFontSize - not used in this component

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

  const handleImageClick = () => {
    setImageUrl("");
    setImageAlt("");
    setShowImageModal(true);
  };

  const insertImage = () => {
    if (imageUrl) {
      const imageHtml = `<img src="${imageUrl}" alt="${imageAlt || "Image"
        }" class="max-w-full h-auto rounded-lg my-4" />`;
      execCommand("insertHTML", imageHtml);
    }
    setShowImageModal(false);
    setImageUrl("");
    setImageAlt("");
  };

  const handleBulletList = () => execCommand("insertUnorderedList");
  const handleNumberedList = () => execCommand("insertOrderedList");
  const handleBlockquote = () => execCommand("formatBlock", "<blockquote>");
  const handleHorizontalRule = () => execCommand("insertHorizontalRule");
  const handleClearFormatting = () => execCommand("removeFormat");

  const handleIndent = () => execCommand("indent");
  const handleOutdent = () => execCommand("outdent");

  const handleTextColor = (color) => execCommand("foreColor", color);
  const handleHighlight = (color) => execCommand("hiliteColor", color);

  // Text alignment
  const handleAlign = (alignment) => execCommand("justify" + alignment);

  // Font size
  const handleFontSize = (size) => {
    setFontSize(size);
    execCommand("fontSize", "7");
    const fontElements = editorRef.current.querySelectorAll('font[size="7"]');
    fontElements.forEach((element) => {
      element.removeAttribute("size");
      element.style.fontSize = size;
    });
  };

  // Code block insertion
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
      const codeHtml = `<pre class="code-block bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4"><code class="language-${codeLanguage}">${codeContent}</code></pre>`;
      execCommand("insertHTML", codeHtml);
    }
    setShowCodeModal(false);
    setCodeContent("");
  };

  // Table insertion
  const handleTableClick = () => {
    setTableRows(3);
    setTableCols(3);
    setShowTableModal(true);
  };

  const insertTable = () => {
    let tableHtml = '<table class="border-collapse border border-gray-300 w-full my-4"><tbody>';
    for (let i = 0; i < tableRows; i++) {
      tableHtml += '<tr>';
      for (let j = 0; j < tableCols; j++) {
        tableHtml += '<td class="border border-gray-300 px-4 py-2">Cell</td>';
      }
      tableHtml += '</tr>';
    }
    tableHtml += '</tbody></table><p><br></p>';
    execCommand("insertHTML", tableHtml);
    setShowTableModal(false);
  };

  // Word and character count
  const getStats = () => {
    if (!value) return { words: 0, chars: 0, charsNoSpaces: 0 };
    const text = value.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ');
    const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
    const chars = text.length;
    const charsNoSpaces = text.replace(/\s/g, '').length;
    return { words, chars, charsNoSpaces };
  };

  const stats = getStats();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!editorRef.current?.contains(document.activeElement)) return;

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      if (modKey) {
        switch (e.key.toLowerCase()) {
          case 'b':
            e.preventDefault();
            handleBold();
            break;
          case 'i':
            e.preventDefault();
            handleItalic();
            break;
          case 'u':
            e.preventDefault();
            handleUnderline();
            break;
          case 'k':
            e.preventDefault();
            handleLinkClick();
            break;
          default:
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="w-full">
      {/* Toolbar - MS Word Style */}
      <div className="bg-gradient-to-b from-gray-50 to-gray-100 border border-gray-300 rounded-t-lg shadow-sm">
        {/* Preview Toggle */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPreview(false)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${!showPreview
                  ? "bg-white text-emerald-600 shadow-sm"
                  : "text-gray-600 hover:bg-gray-100"
                }`}
            >
              ✏️ Edit
            </button>
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${showPreview
                  ? "bg-white text-emerald-600 shadow-sm"
                  : "text-gray-600 hover:bg-gray-100"
                }`}
            >
              👁️ Preview
            </button>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <span>Words: <strong>{stats.words}</strong></span>
            <span>Characters: <strong>{stats.chars}</strong></span>
          </div>
        </div>

        {!showPreview && (
          <div className="p-3 space-y-2">
            {/* Row 1: Text Formatting */}
            <div className="flex flex-wrap items-center gap-1">
              {/* Font Size */}
              <select
                value={fontSize}
                onChange={(e) => handleFontSize(e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                title="Font Size"
              >
                <option value="12px">Small</option>
                <option value="16px">Normal</option>
                <option value="20px">Large</option>
                <option value="24px">Huge</option>
              </select>
              <Divider />
              <ToolbarButton onClick={handleBold} title="Bold (Ctrl+B)">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M15.6 10.79c.97-.67 1.6-1.78 1.6-3.04 0-2.49-2.01-4.5-4.5-4.5H7v12h5.1c2.49 0 4.5-2.01 4.5-4.5 0-1.95-1.29-3.63-3-4.26zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z" />
                </svg>
              </ToolbarButton>
              <ToolbarButton onClick={handleItalic} title="Italic (Ctrl+I)">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z" />
                </svg>
              </ToolbarButton>
              <ToolbarButton onClick={handleUnderline} title="Underline (Ctrl+U)">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 5c0 1.1 0 2 0 2v7c0 3.31 2.69 6 6 6s6-2.69 6-6v-7c0 0 0-.9 0-2m8 14H8c-2.2 0-4-1.8-4-4v-7H2v7c0 3.3 2.7 6 6 6h6c3.3 0 6-2.7 6-6v-7h-2v7c0 2.2-1.8 4-4 4z" />
                </svg>
              </ToolbarButton>
              <ToolbarButton onClick={handleStrikethrough} title="Strikethrough">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10 19h8v-2h-8v2zm0-8h12v-2H10v2zm0-6H2v2h8V5zm8.46-2.65c.4-.45.72-1.05.72-1.69 0-2.18-1.78-3.96-3.96-3.96-2.18 0-3.96 1.78-3.96 3.96v1h2v-1c0-1.09.887-1.96 1.96-1.96 1.08 0 1.96.87 1.96 1.96 0 .61-.34 1.14-.85 1.42H18.5c.3-.32.46-.73.46-1.17zM7.73 13.57c-.24.55-.36 1.15-.36 1.77 0 2.18 1.78 3.96 3.96 3.96 2.18 0 3.96-1.78 3.96-3.96v-1h-2v1c0 1.09-.88 1.96-1.96 1.96-1.09 0-1.96-.87-1.96-1.96 0-.63.13-1.23.37-1.78L7.73 13.57z" />
                </svg>
              </ToolbarButton>
              <Divider />
              <ToolbarButton onClick={() => handleHeading(1)} title="Heading 1">
                <span className="text-sm font-bold">H1</span>
              </ToolbarButton>
              <ToolbarButton onClick={() => handleHeading(2)} title="Heading 2">
                <span className="text-sm font-bold">H2</span>
              </ToolbarButton>
              <ToolbarButton onClick={() => handleHeading(3)} title="Heading 3">
                <span className="text-sm font-bold">H3</span>
              </ToolbarButton>
              <Divider />
              {/* Alignment */}
              <ToolbarButton onClick={() => handleAlign("Left")} title="Align Left">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 21h18v-2H3v2zm0-4h12v-2H3v2zm0-4h18v-2H3v2zm0-4h12V7H3v2zm0-6v2h18V3H3z" />
                </svg>
              </ToolbarButton>
              <ToolbarButton onClick={() => handleAlign("Center")} title="Align Center">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 15v2h10v-2H7zm-4 6h18v-2H3v2zm0-8h18v-2H3v2zm4-6v2h10V7H7zM3 3v2h18V3H3z" />
                </svg>
              </ToolbarButton>
              <ToolbarButton onClick={() => handleAlign("Right")} title="Align Right">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 21h18v-2H3v2zm6-4h12v-2H9v2zm-6-4h18v-2H3v2zm6-4h12V7H9v2zM3 3v2h18V3H3z" />
                </svg>
              </ToolbarButton>
              <ToolbarButton onClick={() => handleAlign("Full")} title="Justify">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 21h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18V7H3v2zm0-6v2h18V3H3z" />
                </svg>
              </ToolbarButton>
            </div>

            {/* Row 2: Lists and Layout */}
            <div className="flex flex-wrap items-center gap-1">
              <ToolbarButton onClick={handleBulletList} title="Bullet List">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6C3.17 4.5 2.5 5.17 2.5 6s.67 1.5 1.5 1.5S5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.67 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z" />
                </svg>
              </ToolbarButton>
              <ToolbarButton onClick={handleNumberedList} title="Numbered List">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-4h1V9H2v1h1v4zm-1-8h1.8L2 5.1v.9zm5 16h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z" />
                </svg>
              </ToolbarButton>
              <ToolbarButton onClick={handleBlockquote} title="Blockquote">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
                </svg>
              </ToolbarButton>
              <ToolbarButton onClick={handleHorizontalRule} title="Horizontal Rule">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 13H5v-2h14v2z" />
                </svg>
              </ToolbarButton>
              <Divider />
              <ToolbarButton onClick={handleLinkClick} title="Add Link">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
                </svg>
              </ToolbarButton>
              <ToolbarButton onClick={handleImageClick} title="Insert Image">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                </svg>
              </ToolbarButton>
              <ToolbarButton onClick={handleCodeClick} title="Insert Code">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" />
                </svg>
              </ToolbarButton>
              <ToolbarButton onClick={handleTableClick} title="Insert Table">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10 10.02h5V21h-5zM17 21h3c1.1 0 2-.9 2-2v-9h-5v11zm3-18H5c-1.1 0-2 .9-2 2v3h19V5c0-1.1-.9-2-2-2zM3 19c0 1.1.9 2 2 2h3V10.02H3V19z" />
                </svg>
              </ToolbarButton>
            </div>

            {/* Row 3: Colors and Clear */}
            <div className="flex flex-wrap items-center gap-1">
              <ToolbarButton
                onClick={() => handleTextColor("red")}
                title="Text Color"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-5 11h-4v4H8v-4H4v-2h4V7h2v4h4v2z" />
                </svg>
              </ToolbarButton>
              <ToolbarButton
                onClick={() => handleHighlight("yellow")}
                title="Highlight"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.75 7L14 3.25l-10 10V17h3.75L17.75 7zm2.96-2.96c.39-.39.39-1.02 0-1.41L18.37.29c-.39-.39-1.02-.39-1.41 0L15.13 2.12 18.88 5.87z" />
                </svg>
              </ToolbarButton>
              <Divider />
              <ToolbarButton onClick={handleIndent} title="Indent">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 21h18v-2H3v2zm9-4h12v-2H12v2zm0-4h12V9H12v4zM3 5v14h2V5H3zm6 8h12v-2H9v2zm0-4h12V7H9v2z" />
                </svg>
              </ToolbarButton>
              <ToolbarButton onClick={handleOutdent} title="Outdent">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 21h18v-2H3v2zm6-4h12v-2H9v2zm0-4h12V9H9v4zM3 5v14h2V5H3zm6 8h12v-2H9v2zm0-4h12V7H9v2z" />
                </svg>
              </ToolbarButton>
              <ToolbarButton
                onClick={handleClearFormatting}
                title="Clear Formatting"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3.27 5L2 6.27l8.29 8.29H7v2h7v-7h-2v3.29L19.73 21 21 19.73 3.27 5z" />
                </svg>
              </ToolbarButton>
            </div>
          </div>
        )}
      </div>

      {/* Editor Content Area */}
      <div ref={containerRef} className="relative">
        {showPreview ? (
          <div
            className="p-6 prose prose-lg max-w-none overflow-y-auto
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
              border border-gray-200 bg-white min-h-[400px]"
            style={{ height: editorHeight, minHeight: "400px" }}
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(value || "<p class='text-gray-400'>Nothing to preview yet. Start writing!</p>", {
                ALLOWED_TAGS: ['p', 'br', 'b', 'i', 'u', 'strong', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'blockquote', 'hr', 'img', 'span', 'div', 'pre', 'code', 'table', 'thead', 'tbody', 'tr', 'th', 'td'],
                ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'class', 'style'],
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
            suppressContentEditableWarning={true}
            className="p-6 outline-none prose prose-lg max-w-none overflow-y-auto
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
              focus:ring-2 focus:ring-emerald-500 border border-gray-200 bg-white text-gray-800"
            style={{ height: editorHeight, minHeight: "400px", fontSize }}
            data-placeholder={placeholder}
          />
        )}
        {isResizing && <div className="absolute inset-0 bg-blue-50/30" />}
        {!showPreview && (
          <div
            onMouseDown={handleMouseDown}
            className="h-1 bg-gray-200 hover:bg-emerald-400 cursor-ns-resize transition-colors"
            title="Drag to resize editor"
          />
        )}
      </div>

      {/* Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Add Link</h3>

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
                  dir="ltr"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                  placeholder="https://example.com"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowLinkModal(false);
                  setLinkUrl("");
                  setLinkText("");
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={insertLink}
                disabled={!linkUrl || !linkText}
                className="px-4 py-2 bg-linear-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Insert Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Insert Image
            </h3>

            <div className="space-y-4">
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
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alt Text
                </label>
                <input
                  type="text"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                  placeholder="Describe the image"
                  dir="ltr"
                />
              </div>

              {imageUrl && (
                <div className="border border-gray-200 rounded-lg p-2">
                  <p className="text-xs text-gray-500 mb-2">Preview:</p>
                  <img
                    src={imageUrl}
                    alt={imageAlt || "Preview"}
                    className="max-w-full h-auto max-h-32 rounded object-contain mx-auto"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={insertImage}
                disabled={!imageUrl}
                className="px-4 py-2 bg-linear-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Insert Image
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Code Block Modal */}
      {showCodeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl mx-4 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Insert Code</h3>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={!isInline}
                    onChange={() => setIsInline(false)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Code Block</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={isInline}
                    onChange={() => setIsInline(true)}
                    className="w-4 h-4"
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
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="csharp">C#</option>
                    <option value="cpp">C++</option>
                    <option value="html">HTML</option>
                    <option value="css">CSS</option>
                    <option value="sql">SQL</option>
                    <option value="bash">Bash</option>
                    <option value="json">JSON</option>
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-emerald-500"
                  placeholder="Paste your code here..."
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
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50"
              >
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
            <h3 className="text-lg font-bold text-gray-900 mb-4">Insert Table</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rows
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Columns
                </label>
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
};

export default RichTextEditor;
