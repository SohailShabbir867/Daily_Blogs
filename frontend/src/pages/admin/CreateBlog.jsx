import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { createBlog } from "../../services/blogService";
import RichTextEditor from "../../components/RichTextEditor";

const CreateBlog = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState("");
  const [imagePreviewLoaded, setImagePreviewLoaded] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    category: "",
    author: user?.name || "",
    image: "",
    readTime: 5,
    status: "published",
    visibility: "everyone",
  });
  const [error, setError] = useState("");

  // Redirect if not admin
  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  const categories = [
    "Development",
    "Design",
    "Career",
    "React",
    "JavaScript",
    "Best Practices",
    "Accessibility",
    "Tutorial",
    "News",
    "Other",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate required fields
    if (!formData.title || formData.title.length < 5) {
      setError("Title must be at least 5 characters");
      return;
    }

    if (!formData.description || formData.description.length < 20) {
      setError("Description must be at least 20 characters");
      return;
    }

    if (!formData.content || formData.content.length < 50) {
      setError("Content must be at least 50 characters");
      return;
    }

    if (!formData.category) {
      setError("Please select a category");
      return;
    }

    const newBlog = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      content: formData.content,
      category: formData.category,
      status: formData.status || "published",
      visibility: formData.visibility || "everyone",
    };

    // Only add image if it's provided and not empty
    if (formData.image && formData.image.trim()) {
      newBlog.image = formData.image.trim();
    }

    console.log("Submitting blog:", newBlog);

    try {
      setIsSubmitting(true);
      await createBlog(newBlog);
      navigate("/admin/manage");
    } catch (err) {
      console.error("Error creating blog:", err);
      // Extract validation errors from response
      const errorData = err.response?.data;
      if (errorData?.errors && Array.isArray(errorData.errors)) {
        setError(errorData.errors.map((e) => e.msg || e.message).join(", "));
      } else {
        setError(
          errorData?.message ||
            err.message ||
            "Failed to create blog post. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
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
          <h1 className="text-3xl font-bold text-gray-900">Create New Post</h1>
          <p className="text-gray-500 mt-1">Write and publish a new article</p>
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Basic Information
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *{" "}
                  <span className="text-gray-400 font-normal">
                    (min 5 characters)
                  </span>
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
                <p
                  className={`text-xs mt-1 ${
                    formData.title.length >= 5
                      ? "text-green-600"
                      : "text-gray-400"
                  }`}
                >
                  {formData.title.length}/5 characters minimum
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *{" "}
                  <span className="text-gray-400 font-normal">
                    (min 20 characters)
                  </span>
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
                <p
                  className={`text-xs mt-1 ${
                    formData.description.length >= 20
                      ? "text-green-600"
                      : "text-gray-400"
                  }`}
                >
                  {formData.description.length}/20 characters minimum
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
                    required
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
                    Read Time (minutes)
                  </label>
                  <input
                    type="number"
                    name="readTime"
                    value={formData.readTime}
                    onChange={handleChange}
                    min="1"
                    max="60"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
                  />
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
                  Cover Image
                </label>
                <div className="space-y-3">
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

                  {/* Image Tips */}
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>
                      💡 <strong>Tips for best image quality:</strong>
                    </p>
                    <ul className="list-disc list-inside ml-2 space-y-0.5">
                      <li>
                        Use direct image URLs (ending in .jpg, .png, .webp)
                      </li>
                      <li>
                        Recommended sources: Unsplash, Pexels, or your own
                        hosted images
                      </li>
                      <li>
                        Avoid Google Images links - they often don&apos;t work
                      </li>
                      <li>Minimum recommended size: 1200x630 pixels</li>
                    </ul>
                  </div>

                  {/* Image Preview */}
                  {formData.image && (
                    <div className="relative">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Preview:
                      </p>
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
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
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
                              "Could not load image. Check if the URL is correct and accessible."
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

                      {/* Clear image button */}
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

                  {/* Quick Image Sources */}
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs text-gray-500">
                      Quick sources:
                    </span>
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
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Content
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Use the toolbar to format your content: make text{" "}
              <strong>bold</strong>, add headings, insert links, and create
              lists.
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Article Content *{" "}
                <span className="text-gray-400 font-normal">
                  (min 50 characters)
                </span>
              </label>
              <RichTextEditor
                value={formData.content}
                onChange={(content) =>
                  setFormData((prev) => ({ ...prev, content }))
                }
                placeholder="Start writing your article here... Use the toolbar above to format your text."
                rows={20}
              />
              <p
                className={`text-xs mt-2 ${
                  formData.content.replace(/<[^>]*>/g, "").length >= 50
                    ? "text-green-600"
                    : "text-gray-400"
                }`}
              >
                {formData.content.replace(/<[^>]*>/g, "").length}/50 characters
                minimum (plain text count, excluding HTML tags)
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Tip: Select text and click Bold (B) to make it bold, or click
                the link icon to add a hyperlink.
              </p>
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
              {isSubmitting
                ? "Publishing..."
                : formData.status === "published"
                ? "Publish Post"
                : "Save as Draft"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBlog;
