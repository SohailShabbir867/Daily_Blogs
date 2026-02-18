// BlogCard - Displays blog article previews with like and save functionality
import { useState, memo } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { useAuth } from "../context/AuthContext";
import { toggleSaveBlog } from "../services/userService";
import { toggleLike } from "../services/blogService";

const BlogCard = memo(({ blog }) => {
  const { user } = useAuth();
  const [likeCount, setLikeCount] = useState(blog.likeCount || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Get blog ID (supports both _id from MongoDB and id)
  const blogId = blog._id || blog.id;
  const blogSlug = blog.slug || blogId;

  const authorName =
    blog.author?.name || blog.authorName || blog.author || "Anonymous";

  const handleLike = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!user || isLiking) return;

    try {
      setIsLiking(true);
      const response = await toggleLike(blogId);
      if (response.success) {
        setIsLiked(response.data?.liked);
        setLikeCount(response.data?.likeCount || likeCount);
      }
    } catch (err) {
      console.error("Error toggling like:", err);
    } finally {
      setIsLiking(false);
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!user || isSaving) return;

    try {
      setIsSaving(true);
      const response = await toggleSaveBlog(blogId);
      if (response.success) {
        setIsSaved(response.data?.saved);
      }
    } catch (err) {
      console.error("Error toggling save:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";

    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "";
    }
  };

  if (!blog || !blogId) {
    return null;
  }

  return (
    <article
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col h-full"
      aria-label={`Article: ${blog.title}`}
    >
      <div className="h-48 bg-linear-to-br from-emerald-100 via-teal-50 to-cyan-100 relative overflow-hidden">
        {blog.image ? (
          <img
            src={blog.image}
            alt={`${blog.title} - ${blog.category || "Tech"} article cover image`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            decoding="async"
            width="400"
            height="192"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        ) : (
          <div
            className="absolute inset-0 bg-linear-to-br from-emerald-100 via-teal-50 to-cyan-100"
            aria-hidden="true"
          />
        )}

        <div
          className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent"
          aria-hidden="true"
        />

        <div className="absolute top-4 left-4 flex items-center gap-2">
          <span className="bg-emerald-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
            {blog.category || "Article"}
          </span>
          {/* Trending Badge */}
          {blog.isTrending && (
            <span
              className="bg-linear-to-r from-orange-500 to-red-500 text-white text-xs font-semibold px-2 py-1.5 rounded-full shadow-sm flex items-center gap-1"
              title="Trending"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              </svg>
            </span>
          )}
          {/* Members Only Badge */}
          {blog.visibility === "registered" && (
            <span
              className="bg-amber-500 text-white text-xs font-semibold px-2 py-1.5 rounded-full shadow-sm flex items-center gap-1"
              title="Members only"
            >
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </span>
          )}
        </div>

        {user && (
          <button
            onClick={handleSave}
            className="absolute top-4 right-4 p-2.5 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            aria-label={
              isSaved ? "Remove from saved articles" : "Save article for later"
            }
            title={isSaved ? "Unsave" : "Save for later"}
          >
            <svg
              className={`w-5 h-5 transition-colors ${
                isSaved ? "text-emerald-600" : "text-gray-600"
              }`}
              fill={isSaved ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
          </button>
        )}
      </div>

      <div className="p-6 flex flex-col grow">
        {blog.createdAt && (
          <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
            <time dateTime={blog.createdAt}>{formatDate(blog.createdAt)}</time>
            {blog.readTime && (
              <>
                <span aria-hidden="true">•</span>
                <span>{blog.readTime} min read</span>
              </>
            )}
          </div>
        )}

        <Link
          to={`/blog/${blogSlug}`}
          className="focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-lg"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-3 leading-snug group-hover:text-emerald-600 transition-colors line-clamp-2">
            {blog.title}
          </h3>
        </Link>

        <p className="text-gray-600 text-sm mb-6 grow line-clamp-3 leading-relaxed">
          {blog.description}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full bg-linear-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-xs font-bold"
              aria-hidden="true"
            >
              {authorName?.charAt(0).toUpperCase() || "A"}
            </div>
            <span className="text-sm text-gray-600 font-medium">
              {authorName}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 rounded-lg px-2 py-1 -mx-2 ${
                isLiked ? "text-red-500" : "text-gray-500 hover:text-red-500"
              } ${!user ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={!user}
              aria-label={`${likeCount} likes. ${
                user ? (isLiked ? "Unlike" : "Like") : "Login to like"
              }`}
              title={user ? (isLiked ? "Unlike" : "Like") : "Login to like"}
            >
              <svg
                className="w-5 h-5"
                fill={isLiked ? "currentColor" : "none"}
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
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

            <Link
              to={`/blog/${blogSlug}`}
              className="inline-flex items-center gap-1 bg-linear-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-emerald-600 hover:to-teal-600 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 shadow-sm"
              aria-label={`Read full article: ${blog.title}`}
            >
              Read More
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
});

BlogCard.displayName = "BlogCard";

BlogCard.propTypes = {
  blog: PropTypes.shape({
    _id: PropTypes.string,
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    slug: PropTypes.string,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    author: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        name: PropTypes.string,
        avatar: PropTypes.string,
      }),
    ]),
    authorName: PropTypes.string,
    category: PropTypes.string,
    image: PropTypes.string,
    createdAt: PropTypes.string,
    publishedAt: PropTypes.string,
    readTime: PropTypes.number,
    likeCount: PropTypes.number,
    isTrending: PropTypes.bool,
  }).isRequired,
};

export default BlogCard;
