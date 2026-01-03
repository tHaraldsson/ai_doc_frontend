import React, { useState, useEffect } from "react";
import { useAuth } from "~/context/AuthContext";
import { useNavigate, Link, useLocation } from "react-router";
import "./auth.css";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as any;
  const from = state?.from || "/";
  const message = state?.message || "";

  console.log("Login page - state:", { from, message, isAuthenticated });

  const hasRedirected = React.useRef(false);

  useEffect(() => {
    if (isAuthenticated && !hasRedirected.current) {
      hasRedirected.current = true;
      console.log("Already authenticated, redirecting to:", from);
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    hasRedirected.current = false;

    try {
      const result = await login(username, password);
      if (result.success) {
        console.log("Login successful, will redirect...");
      } else {
        setError(result.error || "Login failed");
        setLoading(false);
      }
    } catch (error: any) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Login</h2>

        {/* Visa meddelande från ProtectedRoute */}
        {message && (
          <div className="info-message">
            <p>{message}</p>
            <small>
              Log in to access {from !== "/" ? from : "the protected page"}
            </small>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
              autoFocus
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
          <p className="back-link">
            <Link to="/">← Back to homepage</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
