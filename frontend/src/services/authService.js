// API calls for user authentication

import api from "./api";

export const register = async (userData) => {
  const data = await api.post("/auth/register", userData);
  return data;
};

export const login = async (credentials) => {
  const data = await api.post("/auth/login", credentials);
  return data;
};

export const logout = async () => {
  const data = await api.post("/auth/logout");
  return data;
};

export const getCurrentUser = async () => {
  const data = await api.get("/auth/me");
  return data;
};

export const checkSession = async () => {
  const data = await api.get("/auth/check");
  return data;
};

export const changePassword = async (passwordData) => {
  const data = await api.put("/auth/change-password", passwordData);
  return data;
};

export const refreshSession = async () => {
  const data = await api.post("/auth/refresh");
  return data;
};

export const verifyEmail = async (token) => {
  const data = await api.get(`/auth/verify-email/${token}`);
  return data;
};

export const resendVerification = async (email) => {
  const data = await api.post("/auth/resend-verification", { email });
  return data;
};

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
  checkSession,
  changePassword,
  refreshSession,
  verifyEmail,
  resendVerification,
};

export default authService;
