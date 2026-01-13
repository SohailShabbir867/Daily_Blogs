import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  getBlogs,
  getBlogBySlug,
  toggleLike as apiToggleLike,
  getLikeStatus,
} from "../services/blogService";

const BlogContext = createContext();

export const useBlog = () => {
  const context = useContext(BlogContext);
  if (!context) {
    throw new Error("useBlog must be used within a BlogProvider");
  }
  return context;
};

export const BlogProvider = ({ children }) => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });

  // Fetch blogs from API
  const fetchBlogs = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getBlogs(params);

      if (response && response.success) {
        setBlogs(response.data?.blogs || []);
        setPagination(
          response.data?.pagination || {
            currentPage: 1,
            totalPages: 1,
            totalItems: 0,
          }
        );
      } else {
        // Handle case where response doesn't have success property
        setError("Invalid response from server");
        setBlogs([]);
      }
    } catch (err) {
      console.error("Error fetching blogs:", err);
      // Provide more specific error messages
      let errorMessage = "Failed to fetch blogs";
      if (err.message) {
        errorMessage = err.message;
      } else if (err.request) {
        errorMessage =
          "Cannot connect to server. Please make sure the backend is running on http://localhost:5000";
      } else if (err.response) {
        errorMessage =
          err.response.data?.message || `Server error: ${err.response.status}`;
      }
      setError(errorMessage);
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  // Get blog by ID or slug
  const getBlogById = async (identifier) => {
    try {
      const response = await getBlogBySlug(identifier);
      if (response.success) {
        return response.data?.blog || null;
      }
      return null;
    } catch (err) {
      console.error("Error fetching blog:", err);
      return null;
    }
  };

  // Like operations
  const toggleLike = async (blogId) => {
    try {
      const response = await apiToggleLike(blogId);
      if (response.success) {
        // Update local state
        setBlogs((prev) =>
          prev.map((blog) =>
            blog._id === blogId
              ? {
                  ...blog,
                  likeCount: response.data?.likeCount || blog.likeCount,
                }
              : blog
          )
        );
        return response.data;
      }
    } catch (err) {
      console.error("Error toggling like:", err);
      throw err;
    }
  };

  const checkLikeStatus = async (blogId) => {
    try {
      const response = await getLikeStatus(blogId);
      if (response.success) {
        return response.data;
      }
      return { liked: false, likeCount: 0 };
    } catch (err) {
      console.error("Error checking like status:", err);
      return { liked: false, likeCount: 0 };
    }
  };

  // Refresh blogs
  const refreshBlogs = () => {
    fetchBlogs();
  };

  return (
    <BlogContext.Provider
      value={{
        blogs,
        loading,
        error,
        pagination,
        fetchBlogs,
        getBlogById,
        toggleLike,
        checkLikeStatus,
        refreshBlogs,
      }}
    >
      {children}
    </BlogContext.Provider>
  );
};

export default BlogContext;
