import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
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
  
  // Auth check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("AuthProvider: Checking authentication...");
        const authenticated = await isAuthenticated();
        console.log("AuthProvider: isAuthenticated result:", authenticated);
        
        let userInfo = null;
        if (authenticated) {
          userInfo = await getCurrentUser();
          console.log("AuthProvider: getCurrentUser result:", userInfo);
        }
          
        setAuthState({
          isAuthenticated: authenticated,
          user: authenticated ? userInfo?.username || null : null,
          loading: false,
          error: null,
        });
        
      } catch (error) {
        console.error("AuthProvider: Auth check error:", error);
        
        const hasJwtCookie = document.cookie.includes('jwt=');
        const isLikelyAuthenticated = hasJwtCookie;
        
        setAuthState({
          isAuthenticated: false, 
          user: null,
          loading: false,
          error: null,
        });
      }
    };
    
    checkAuth();
  }, []);

  // Login
  const login = useCallback(async (username: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await authAPI.login(username, password);
      console.log("AuthProvider: Login API response:", response);
      
      setAuthState({
        isAuthenticated: true,
        user: username,
        loading: false,
        error: null,
      });
      
      return { success: true };
    } catch (error: any) {
      console.error("AuthProvider: Login error:", error);
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
      return { success: false, error: error.message };
    }
  }, []);
  
  // Logout
  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("AuthProvider: Logout error:", error);
    } finally {
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
      });
    }
  }, []);
  
  const value = useMemo(() => ({
    isAuthenticated: authState.isAuthenticated,
    user: authState.user,
    login,
    logout,
    loading: authState.loading,
    error: authState.error,
  }), [
    authState.isAuthenticated, 
    authState.user, 
    authState.loading, 
    authState.error,
    login,
    logout,
  ]);

  console.log("AuthProvider: Rendering with state:", authState);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};