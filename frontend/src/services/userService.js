// API calls for user profile management and saved blogs

import api from "./api";

export const getPublicProfile = async (id) => {
  const response = await api.get(`/users/${id}`);
  return response;
};

export const getMyProfile = async () => {
  const response = await api.get("/users/profile/me");
  return response;
};

export const updateProfile = async (profileData) => {
  const response = await api.put("/users/profile", profileData);
  return response;
};

export const getSavedBlogs = async (params = {}) => {
  const response = await api.get("/users/saved-blogs", { params });
  return response;
};

// Toggle save/unsave a blog
export const toggleSaveBlog = async (blogId) => {
  const response = await api.post(`/users/saved-blogs/${blogId}`);
  return response;
};

export const checkBlogSaved = async (blogId) => {
  const response = await api.get(`/users/saved-blogs/${blogId}/status`);
  return response;
};

const userService = {
  getPublicProfile,
  getMyProfile,
  updateProfile,
  getSavedBlogs,
  toggleSaveBlog,
  checkBlogSaved,
};

export default userService;
