import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getBlogById, updateBlog } from "../../services/adminService";
import RichTextEditor from "../../components/RichTextEditor";
import { uploadImageToCloudinary } from "../../services/cloudinaryService";

const EditBlog = () => {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState("");
  const [imagePreviewLoaded, setImagePreviewLoaded] = useState(false);
  const coverFileInputRef = useRef(null);
  const [coverUploadMethod, setCoverUploadMethod] = useState("url");
  const [coverFile, setCoverFile] = useState(null);
  const [coverFilePreview, setCoverFilePreview] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    category: "",
    author: "",
    image: "",
    readTime: 5,
    status: "published",
    visibility: "everyone",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        const response = await getBlogById(id);
        const blogData = response.data?.blog || response.blog || response;
        setBlog(blogData);
        setCanEdit(response.data?.canEdit || false);
        setFormData({
          title: blogData.title || "",
          description: blogData.description || "",
          content: blogData.content || "",
          category: blogData.category || "",
          author: blogData.author?.name || blogData.author || "",
          image: blogData.image || "",
          readTime: blogData.readTime || 5,
          status: blogData.status || "published",
          visibility: blogData.visibility || "everyone",
        });
        if (blogData.image) {
          setCoverUploadMethod("url");
          setImageLoading(true);
        }
      } catch (err) {
        console.error("Error fetching blog:", err);
        setError(err.message || "Failed to load blog");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBlog();
    }
  }, [id]);

  // Auto-calculate read time from content
  const calculateReadTime = useCallback((content) => {
    if (!content) return 1;
    const text = content.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ");
    const words = text
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0).length;
    return Math.max(1, Math.ceil(words / 200));
  }, []);

  useEffect(() => {
    if (!loading && blog) {
      const readTime = calculateReadTime(formData.content);
      setFormData((prev) => ({ ...prev, readTime }));
    }
  }, [formData.content, loading, blog, calculateReadTime]);

  // Redirect if not admin
  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  // Blog not found or no permission
  if (!blog || !canEdit) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="text-6xl mb-4">📄</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {!blog ? "Blog Not Found" : "Permission Denied"}
        </h2>
        <p className="text-gray-500 mb-6">
          {!blog
            ? "The article you're trying to edit doesn't exist."
            : "You don't have permission to edit this blog."}
        </p>
        <button
          onClick={() => navigate("/admin/manage")}
          className="bg-linear-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-lg font-medium hover:from-emerald-600 hover:to-teal-600 transition shadow-lg shadow-emerald-500/20"
        >
          Back to Manage Posts
        </button>
      </div>
    );
  }

  const categories = [
    "Technology",
    "Coding & Programming",
    "Web Development",
    "Study Material",
    "Movies & Entertainment",
    "Games & Gaming",
    "Government Schemes",
    "Jobs & Career",
    "Visa & Immigration",
    "Linux & Tools",
    "Tutorial",
    "News",
    "Design",
    "Best Practices",
    "Other",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.title || !formData.description || !formData.content) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      const updatedData = {
        ...formData,
        readTime: parseInt(formData.readTime) || 5,
      };

      if (coverUploadMethod === "upload" && coverFile) {
        try {
          setUploadProgress(0);
          const cloudinaryUrl = await uploadImageToCloudinary(coverFile, (pct) => {
            setUploadProgress(pct);
          });
          updatedData.image = cloudinaryUrl;
        } catch (err) {
          console.error("Error uploading cover image:", err);
          setError("Error uploading cover image: " + err.message);
          setIsSubmitting(false);
          return;
        }
      }

      await updateBlog(blog._id || blog.id, updatedData);
      navigate("/admin/manage");
    } catch (err) {
      console.error("Error updating blog:", err);
      setError(err.message || "Failed to update blog post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-gray-500 hover:text-emerald-600 mb-4 transition"
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Edit Post
          </h1>
          <p className="text-gray-500 mt-1">Update your article</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Basic Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
                  placeholder="Enter article title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition resize-none"
                  placeholder="Brief description of the article"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Author
                  </label>
                  <input
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
                    placeholder="Author name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Read Time{" "}
                    <span className="text-gray-400 font-normal">
                      (auto-calculated)
                    </span>
                  </label>
                  <div className="w-full px-4 py-3 border border-gray-100 rounded-xl bg-gray-50 text-gray-600 flex items-center gap-2">
                    <span>⏱️</span>
                    <span className="font-medium">
                      {formData.readTime} min read
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              {/* Visibility Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Who can read this article?
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label
                    className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition ${
                      formData.visibility === "everyone"
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="visibility"
                      value="everyone"
                      checked={formData.visibility === "everyone"}
                      onChange={handleChange}
                      className="w-4 h-4 text-emerald-600"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-5 h-5 text-green-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="font-medium text-gray-900">
                          Everyone
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        All visitors can read this article
                      </p>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition ${
                      formData.visibility === "registered"
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="visibility"
                      value="registered"
                      checked={formData.visibility === "registered"}
                      onChange={handleChange}
                      className="w-4 h-4 text-emerald-600"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-5 h-5 text-amber-500"
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
                        <span className="font-medium text-gray-900">
                          Registered Users Only
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Only logged-in users can read
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Image{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>

                {/* Upload Method Toggle */}
                <div className="flex gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => {
                      setCoverUploadMethod("upload");
                      setFormData((prev) => ({ ...prev, image: "" }));
                      setImageError("");
                      setImagePreviewLoaded(false);
                      setImageLoading(false);
                    }}
                    className={`flex-1 py-2.5 px-4 rounded-xl font-medium text-sm transition-all ${
                      coverUploadMethod === "upload"
                        ? "bg-emerald-500 text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"
                    }`}
                  >
                    📁 Upload from Device
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCoverUploadMethod("url");
                      setCoverFile(null);
                      setCoverFilePreview("");
                    }}
                    className={`flex-1 py-2.5 px-4 rounded-xl font-medium text-sm transition-all ${
                      coverUploadMethod === "url"
                        ? "bg-emerald-500 text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"
                    }`}
                  >
                    🔗 From URL
                  </button>
                </div>

                <div className="space-y-3">
                  {coverUploadMethod === "upload" ? (
                    <>
                      <div
                        onClick={() => coverFileInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all"
                      >
                        {coverFilePreview ? (
                          <div>
                            <img
                              src={coverFilePreview}
                              alt="Cover preview"
                              className="max-h-48 mx-auto rounded-lg shadow-md object-cover"
                            />
                            <p className="text-sm text-gray-500 mt-2">
                              Click to change image
                            </p>
                          </div>
                        ) : (
                          <div>
                            <svg
                              className="w-12 h-12 mx-auto text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            <p className="mt-2 text-sm text-gray-600">
                              Click to select a cover image
                            </p>
                            <p className="text-xs text-gray-400">
                              JPG, PNG, WebP — Recommended: 1200×630px
                            </p>
                          </div>
                        )}
                      </div>
                      <input
                        ref={coverFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            if (file.size > 10 * 1024 * 1024) {
                              setImageError("Cover image must be under 10MB");
                              return;
                            }
                            setCoverFile(file);
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setCoverFilePreview(reader.result);
                            };
                            reader.readAsDataURL(file);
                            setImageError("");
                          }
                        }}
                        className="hidden"
                      />
                      {coverFile && (
                        <button
                          type="button"
                          onClick={() => {
                            setCoverFile(null);
                            setCoverFilePreview("");
                          }}
                          className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
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
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          Remove image
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <input
                        type="url"
                        name="image"
                        value={formData.image}
                        onChange={(e) => {
                          const url = e.target.value;
                          setFormData((prev) => ({ ...prev, image: url }));
                          setImageError("");
                          setImagePreviewLoaded(false);
                          if (url) {
                            setImageLoading(true);
                          }
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
                        placeholder="https://example.com/image.jpg"
                      />

                      {/* Image Preview */}
                      {formData.image && (
                        <div className="relative">
                          <div className="relative border border-gray-200 rounded-xl overflow-hidden bg-gray-100">
                            {imageLoading && !imagePreviewLoaded && (
                              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                                <div className="flex flex-col items-center gap-2">
                                  <svg
                                    className="animate-spin h-8 w-8 text-emerald-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    />
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                  </svg>
                                  <span className="text-sm text-gray-500">
                                    Loading image...
                                  </span>
                                </div>
                              </div>
                            )}

                            {imageError && (
                              <div className="absolute inset-0 flex items-center justify-center bg-red-50">
                                <div className="text-center p-4">
                                  <svg
                                    className="w-12 h-12 text-red-400 mx-auto mb-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                    />
                                  </svg>
                                  <p className="text-red-600 font-medium">
                                    Image failed to load
                                  </p>
                                  <p className="text-red-500 text-sm mt-1">
                                    {imageError}
                                  </p>
                                </div>
                              </div>
                            )}

                            <img
                              src={formData.image}
                              alt="Cover preview"
                              className={`w-full h-64 object-cover transition-opacity duration-300 ${
                                imagePreviewLoaded && !imageError
                                  ? "opacity-100"
                                  : "opacity-0"
                              }`}
                              onLoad={() => {
                                setImageLoading(false);
                                setImagePreviewLoaded(true);
                                setImageError("");
                              }}
                              onError={() => {
                                setImageLoading(false);
                                setImagePreviewLoaded(false);
                                setImageError(
                                  "Could not load image. Check if the URL is correct and accessible.",
                                );
                              }}
                              crossOrigin="anonymous"
                            />

                            {imagePreviewLoaded && !imageError && (
                              <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                <svg
                                  className="w-3 h-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={3}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                                Image loaded
                              </div>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setFormData((prev) => ({ ...prev, image: "" }));
                              setImageError("");
                              setImagePreviewLoaded(false);
                              setImageLoading(false);
                            }}
                            className="mt-2 text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
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
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            Remove image
                          </button>
                        </div>
                      )}
                    </>
                  )}

                  {imageError && coverUploadMethod === "upload" && (
                    <p className="text-sm text-red-600">{imageError}</p>
                  )}

                  {/* Quick Image Sources */}
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs text-gray-500">Free sources:</span>
                    <a
                      href="https://unsplash.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-emerald-600 hover:underline"
                    >
                      Unsplash
                    </a>
                    <a
                      href="https://pexels.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-emerald-600 hover:underline"
                    >
                      Pexels
                    </a>
                    <a
                      href="https://pixabay.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-emerald-600 hover:underline"
                    >
                      Pixabay
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Content
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Article Content *
              </label>
              <RichTextEditor
                value={formData.content}
                onChange={(content) =>
                  setFormData((prev) => ({ ...prev, content }))
                }
                placeholder="Write your article content here..."
                rows={15}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-linear-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-teal-600 transition shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Updating..." : "Update Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBlog;
