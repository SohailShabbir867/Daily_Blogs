// Blog details page - displays full article content
import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";
import SEO from "../components/SEO";
import { useAuth } from "../context/AuthContext";
import {
  getBlogBySlug,
  toggleLike as apiToggleLike,
  getLikeStatus,
} from "../services/blogService";
import {
  toggleSaveBlog as apiToggleSave,
  checkBlogSaved,
} from "../services/userService";
import CommentSection from "../components/CommentSection";

const BlogDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State for blog data
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requiresAuth, setRequiresAuth] = useState(false);

  // State for interactions
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const [showCopied, setShowCopied] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const contentRef = useRef(null);

  // Fetch blog data
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        setError(null);
        setRequiresAuth(false);
        const response = await getBlogBySlug(id);

        // Check if blog requires authentication
        if (response.requiresAuth) {
          setRequiresAuth(true);
          setBlog(response.data?.blog || null);
          setLoading(false);
          return;
        }

        if (response.success && response.data?.blog) {
          setBlog(response.data.blog);
          setLikeCount(response.data.blog.likeCount || 0);
        } else {
          setError("Blog not found");
        }
      } catch (err) {
        console.error("Error fetching blog:", err);
        // Check if error response indicates auth required
        if (err.response?.data?.requiresAuth) {
          setRequiresAuth(true);
          setBlog(err.response.data.data?.blog || null);
        } else {
          setError(err.message || "Failed to load blog");
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBlog();
    }
  }, [id]);

  // Wire up code copy buttons after content renders
  useEffect(() => {
    if (!contentRef.current || !blog) return;
    const buttons = contentRef.current.querySelectorAll(".copy-code-btn");
    buttons.forEach((btn) => {
      btn.onclick = () => {
        const codeEl = btn
          .closest(".code-block-wrapper")
          ?.querySelector("code");
        if (!codeEl) return;
        navigator.clipboard.writeText(codeEl.innerText).then(() => {
          btn.textContent = "✓ Copied!";
          setTimeout(() => (btn.textContent = "📋 Copy"), 2000);
        });
      };
    });
  }, [blog]);

  // Fetch like and save status when user is logged in
  useEffect(() => {
    const fetchInteractionStatus = async () => {
      if (!user || !blog?._id) return;

      try {
        // Check like status
        const likeResponse = await getLikeStatus(blog._id);
        if (likeResponse.success) {
          setIsLiked(likeResponse.data?.liked || false);
          setLikeCount(likeResponse.data?.likeCount || blog.likeCount || 0);
        }

        // Check save status
        const saveResponse = await checkBlogSaved(blog._id);
        if (saveResponse.success) {
          setIsSaved(saveResponse.data?.saved || false);
        }
      } catch (err) {
        console.error("Error fetching interaction status:", err);
      }
    };

    fetchInteractionStatus();
  }, [user, blog?._id, blog?.likeCount]);

  const handleLike = async () => {
    if (!user || likeLoading) return;

    try {
      setLikeLoading(true);
      const response = await apiToggleLike(blog._id);
      if (response.success) {
        setIsLiked((prev) => response.data?.liked ?? !prev);
        setLikeCount((prev) => response.data?.likeCount ?? prev);
      }
    } catch (err) {
      console.error("Error toggling like:", err);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || saveLoading) return;

    try {
      setSaveLoading(true);
      const response = await apiToggleSave(blog._id);
      if (response.success) {
        setIsSaved((prev) => response.data?.saved ?? !prev);
      }
    } catch (err) {
      console.error("Error toggling save:", err);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: blog.title,
      text: blog.description,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShowCopied(true);
        setTimeout(() => setShowCopied(false), 2000);
      }
    } catch (err) {
      console.error("Share failed:", err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  // Get author name from blog data
  const getAuthorName = () => {
    if (blog?.author?.name) return blog.author.name;
    if (blog?.authorName) return blog.authorName;
    return "Anonymous";
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading article...</p>
        </div>
      </div>
    );
  }

  // Authentication Required State - For registered users only blogs
  if (requiresAuth && !user) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
        {/* Preview Header with Blog Info */}
        {blog && (
          <div className="relative">
            <div className="h-[40vh] relative overflow-hidden">
              {blog.image ? (
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-linear-to-br from-emerald-600 via-teal-600 to-cyan-700"></div>
              )}
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent"></div>

              {/* Blog Preview Info */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
                <span className="inline-block bg-amber-500/90 text-white text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
                  <svg
                    className="w-4 h-4 inline mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  Members Only
                </span>
                <h1 className="text-2xl md:text-4xl font-bold text-white mb-3 leading-tight drop-shadow-lg">
                  {blog.title}
                </h1>
                <p className="text-white/80 text-lg max-w-2xl">
                  {blog.description}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Login Required Message */}
        <div className="flex flex-col items-center justify-center py-16 px-6">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 max-w-lg w-full text-center">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-amber-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Login Required
            </h2>
            <p className="text-gray-600 mb-8">
              This article is exclusive to registered members. Please log in to
              read the full content.
            </p>

            <div className="space-y-4">
              <Link
                to="/login"
                state={{
                  from: `/blog/${id}`,
                  message: "Please login to read this article",
                }}
                className="block w-full bg-linear-to-r from-emerald-500 to-teal-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition shadow-lg shadow-emerald-500/25"
              >
                Login to Continue
              </Link>

              <p className="text-gray-500 text-sm">
                Don&apos;t have an account?{" "}
                <Link
                  to="/register"
                  className="text-emerald-600 hover:underline font-medium"
                >
                  Register for free
                </Link>
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <button
                onClick={() => navigate(-1)}
                className="text-gray-500 hover:text-emerald-600 text-sm flex items-center gap-2 mx-auto"
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
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Go back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not Found State
  if (error || !blog) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-gray-50 to-gray-100">
        <div className="text-center px-6">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Article Not Found
          </h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            The article you're looking for doesn't exist or may have been
            removed.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-linear-to-r from-emerald-500 to-teal-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition shadow-lg shadow-emerald-500/25"
          >
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
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const authorName = getAuthorName();

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title={blog.title}
        description={
          blog.description ||
          `Read ${blog.title} on Daily Blogs - Expert insights and tutorials`
        }
        keywords={
          blog.tags?.join(", ") ||
          "blog, article, technology, tutorial, programming"
        }
        image={blog.image}
        type="article"
        author={authorName}
        publishedDate={new Date(
          blog.createdAt || blog.publishedAt,
        ).toISOString()}
        modifiedDate={
          blog.updatedAt ? new Date(blog.updatedAt).toISOString() : undefined
        }
        category={blog.category}
        tags={blog.tags}
        section={blog.category}
        readingTime={
          blog.content
            ? Math.ceil(
                blog.content.replace(/<[^>]*>/g, "").split(/\s+/).length / 200,
              )
            : undefined
        }
        wordCount={
          blog.content
            ? blog.content.replace(/<[^>]*>/g, "").split(/\s+/).length
            : undefined
        }
        breadcrumbs={[
          { name: "Home", url: "/" },
          ...(blog.category
            ? [
                {
                  name: blog.category,
                  url: `/?category=${encodeURIComponent(blog.category)}`,
                },
              ]
            : []),
          { name: blog.title },
        ]}
      />
      {/* Hero Section */}
      <div className="relative">
        {/* Background Image/Gradient */}
        <div className="h-[50vh] md:h-[60vh] relative overflow-hidden">
          {blog.image ? (
            <>
              {/* Skeleton loader */}
              {!imageLoaded && (
                <div className="absolute inset-0 bg-linear-to-br from-emerald-600 via-teal-600 to-cyan-500 animate-pulse" />
              )}
              <img
                src={blog.image}
                alt={`${blog.title} - ${blog.category || "Article"} on Daily Blogs`}
                className={`w-full h-full object-cover transition-opacity duration-500 ${
                  imageLoaded ? "opacity-100" : "opacity-0"
                }`}
                fetchPriority="high"
                decoding="async"
                onLoad={() => setImageLoaded(true)}
              />
            </>
          ) : (
            <div className="w-full h-full bg-linear-to-br from-emerald-600 via-teal-600 to-cyan-500" />
          )}
          {/* Overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent" />
        </div>

        {/* Floating Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 z-20 flex items-center gap-2 bg-white/90 backdrop-blur-sm text-gray-700 px-4 py-2 rounded-full font-medium shadow-lg hover:bg-white transition-colors"
        >
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </button>

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-12">
          <div className="w-full">
            {/* Category */}
            <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
              {blog.category || "Article"}
            </span>

            {/* Title */}
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight drop-shadow-lg">
              {blog.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-white/90">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-emerald-400 to-teal-400 flex items-center justify-center text-white font-bold ring-2 ring-white/30">
                  {authorName.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium">{authorName}</span>
              </div>
              <span className="hidden sm:inline text-white/60">•</span>
              <span className="text-white/80">
                {formatDate(blog.createdAt || blog.publishedAt)}
              </span>
              {blog.readTime && (
                <>
                  <span className="hidden sm:inline text-white/60">•</span>
                  <span className="flex items-center gap-1 text-white/80">
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
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {blog.readTime} min read
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Full Width */}
      <main className="w-full px-4 sm:px-6 lg:px-8 py-12">
        {/* Article Card */}
        <article className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Quick Actions Bar */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-b border-gray-100 gap-2">
            <div className="flex items-center gap-2">
              {/* Like Button */}
              <button
                onClick={handleLike}
                disabled={!user || likeLoading}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
                  isLiked
                    ? "bg-red-100 text-red-600"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                } ${
                  !user || likeLoading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:scale-105"
                }`}
                title={user ? "Like this article" : "Login to like"}
              >
                <svg
                  className="w-5 h-5"
                  fill={isLiked ? "currentColor" : "none"}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                <span>{likeCount}</span>
              </button>

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={!user || saveLoading}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
                  isSaved
                    ? "bg-emerald-100 text-emerald-600"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                } ${
                  !user || saveLoading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:scale-105"
                }`}
                title={user ? (isSaved ? "Unsave" : "Save") : "Login to save"}
              >
                <svg
                  className="w-5 h-5"
                  fill={isSaved ? "currentColor" : "none"}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                  />
                </svg>
                <span className="hidden sm:inline">
                  {isSaved ? "Saved" : "Save"}
                </span>
              </button>
            </div>

            {/* Share Button */}
            <div className="relative">
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium bg-white text-gray-600 hover:bg-gray-100 transition-all hover:scale-105"
              >
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
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
                <span className="hidden sm:inline">Share</span>
              </button>

              {/* Copied Toast */}
              {showCopied && (
                <div className="absolute right-0 top-full mt-2 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg shadow-lg animate-fade-in">
                  Link copied!
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8 md:p-12 lg:p-16">
            {/* Description/Excerpt */}
            {blog.description && (
              <p className="text-xl text-gray-600 leading-relaxed mb-8 pb-8 border-b border-gray-100 font-light">
                {blog.description}
              </p>
            )}

            {/* Main Content - Renders HTML from Rich Text Editor */}
            <div
              ref={contentRef}
              className="blog-content prose prose-lg lg:prose-xl max-w-none w-full
                prose-headings:text-gray-900 prose-headings:font-bold prose-headings:mb-4 prose-headings:mt-8
                prose-h1:text-3xl prose-h1:lg:text-4xl
                prose-h2:text-2xl prose-h2:lg:text-3xl
                prose-h3:text-xl prose-h3:lg:text-2xl
                prose-h4:text-lg
                prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6 prose-p:text-lg
                prose-a:text-emerald-600 prose-a:underline prose-a:font-medium hover:prose-a:text-emerald-800
                prose-strong:text-gray-900 prose-strong:font-bold
                prose-em:italic prose-em:text-gray-800
                prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-6 prose-ul:space-y-2
                prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-6 prose-ol:space-y-2
                prose-li:text-gray-700 prose-li:text-lg
                prose-blockquote:border-l-4 prose-blockquote:border-emerald-500 prose-blockquote:pl-6 prose-blockquote:py-2 prose-blockquote:italic prose-blockquote:text-gray-600 prose-blockquote:bg-emerald-50 prose-blockquote:rounded-r-lg prose-blockquote:my-6
                prose-hr:border-gray-300 prose-hr:my-8
                prose-img:rounded-xl prose-img:shadow-lg prose-img:my-8 prose-img:mx-auto
                prose-code:bg-gray-100 prose-code:text-red-600 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
                prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-0 prose-pre:rounded-lg prose-pre:overflow-x-auto prose-pre:my-6
                prose-table:w-full prose-table:border-collapse prose-table:my-6
                prose-th:border prose-th:border-gray-300 prose-th:px-4 prose-th:py-2 prose-th:bg-gray-100 prose-th:text-left prose-th:font-semibold
                prose-td:border prose-td:border-gray-300 prose-td:px-4 prose-td:py-2"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(
                  blog.content || `<p>${blog.description}</p>`,
                  {
                    ALLOWED_TAGS: [
                      // Basic text
                      "p",
                      "br",
                      "span",
                      "div",
                      // Formatting
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
                      // Links & Media
                      "a",
                      "img",
                      // Block elements
                      "blockquote",
                      "hr",
                      // Code
                      "code",
                      "pre",
                      // Tables
                      "table",
                      "thead",
                      "tbody",
                      "tfoot",
                      "tr",
                      "th",
                      "td",
                      // Font styling
                      "font",
                      // Interactive (for code copy buttons)
                      "button",
                    ],
                    ALLOWED_ATTR: [
                      "href",
                      "target",
                      "rel",
                      "src",
                      "alt",
                      "width",
                      "height",
                      "class",
                      "style",
                      "color",
                      "size",
                      "face",
                      "colspan",
                      "rowspan",
                      "align",
                      "valign",
                      // For code blocks
                      "id",
                      "contenteditable",
                    ],
                    ALLOW_DATA_ATTR: false,
                    ADD_TAGS: ["iframe"],
                    ADD_ATTR: ["target", "allowfullscreen", "loading"],
                    FORBID_TAGS: ["script", "object", "embed", "form", "input"],
                    FORBID_ATTR: [
                      "onerror",
                      "onload",
                      "onclick",
                      "onmouseover",
                    ],
                  },
                ),
              }}
            />

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="mt-10 pt-8 border-t border-gray-100">
                <div className="flex flex-wrap gap-2">
                  {blog.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Author Card */}
            <div className="mt-10 pt-8 border-t border-gray-100">
              <div className="flex items-start gap-4 p-6 bg-linear-to-br from-gray-50 to-gray-100 rounded-2xl">
                <div className="w-16 h-16 rounded-full bg-linear-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-2xl shrink-0 shadow-lg">
                  {authorName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Written by</p>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {authorName}
                  </h3>
                  <p className="text-gray-600">
                    Thank you for reading this article. If you found it helpful,
                    consider sharing it with others!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Engagement Bar */}
          <div className="px-4 sm:px-8 md:px-12 py-4 sm:py-6 bg-linear-to-r from-emerald-50 to-teal-50 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-gray-600">
                {user
                  ? "Enjoyed this article?"
                  : "Login to interact with this article"}
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleLike}
                  disabled={!user || likeLoading}
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                    isLiked
                      ? "bg-red-500 text-white shadow-lg shadow-red-500/25"
                      : "bg-white text-gray-700 border border-gray-200 hover:border-red-300 hover:text-red-600"
                  } ${
                    !user || likeLoading
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:scale-105"
                  }`}
                >
                  <svg
                    className="w-5 h-5"
                    fill={isLiked ? "currentColor" : "none"}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  {isLiked ? "Liked!" : "Like"}
                </button>
                <button
                  onClick={handleSave}
                  disabled={!user || saveLoading}
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                    isSaved
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                      : "bg-white text-gray-700 border border-gray-200 hover:border-emerald-300 hover:text-emerald-600"
                  } ${
                    !user || saveLoading
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:scale-105"
                  }`}
                >
                  <svg
                    className="w-5 h-5"
                    fill={isSaved ? "currentColor" : "none"}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                    />
                  </svg>
                  {isSaved ? "Saved!" : "Save"}
                </button>
              </div>
            </div>
          </div>
        </article>

        {/* Comments Section */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl overflow-hidden">
          <CommentSection blogId={blog._id} />
        </div>

        {/* Navigation */}
        <div className="text-center py-12">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-emerald-600 font-medium hover:text-emerald-700 transition-colors group"
          >
            <svg
              className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Browse more articles
          </Link>
        </div>
      </main>
    </div>
  );
};

export default BlogDetails;
