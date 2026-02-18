// Admin page for managing blog posts with role-based permissions
import { useState, useEffect, useCallback } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  getAllBlogs,
  deleteBlog,
  updateBlog,
  toggleTrending,
} from "../../services/adminService";

const ManageBlogs = () => {
  const { user, isAdmin } = useAuth();

  // State for blogs from API
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  // Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Stats
  const [stats, setStats] = useState({ total: 0, published: 0, draft: 0 });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Action loading states
  const [actionLoading, setActionLoading] = useState(null);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch blogs from API
  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page: currentPage,
        limit: 10,
      };

      if (filterStatus !== "all") {
        params.status = filterStatus;
      }

      if (debouncedSearch) {
        params.search = debouncedSearch;
      }

      const response = await getAllBlogs(params);

      if (response.success) {
        setBlogs(response.data.blogs || []);
        setStats(response.data.stats || { total: 0, published: 0, draft: 0 });
        setIsSuperAdmin(response.data.isSuperAdmin || false);
        setTotalPages(response.data.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error("Failed to fetch blogs:", err);
      setError(err.message || "Failed to load blogs");
    } finally {
      setLoading(false);
    }
  }, [currentPage, filterStatus, debouncedSearch]);

  useEffect(() => {
    if (isAdmin) {
      fetchBlogs();
    }
  }, [isAdmin, fetchBlogs]);

  // Redirect if not admin
  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  const handleDelete = async (id, title, canDelete) => {
    if (!canDelete) {
      alert("You don't have permission to delete this blog.");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      setActionLoading(id);
      await deleteBlog(id);
      fetchBlogs();
    } catch (err) {
      alert(err.message || "Failed to delete blog");
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async (blog) => {
    if (!blog.canEdit) {
      alert("You don't have permission to change this blog's status.");
      return;
    }

    try {
      setActionLoading(blog._id);
      const newStatus = blog.status === "published" ? "draft" : "published";
      await updateBlog(blog._id, { status: newStatus });
      fetchBlogs();
    } catch (err) {
      alert(err.message || "Failed to update blog status");
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleTrending = async (blog) => {
    try {
      setActionLoading(`trending-${blog._id}`);
      await toggleTrending(blog._id);
      fetchBlogs();
    } catch (err) {
      alert(err.message || "Failed to update trending status");
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status) => {
    setFilterStatus(status);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isSuperAdmin ? "Manage All Posts" : "Manage My Posts"}
            </h1>
            <p className="text-gray-500 mt-1">
              {isSuperAdmin
                ? "View and manage all admin posts"
                : "Edit, delete, or change status of your articles"}
            </p>
          </div>
          <Link
            to="/admin/create"
            className="inline-flex items-center gap-2 bg-linear-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-xl font-medium hover:from-emerald-600 hover:to-teal-600 transition shadow-lg shadow-emerald-500/20"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create New Post
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm">Total Posts</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.total || 0}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm">Published</p>
            <p className="text-2xl font-bold text-green-600">
              {stats.published || 0}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm">Drafts</p>
            <p className="text-2xl font-bold text-yellow-600">
              {stats.draft || 0}
            </p>
          </div>
          {isSuperAdmin && (
            <div className="bg-white rounded-xl p-4 shadow-sm border border-orange-100">
              <p className="text-gray-500 text-sm flex items-center gap-1.5">
                <svg
                  className="w-4 h-4 text-orange-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                </svg>
                Trending
              </p>
              <p className="text-2xl font-bold text-orange-600">
                {stats.trending ||
                  blogs.filter((b) => b.isTrending).length ||
                  0}
              </p>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="grow">
              <div className="relative">
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
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
                <input
                  type="text"
                  placeholder={
                    isSuperAdmin
                      ? "Search by title or author..."
                      : "Search by title..."
                  }
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {["all", "published", "draft"].map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium capitalize transition ${
                    filterStatus === status
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
            <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Loading blogs...</p>
          </div>
        )}

        {!loading && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {blogs.length === 0 ? (
              <div className="text-center py-16">
                <svg
                  className="w-16 h-16 text-gray-300 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                  />
                </svg>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No posts found
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm
                    ? "Try adjusting your search"
                    : "Create your first post"}
                </p>
                <Link
                  to="/admin/create"
                  className="inline-flex items-center gap-2 bg-linear-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-lg font-medium hover:from-emerald-600 hover:to-teal-600 transition shadow-lg shadow-emerald-500/20"
                >
                  Create New Post
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                        Article
                      </th>
                      {isSuperAdmin && (
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                          Author
                        </th>
                      )}
                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                        Category
                      </th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                        Status
                      </th>
                      {isSuperAdmin && (
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                          Trending
                        </th>
                      )}
                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                        Date
                      </th>
                      <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {blogs.map((blog) => (
                      <tr
                        key={blog._id}
                        className="hover:bg-gray-50 transition"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-linear-to-br from-emerald-100 to-teal-100 rounded-lg overflow-hidden shrink-0">
                              {blog.image && (
                                <img
                                  src={blog.image}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                            <div className="min-w-0">
                              <Link
                                to={`/blog/${blog.slug || blog._id}`}
                                className="font-semibold text-gray-900 hover:text-emerald-600 transition line-clamp-1"
                              >
                                {blog.title}
                              </Link>
                              {!isSuperAdmin && (
                                <p className="text-sm text-gray-500">
                                  {blog.viewCount || 0} views •{" "}
                                  {blog.likeCount || 0} likes
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        {isSuperAdmin && (
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {blog.author?.avatar && (
                                <img
                                  src={blog.author.avatar}
                                  alt=""
                                  className="w-6 h-6 rounded-full"
                                />
                              )}
                              <span className="text-sm text-gray-700">
                                {blog.author?.name ||
                                  blog.author?.email ||
                                  "Unknown"}
                              </span>
                              {blog.isOwner && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                  You
                                </span>
                              )}
                            </div>
                          </td>
                        )}
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                            {blog.category || "Uncategorized"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleStatus(blog)}
                            disabled={
                              !blog.canEdit || actionLoading === blog._id
                            }
                            className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                              blog.status === "published"
                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                            } ${
                              !blog.canEdit
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                            title={
                              blog.canEdit
                                ? "Click to toggle status"
                                : "You can't change this blog's status"
                            }
                          >
                            {actionLoading === blog._id ? "..." : blog.status}
                          </button>
                        </td>
                        {isSuperAdmin && (
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleToggleTrending(blog)}
                              disabled={
                                actionLoading === `trending-${blog._id}`
                              }
                              className={`px-3 py-1 rounded-full text-sm font-medium transition flex items-center gap-1.5 ${
                                blog.isTrending
                                  ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
                                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                              }`}
                              title={
                                blog.isTrending
                                  ? "Remove from trending"
                                  : "Mark as trending"
                              }
                            >
                              <svg
                                className="w-4 h-4"
                                fill={blog.isTrending ? "currentColor" : "none"}
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"
                                />
                              </svg>
                              {actionLoading === `trending-${blog._id}`
                                ? "..."
                                : blog.isTrending
                                  ? "Trending"
                                  : "Set Trending"}
                            </button>
                          </td>
                        )}
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatDate(blog.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/blog/${blog.slug || blog._id}`}
                              className="p-2 text-gray-400 hover:text-emerald-600 transition"
                              title="View"
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
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                            </Link>
                            {blog.canEdit ? (
                              <Link
                                to={`/admin/edit/${blog._id}`}
                                className="p-2 text-gray-400 hover:text-green-600 transition"
                                title="Edit"
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
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                              </Link>
                            ) : (
                              <span
                                className="p-2 text-gray-200 cursor-not-allowed"
                                title="You can't edit this blog"
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
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                              </span>
                            )}
                            {blog.canDelete ? (
                              <button
                                onClick={() =>
                                  handleDelete(
                                    blog._id,
                                    blog.title,
                                    blog.canDelete,
                                  )
                                }
                                disabled={actionLoading === blog._id}
                                className="p-2 text-gray-400 hover:text-red-600 transition disabled:opacity-50"
                                title="Delete"
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
                            ) : (
                              <span
                                className="p-2 text-gray-200 cursor-not-allowed"
                                title="You can't delete this blog"
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
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {!loading && totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}

        {!loading && !isSuperAdmin && blogs.length > 0 && (
          <p className="text-gray-500 text-sm mt-4 text-center">
            You can only manage blogs that you have created.
          </p>
        )}
        {!loading && isSuperAdmin && blogs.length > 0 && (
          <p className="text-gray-500 text-sm mt-4 text-center">
            As a super admin, you can manage all blogs from all admins.
          </p>
        )}
      </div>
    </div>
  );
};

export default ManageBlogs;
