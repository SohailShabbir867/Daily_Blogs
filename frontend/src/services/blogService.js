// API calls for blog operations

import api from "./api";

// Get all published blogs with pagination and filtering
export const getBlogs = async (params = {}) => {
  const response = await api.get("/blogs", { params });
  return response;
};

// Get a single blog by slug or ID
export const getBlogBySlug = async (identifier) => {
  const response = await api.get(`/blogs/${identifier}`);
  return response;
};

export const getFeaturedBlogs = async () => {
  const response = await api.get("/blogs/featured");
  return response;
};

export const getCategories = async () => {
  const response = await api.get("/blogs/categories");
  return response;
};

export const createBlog = async (blogData) => {
  const response = await api.post("/blogs", blogData);
  return response;
};

export const updateBlog = async (id, blogData) => {
  const response = await api.put(`/blogs/${id}`, blogData);
  return response;
};

export const deleteBlog = async (id) => {
  const response = await api.delete(`/blogs/${id}`);
  return response;
};

export const getMyBlogs = async (params = {}) => {
  const response = await api.get("/blogs/user/my-blogs", { params });
  return response;
};

// Toggle like on a blog
export const toggleLike = async (id) => {
  const response = await api.post(`/blogs/${id}/like`);
  return response;
};

export const getLikeStatus = async (id) => {
  const response = await api.get(`/blogs/${id}/like-status`);
  return response;
};

const blogService = {
  getBlogs,
  getBlogBySlug,
  getFeaturedBlogs,
  getCategories,
  createBlog,
  updateBlog,
  deleteBlog,
  getMyBlogs,
  toggleLike,
  getLikeStatus,
};

export default blogService;
