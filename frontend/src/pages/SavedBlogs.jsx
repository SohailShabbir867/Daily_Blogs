import { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getSavedBlogs } from "../services/userService";
import BlogCard from "../components/BlogCard";

const SavedBlogs = () => {
  const { user } = useAuth();
  const [savedBlogs, setSavedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch saved blogs from API
  useEffect(() => {
    const fetchSavedBlogs = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const response = await getSavedBlogs();
        if (response.success) {
          setSavedBlogs(response.data?.blogs || []);
        }
      } catch (err) {
        console.error("Error fetching saved blogs:", err);
        setError(err.message || "Failed to load saved blogs");
      } finally {
        setLoading(false);
      }
    };

    fetchSavedBlogs();
  }, [user]);

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-gray-900">Saved Articles</h1>
            <p className="text-gray-500 mt-1">
              Your bookmarked articles for later reading
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                <div className="h-40 bg-gray-200 rounded-xl mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Saved Articles</h1>
          <p className="text-gray-500 mt-1">
            Your bookmarked articles for later reading
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Empty State */}
        {savedBlogs.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-emerald-600"
                fill="none"
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
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No Saved Articles Yet
            </h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Start exploring our articles and save the ones you'd like to read
              later.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-linear-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-xl font-medium hover:from-emerald-600 hover:to-teal-600 transition shadow-lg shadow-emerald-500/20"
            >
              Browse Articles
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
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        ) : (
          <>
            <p className="text-gray-600 mb-6">
              {savedBlogs.length} saved article
              {savedBlogs.length !== 1 ? "s" : ""}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {savedBlogs.map((blog) => (
                <BlogCard key={blog._id || blog.id} blog={blog} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SavedBlogs;
