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
    error: null as string | null,
  });

  const checkAuth = async () => {
    try {
        console.log("Checking authentication...");

        const authenticated = await isAuthenticated();
        console.log("isAuthenticated result:", authenticated);
        
let userInfo = null;
      if (authenticated) {
        userInfo = await getCurrentUser();
        console.log("getCurrentUser result:", userInfo);
      }
        
        setAuthState({
            isAuthenticated: authenticated,
            user: authenticated ? userInfo?.username || null : null,
            loading: false,
            error: null,
        });
    } catch (error) {
        setAuthState({
            isAuthenticated: false,
            user: null,
            loading: false,
            error: error instanceof Error ? error.message : "Authentication failed",
        });
    }
  };
  
  useEffect(() => {
    checkAuth();
  }, []);

  //login
  const login = async (username: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await authAPI.login(username, password);
      console.log("Login API response:", response);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      await checkAuth();
      
      return { success: true };
    } catch (error: any) {
      console.error("Login error:", error);
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
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
        error: null,
    });
  }
};

  const value: AuthContextType = {
    isAuthenticated: authState.isAuthenticated,
    user: authState.user,
    login,
    logout,
    loading: authState.loading,
    error: authState.error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
