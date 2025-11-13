import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI, getCurrentUser, isAuthenticated } from "../services/api";
import type { AuthContextType, AuthProviderProps } from "~/types/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null as string | null,
    loading: true,
  });

  const checkAuth = async () => {
    try {
        const authenticated = await isAuthenticated();
        const userInfo = await getCurrentUser();

        setAuthState({
            isAuthenticated: authenticated,
            user: authenticated ? userInfo?.username || null : null,
            loading: false,
        });
    } catch (error) {
        setAuthState({
            isAuthenticated: false,
            user: null,
            loading: false,
        });
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  //login
  const login = async (username: string, password: string) => {
    try {
      const response = await authAPI.login(username, password);
      await checkAuth();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  //logout
  const logout = async () => {
try {
    await authAPI.logout();
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
    });
  }
};

  const value: AuthContextType = {
    isAuthenticated: authState.isAuthenticated,
    user: authState.user,
    login,
    logout,
    loading: authState.loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
