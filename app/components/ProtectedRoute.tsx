import { Navigate, useLocation } from "react-router";
import { useAuth } from "~/context/AuthContext";
import type { ReactNode } from "react";
import { useState, useEffect } from "react";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const [showRedirectMessage, setShowRedirectMessage] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setShowRedirectMessage(true);
      const timer = setTimeout(() => {
        setShowRedirectMessage(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [loading, isAuthenticated]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Checking authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (showRedirectMessage) {
      return (
        <div className="redirect-message">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Redirecting to login page...</p>
            <p className="small-text">
              You need to be logged in to access this page
            </p>
          </div>
        </div>
      );
    }

    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
          message: "Please log in to access this page",
        }}
      />
    );
  }

  return <>{children}</>;
}
