import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import authService from "../services/authService";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider. Make sure your component is wrapped in <AuthProvider>.");
  }

  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check session on mount to restore user state
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await authService.checkSession();

        if (response.success && response.data?.isAuthenticated && response.data?.user) {
          setUser(response.data.user);
        }
      } catch (err) {
        // Silent fail - user just not authenticated
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  // Log in user with email and password
  const login = useCallback(async (email, password) => {
    setError(null);

    try {
      const response = await authService.login({ email, password });

      if (response.success && response.data?.user) {
        setUser(response.data.user);
        return response.data.user;
      }

      throw new Error("Login failed - no user data received");
    } catch (err) {
      const errorMessage = err.message || "Login failed. Please try again.";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Log out current user and destroy session
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setUser(null);
      setError(null);
    }
  }, []);

  // Register new user (requires email verification before login)
  const register = useCallback(async (userData) => {
    setError(null);

    try {
      const response = await authService.register({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        confirmPassword: userData.confirmPassword || userData.password,
        acceptTerms: userData.acceptTerms,
      });

      if (response.success && response.data?.requiresVerification) {
        return response.data;
      }

      if (response.success && response.data?.user) {
        setUser(response.data.user);
        return response.data;
      }

      throw new Error("Registration failed - unexpected response");
    } catch (err) {
      const errorMessage = err.message || "Registration failed. Please try again.";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const isAdmin = useMemo(() => user?.role === "admin" || user?.role === "cr" || user?.isSuperAdmin === true, [user]);
  const isSuperAdmin = useMemo(() => user?.isSuperAdmin === true, [user]);
  const isCR = useMemo(
    () => user?.role === "cr" || user?.isCR === true || user?.isSuperAdmin === true,
    [user]
  );
  // Can see Study Files navbar link
  const hasFileAccess = useMemo(
    () =>
      user?.hasFileAccess === true ||
      user?.isCR === true ||
      user?.role === "cr" ||
      user?.isSuperAdmin === true,
    [user]
  );

  const contextValue = useMemo(
    () => ({
      user,
      login,
      logout,
      register,
      loading,
      error,
      clearError,
      isAdmin,
      isSuperAdmin,
      isCR,
      hasFileAccess,
      isAuthenticated: !!user,
    }),
    [user, login, logout, register, loading, error, clearError, isAdmin, isSuperAdmin, isCR, hasFileAccess]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthContext;
