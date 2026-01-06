// RichTextEditor - WYSIWYG editor with formatting options (bold, italic, links, etc.)
import { useState, useRef, useCallback, useEffect } from "react";

const ToolbarButton = ({ onClick, title, children, active = false }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={`p-2 rounded-lg transition-colors ${
      active
        ? "bg-emerald-100 text-emerald-600"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
    }`}
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
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [editorHeight, setEditorHeight] = useState(rows * 24);
  const [isResizing, setIsResizing] = useState(false);
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
      const imageHtml = `<img src="${imageUrl}" alt="${
        imageAlt || "Image"
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

  return (
    <div className="w-full">
      {/* Toolbar */}
      <div className="bg-gray-50 border border-gray-200 rounded-t-lg p-3 space-y-2">
        {/* Row 1: Text Formatting */}
        <div className="flex flex-wrap items-center gap-1">
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

      {/* Editor Content Area */}
      <div ref={containerRef} className="relative">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onFocus={handleFocus}
          onBlur={handleBlur}
          suppressContentEditableWarning={true}
          className="p-4 outline-none prose prose-lg max-w-none overflow-y-auto
            prose-headings:text-gray-900 prose-headings:font-bold prose-headings:mb-4
            prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
            prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
            prose-a:text-emerald-600 prose-a:underline
            prose-strong:text-gray-900 prose-strong:font-bold
            prose-em:text-gray-700 prose-em:italic
            prose-blockquote:border-l-4 prose-blockquote:border-emerald-500 prose-blockquote:pl-4 prose-blockquote:italic
            prose-ul:list-disc prose-ul:ml-6
            prose-ol:list-decimal prose-ol:ml-6
            prose-li:text-gray-700
            focus:ring-0 border border-gray-200 rounded-b-lg bg-white text-gray-800"
          style={{ height: editorHeight, minHeight: "200px" }}
          data-placeholder={placeholder}
        />
        {isResizing && <div className="absolute inset-0 bg-blue-50/30" />}
        <div
          onMouseDown={handleMouseDown}
          className="h-1 bg-gray-200 hover:bg-emerald-400 cursor-ns-resize rounded-b-lg transition-colors"
          title="Drag to resize editor"
        />
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
