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
        console.log("[AUTH] Checking session on mount...");
        const response = await authService.checkSession();

        console.log("[AUTH] Session check response:", {
          success: response.success,
          isAuthenticated: response.data?.isAuthenticated,
          hasUser: !!response.data?.user,
          user: response.data?.user,
        });

        if (response.success && response.data?.isAuthenticated && response.data?.user) {
          console.log("[AUTH] Restoring user from session:", response.data.user.email);
          setUser(response.data.user);
        } else {
          console.log("[AUTH] No valid session found, user not restored");
        }
      } catch (err) {
        console.error("[AUTH] Session check failed:", err);
        console.error("[AUTH] Error details:", err.message, err.status);
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

  const isAdmin = useMemo(() => user?.role === "admin", [user]);
  const isSuperAdmin = useMemo(() => user?.isSuperAdmin === true, [user]);

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
      isAuthenticated: !!user,
    }),
    [user, login, logout, register, loading, error, clearError, isAdmin, isSuperAdmin]
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
