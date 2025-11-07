import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, getToken, removeToken, getCurrentUser, isAuthenticated } from '../services/api';
import type { AuthContextType, AuthProviderProps } from '~/types/auth'

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [authState, setAuthState] = useState({
        isAuthenticated: false,
        user: null as string | null,
        loading: true
    });

    useEffect(() => {
        const checkAuth = () => {
            const authenticated = isAuthenticated();
            const userInfo = getCurrentUser();

            setAuthState({
                isAuthenticated: authenticated,
                user: authenticated ? (userInfo?.username || null) : null,
                loading: false
            });
        };

        checkAuth();
    }, []);

    const login = async (username: string, password: string) => {
        try {
            console.log(" Attempting login with:", username, password);
            
            
            const data = await authAPI.login(username, password);
            
            console.log(" Login successful:", data);
            
            if (data && data.token) {
                setAuthState({
                    isAuthenticated: true,
                    user: data.username || username,
                    loading: false
                });
                return data;
            } else {
               
                throw new Error(data.message || "Login failed - no token received");
            }
            
        } catch (error) {
            console.error("Login error:", error);
            

            const errorMessage = error instanceof Error 
                ? error.message 
                : "Login failed. Please check your credentials.";
            
            setAuthState({
                isAuthenticated: false,
                user: null,
                loading: false
            });
            
            throw new Error(errorMessage);
        }
    };

    const logout = () => {
        console.log(" Logging out...");
        removeToken();
        setAuthState({
            isAuthenticated: false,
            user: null,
            loading: false
        });
        window.location.href = '/login';
    };

    const value = {
        isAuthenticated: authState.isAuthenticated,
        user: authState.user,
        login,
        logout,
        loading: authState.loading,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}