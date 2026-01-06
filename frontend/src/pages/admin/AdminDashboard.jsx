import { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getAllBlogs } from "../../services/adminService";

const AdminDashboard = () => {
  const { user, isAdmin, isSuperAdmin } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [stats, setStats] = useState({ total: 0, published: 0, draft: 0 });
  const [loading, setLoading] = useState(true);

  // Fetch blogs from API
  useEffect(() => {
    const fetchBlogs = async () => {
      if (!isAdmin) return;

      try {
        setLoading(true);
        const response = await getAllBlogs({ limit: 10 });
        if (response.success) {
          setBlogs(response.data?.blogs || []);
          setStats(
            response.data?.stats || { total: 0, published: 0, draft: 0 }
          );
        }
      } catch (err) {
        console.error("Error fetching blogs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [isAdmin]);

  // Redirect if not admin
  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  const statCards = [
    {
      label: "Total Articles",
      value: stats.total || 0,
      icon: (
        <svg
          className="w-8 h-8"
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
      ),
      color: "blue",
    },
    {
      label: "Published",
      value: stats.published || 0,
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      color: "green",
    },
    {
      label: "Draft",
      value: stats.draft || 0,
      icon: (
        <svg
          className="w-8 h-8"
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
      ),
      color: "yellow",
    },
  ];

  const colorClasses = {
    blue: "bg-emerald-100 text-emerald-600",
    green: "bg-teal-100 text-teal-600",
    yellow: "bg-cyan-100 text-cyan-600",
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-emerald-50/30">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-gray-500 mt-1">Manage your blog content</p>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {loading ? "..." : stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${colorClasses[stat.color]}`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/admin/create"
              className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:bg-emerald-50 hover:border-emerald-200 transition group"
            >
              <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg group-hover:bg-emerald-200 transition">
                <svg
                  className="w-6 h-6"
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
              </div>
              <div>
                <p className="font-semibold text-gray-900">Create Post</p>
                <p className="text-sm text-gray-500">Write a new article</p>
              </div>
            </Link>
            <Link
              to="/admin/manage"
              className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:bg-teal-50 hover:border-teal-200 transition group"
            >
              <div className="p-3 bg-teal-100 text-teal-600 rounded-lg group-hover:bg-teal-200 transition">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                  />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Manage Posts</p>
                <p className="text-sm text-gray-500">Edit or delete articles</p>
              </div>
            </Link>
            <Link
              to="/"
              className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:bg-cyan-50 hover:border-cyan-200 transition group"
            >
              <div className="p-3 bg-cyan-100 text-cyan-600 rounded-lg group-hover:bg-cyan-200 transition">
                <svg
                  className="w-6 h-6"
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
              </div>
              <div>
                <p className="font-semibold text-gray-900">View Site</p>
                <p className="text-sm text-gray-500">See the public site</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Super Admin Actions */}
        {isSuperAdmin && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Super Admin Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Link
                to="/admin/users"
                className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition"
              >
                <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Manage Users</p>
                  <p className="text-sm text-gray-500">User management</p>
                </div>
              </Link>
              <Link
                to="/admin/contacts"
                className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition"
              >
                <div className="p-3 bg-orange-100 text-orange-600 rounded-lg">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    Contact Messages
                  </p>
                  <p className="text-sm text-gray-500">View inquiries</p>
                </div>
              </Link>
              <Link
                to="/admin/notifications"
                className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition"
              >
                <div className="p-3 bg-red-100 text-red-600 rounded-lg">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    Send Notifications
                  </p>
                  <p className="text-sm text-gray-500">Email users</p>
                </div>
              </Link>
              <Link
                to="/"
                className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition"
              >
                <div className="p-3 bg-gray-100 text-gray-600 rounded-lg">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Settings</p>
                  <p className="text-sm text-gray-500">System settings</p>
                </div>
              </Link>
            </div>
          </div>
        )}

        {/* Recent Posts */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              {isSuperAdmin ? "Recent Posts (All Admins)" : "Your Recent Posts"}
            </h2>
            <Link
              to="/admin/manage"
              className="text-emerald-600 font-medium hover:underline"
            >
              View all
            </Link>
          </div>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="animate-pulse flex items-center gap-4 p-4 border border-gray-100 rounded-xl"
                >
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : blogs.length > 0 ? (
            <div className="space-y-4">
              {blogs.slice(0, 5).map((blog) => (
                <div
                  key={blog._id}
                  className="flex items-center justify-between p-4 border border-gray-100 rounded-xl"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-linear-to-br from-emerald-100 to-teal-100 rounded-lg overflow-hidden">
                      {blog.image && (
                        <img
                          src={blog.image}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 line-clamp-1">
                        {blog.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {blog.author?.name || blog.authorName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        blog.status === "published"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {blog.status}
                    </span>
                    <Link
                      to={`/admin/edit/${blog._id}`}
                      className="p-2 text-gray-500 hover:text-emerald-600 transition"
                      title="Edit"
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
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No blogs yet. Create your first post!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
