// API calls for comment operations

import api from "./api";

// Get comments for a blog post
export const getComments = async (blogId, params = {}) => {
  const response = await api.get(`/blogs/${blogId}/comments`, { params });
  return response;
};

export const getComment = async (id) => {
  const response = await api.get(`/comments/${id}`);
  return response;
};

// Create a new comment on a blog
export const createComment = async (blogId, commentData) => {
  const response = await api.post(`/blogs/${blogId}/comments`, commentData);
  return response;
};

// Reply to a comment
export const replyToComment = async (blogId, parentCommentId, text) => {
  const response = await api.post(`/blogs/${blogId}/comments`, {
    text,
    parentComment: parentCommentId,
  });
  return response;
};

// Like/unlike a comment
export const toggleLikeComment = async (commentId) => {
  const response = await api.post(`/comments/${commentId}/like`);
  return response;
};

export const updateComment = async (id, commentData) => {
  const response = await api.put(`/comments/${id}`, commentData);
  return response;
};

export const deleteComment = async (id) => {
  const response = await api.delete(`/comments/${id}`);
  return response;
};

const commentService = {
  getComments,
  getComment,
  createComment,
  replyToComment,
  toggleLikeComment,
  updateComment,
  deleteComment,
};

export default commentService;
