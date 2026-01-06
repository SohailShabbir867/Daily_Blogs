import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getComments as fetchComments,
  createComment,
  replyToComment,
  toggleLikeComment,
  deleteComment as removeComment,
} from "../services/commentService";

const CommentSection = ({ blogId }) => {
  const { user } = useAuth();
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    const loadComments = async () => {
      if (!blogId) return;
      try {
        setLoading(true);
        setError(null);
        const response = await fetchComments(blogId);
        if (response.success) {
          setComments(response.data?.comments || []);
        }
      } catch (err) {
        console.error("Error fetching comments:", err);
        setError("Failed to load comments");
        setComments([]);
      } finally {
        setLoading(false);
      }
    };
    loadComments();
  }, [blogId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !user || submitting) return;

    try {
      setSubmitting(true);
      const response = await createComment(blogId, {
        text: commentText.trim(),
      });
      if (response.success && response.data?.comment) {
        setComments((prev) => [response.data.comment, ...prev]);
        setCommentText("");
      }
    } catch (err) {
      console.error("Error posting comment:", err);
      alert("Failed to post comment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (parentId) => {
    if (!replyText.trim() || !user || submitting) return;

    try {
      setSubmitting(true);
      const response = await replyToComment(blogId, parentId, replyText.trim());
      if (response.success && response.data?.comment) {
        setComments((prev) =>
          prev.map((c) => {
            if (c._id === parentId) {
              return {
                ...c,
                replies: [...(c.replies || []), response.data.comment],
              };
            }
            return c;
          })
        );
        setReplyText("");
        setReplyingTo(null);
      }
    } catch (err) {
      console.error("Error posting reply:", err);
      alert("Failed to post reply. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (commentId, isReply = false, parentId = null) => {
    if (!user) {
      alert("Please login to like comments");
      return;
    }

    try {
      const response = await toggleLikeComment(commentId);
      if (response.success) {
        const { liked, likeCount } = response.data;

        if (isReply && parentId) {
          setComments((prev) =>
            prev.map((c) => {
              if (c._id === parentId) {
                return {
                  ...c,
                  replies: c.replies.map((r) =>
                    r._id === commentId
                      ? { ...r, likeCount, userLiked: liked }
                      : r
                  ),
                };
              }
              return c;
            })
          );
        } else {
          setComments((prev) =>
            prev.map((c) =>
              c._id === commentId ? { ...c, likeCount, userLiked: liked } : c
            )
          );
        }
      }
    } catch (err) {
      console.error("Error liking comment:", err);
    }
  };

  const handleDelete = async (commentId, isReply = false, parentId = null) => {
    if (!window.confirm("Are you sure you want to delete this comment?"))
      return;

    try {
      const response = await removeComment(commentId);
      if (response.success) {
        if (isReply && parentId) {
          setComments((prev) =>
            prev.map((c) => {
              if (c._id === parentId) {
                return {
                  ...c,
                  replies: c.replies.filter((r) => r._id !== commentId),
                };
              }
              return c;
            })
          );
        } else {
          setComments((prev) => prev.filter((c) => c._id !== commentId));
        }
      }
    } catch (err) {
      console.error("Error deleting comment:", err);
      alert("Failed to delete comment. Please try again.");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const canDelete = (authorId) => {
    if (!user) return false;
    return (
      user._id === authorId ||
      user.id === authorId ||
      user.role === "admin" ||
      user.role === "superAdmin"
    );
  };

  const getUserId = (comment) => {
    return comment.user?._id || comment.user?.id || comment.userId;
  };

  const getUserName = (comment) => {
    return comment.user?.name || comment.userName || "Anonymous";
  };

  const hasUserLiked = (comment) => {
    if (!user) return false;
    if (comment.userLiked !== undefined) return comment.userLiked;
    return comment.likes?.some(
      (like) => like.user === user._id || like.user === user.id
    );
  };

  const renderReplyForm = (commentId) => {
    if (replyingTo !== commentId) return null;

    return (
      <div className="mt-4 flex gap-3">
        <input
          type="text"
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder="Write a reply..."
          className="grow px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          disabled={submitting}
          autoFocus
        />
        <button
          onClick={() => handleReply(commentId)}
          disabled={!replyText.trim() || submitting}
          className="px-4 py-2 bg-linear-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {submitting ? "..." : "Reply"}
        </button>
        <button
          onClick={() => {
            setReplyingTo(null);
            setReplyText("");
          }}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
        >
          Cancel
        </button>
      </div>
    );
  };

  const renderComment = (comment, isReply = false, parentId = null) => {
    const authorName = getUserName(comment);
    const authorId = getUserId(comment);
    const liked = hasUserLiked(comment);

    return (
      <div
        key={comment._id}
        className={`flex gap-4 ${
          isReply ? "ml-12 mt-4" : "p-4 bg-gray-50 rounded-xl"
        }`}
      >
        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shrink-0">
          <span className="text-white font-medium">
            {authorName.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="grow">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="font-semibold text-gray-900">{authorName}</span>
              <span className="text-gray-500 text-sm ml-2">
                {formatDate(comment.createdAt)}
              </span>
              {comment.isEdited && (
                <span className="text-gray-400 text-xs ml-2">(edited)</span>
              )}
            </div>
            {canDelete(authorId) && (
              <button
                onClick={() => handleDelete(comment._id, isReply, parentId)}
                className="text-gray-400 hover:text-red-500 transition"
                title="Delete comment"
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            )}
          </div>
          <p className="text-gray-700 mb-3">{comment.text}</p>

          {/* Like and Reply buttons */}
          <div className="flex items-center gap-4 text-sm">
            <button
              onClick={() => handleLike(comment._id, isReply, parentId)}
              className={`flex items-center gap-1 transition ${
                liked ? "text-red-500" : "text-gray-500 hover:text-red-500"
              }`}
            >
              <svg
                className="w-5 h-5"
                fill={liked ? "currentColor" : "none"}
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
              <span>{comment.likeCount || 0}</span>
            </button>

            {!isReply &&
              user &&
              (comment.depth === undefined || comment.depth < 2) && (
                <button
                  onClick={() => {
                    if (replyingTo === comment._id) {
                      setReplyingTo(null);
                      setReplyText("");
                    } else {
                      setReplyingTo(comment._id);
                      setReplyText("");
                    }
                  }}
                  className={`flex items-center gap-1 transition ${
                    replyingTo === comment._id
                      ? "text-emerald-500"
                      : "text-gray-500 hover:text-emerald-500"
                  }`}
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
                      d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                    />
                  </svg>
                  <span>Reply</span>
                </button>
              )}
          </div>

          {/* Reply Form - rendered separately to avoid re-mount issues */}
          {!isReply && renderReplyForm(comment._id)}

          {/* Replies */}
          {!isReply && comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-4 border-l-2 border-gray-200 pl-4">
              {comment.replies.map((reply) =>
                renderComment(reply, true, comment._id)
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="mt-12">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">
        Comments ({comments.length})
      </h3>

      {/* Comment Form */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shrink-0">
              <span className="text-white font-medium">
                {user.name?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
            <div className="grow">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                rows={3}
                disabled={submitting}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none transition disabled:opacity-50"
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={!commentText.trim() || submitting}
                  className="px-6 py-2 bg-linear-to-r from-emerald-500 to-teal-500 text-white font-medium rounded-lg hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {submitting ? "Posting..." : "Post Comment"}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-6 bg-gray-50 rounded-xl text-center">
          <p className="text-gray-600">
            Please{" "}
            <a
              href="/login"
              className="text-emerald-600 font-medium hover:underline"
            >
              login
            </a>{" "}
            to leave a comment.
          </p>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading comments...</p>
          </div>
        ) : error ? (
          <p className="text-red-500 text-center py-8">{error}</p>
        ) : comments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((comment) => renderComment(comment))
        )}
      </div>
    </div>
  );
};

export default CommentSection;
