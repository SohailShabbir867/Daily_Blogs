// File Service — API calls for private study file management

import api from "./api";

// ── Public ──────────────────────────────────────────────────────────────────

/** List all active files with optional filters */
export const getFiles = async (params = {}) => {
  return api.get("/files", { params });
};

/** Get all unique subjects for filter dropdown */
export const getSubjects = async () => {
  return api.get("/files/subjects");
};

/** Get single file metadata (no URL) */
export const getFile = async (id) => {
  return api.get(`/files/${id}`);
};

/** Verify password and receive the file URL */
export const accessFile = async (id, password) => {
  return api.post(`/files/${id}/access`, { password });
};

// ── CR / Super Admin ─────────────────────────────────────────────────────────

/** Get files uploaded by the current logged-in CR */
export const getMyFiles = async (params = {}) => {
  return api.get("/files/cr/my", { params });
};

/** Upload a new file entry (fileUrl comes from Cloudinary upload) */
export const createFile = async (fileData) => {
  return api.post("/files", fileData);
};

/** Update file metadata */
export const updateFile = async (id, updates) => {
  return api.put(`/files/${id}`, updates);
};

/** Delete a file */
export const deleteFile = async (id) => {
  return api.delete(`/files/${id}`);
};

// ── Super Admin ──────────────────────────────────────────────────────────────

/** Get ALL files including inactive (super admin) */
export const adminGetAllFiles = async (params = {}) => {
  return api.get("/files/admin/all", { params });
};

/** Toggle file active status */
export const toggleFileStatus = async (id) => {
  return api.patch(`/files/${id}/toggle`);
};

// ── CR Role Management (called from UserManagement) ──────────────────────────

/** Assign CR role to a user (super admin only) */
export const makeCR = async (userId) => {
  return api.patch(`/admin/manage/users/${userId}/make-cr`);
};

/** Remove CR role from a user (super admin only) */
export const removeCR = async (userId) => {
  return api.patch(`/admin/manage/users/${userId}/remove-cr`);
};

/** Grant file access to a user (Super Admin or CR) */
export const grantFileAccess = async (userId) => {
  return api.patch(`/admin/manage/users/${userId}/grant-file-access`);
};

/** Revoke file access from a user (Super Admin or CR) */
export const revokeFileAccess = async (userId) => {
  return api.patch(`/admin/manage/users/${userId}/revoke-file-access`);
};
