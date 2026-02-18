// API calls for admin operations

import api from "./api";

export const getDashboard = async () => {
  const response = await api.get("/admin/dashboard");
  return response;
};

// Get all users with pagination and filtering
export const getAllUsers = async (params = {}) => {
  const response = await api.get("/admin/users", { params });
  return response;
};

export const getUser = async (id) => {
  const response = await api.get(`/admin/users/${id}`);
  return response;
};

export const updateUserRole = async (id, role) => {
  const response = await api.put(`/admin/users/${id}/role`, { role });
  return response;
};

export const toggleUserStatus = async (id) => {
  const response = await api.put(`/admin/users/${id}/status`);
  return response;
};

export const deleteUser = async (id, deleteContent = false) => {
  const response = await api.delete(`/admin/users/${id}`, {
    params: { deleteContent },
  });
  return response;
};

// Get all blogs (including drafts)
export const getAllBlogs = async (params = {}) => {
  const response = await api.get("/admin/blogs", { params });
  return response;
};

export const getBlogById = async (id) => {
  const response = await api.get(`/admin/blogs/${id}`);
  return response;
};

export const updateBlog = async (id, blogData) => {
  const response = await api.put(`/admin/blogs/${id}`, blogData);
  return response;
};

export const deleteBlog = async (id) => {
  const response = await api.delete(`/admin/blogs/${id}`);
  return response;
};

export const toggleFeatured = async (id) => {
  const response = await api.put(`/admin/blogs/${id}/feature`);
  return response;
};

// Toggle trending status (Super Admin only)
export const toggleTrending = async (id) => {
  const response = await api.put(`/admin/blogs/${id}/trending`);
  return response;
};

// Bulk update blog status
export const bulkUpdateStatus = async (blogIds, status) => {
  const response = await api.put("/admin/blogs/bulk-status", {
    blogIds,
    status,
  });
  return response;
};

// Get all comments with filtering
export const getAllComments = async (params = {}) => {
  const response = await api.get("/admin/comments", { params });
  return response;
};

// Flag/unflag a comment
export const toggleFlagComment = async (id, reason) => {
  const response = await api.put(`/admin/comments/${id}/flag`, { reason });
  return response;
};

export const bulkDeleteComments = async (commentIds) => {
  const response = await api.delete("/admin/comments/bulk", {
    data: { commentIds },
  });
  return response;
};

// Notification functions (Super Admin only)
// Use longer timeout for email operations since sending to many users takes time
const EMAIL_TIMEOUT = 120000; // 2 minutes

export const getRecipientCount = async (recipientType) => {
  const response = await api.get("/admin/notifications/recipient-count", {
    params: { recipientType },
  });
  return response;
};

export const sendNotification = async (notificationData) => {
  const response = await api.post(
    "/admin/notifications/send",
    notificationData,
    { timeout: EMAIL_TIMEOUT }
  );
  return response;
};

export const sendMaintenanceNotification = async (maintenanceData) => {
  const response = await api.post(
    "/admin/notifications/maintenance",
    maintenanceData,
    { timeout: EMAIL_TIMEOUT }
  );
  return response;
};

export const sendErrorAlert = async (errorData) => {
  const response = await api.post(
    "/admin/notifications/error-alert",
    errorData,
    { timeout: EMAIL_TIMEOUT }
  );
  return response;
};

const adminService = {
  // Dashboard
  getDashboard,

  // Users
  getAllUsers,
  getUser,
  updateUserRole,
  toggleUserStatus,
  deleteUser,

  // Blogs
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  toggleFeatured,
  toggleTrending,
  bulkUpdateStatus,

  // Comments
  getAllComments,
  toggleFlagComment,
  bulkDeleteComments,

  // Notifications
  getRecipientCount,
  sendNotification,
  sendMaintenanceNotification,
  sendErrorAlert,
};

export default adminService;
