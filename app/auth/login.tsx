// app/auth/login.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '~/context/AuthContext';
import { useNavigate, Link, useLocation } from "react-router";
import './auth.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRedirectMessage, setShowRedirectMessage] = useState(false);
  
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as any;
  const from = state?.from || '/';
  const message = state?.message;

  console.log("Login page state:", { from, message, isAuthenticated });

  useEffect(() => {
    console.log("Login useEffect running");
    
    if (isAuthenticated) {
      console.log("Already authenticated, redirecting to:", from);
      navigate(from, { replace: true });
      return;
    }
    
    if (message) {
      console.log("Showing redirect message:", message);
      setShowRedirectMessage(true);
      if (window.history.replaceState) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [isAuthenticated, navigate, from, message]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(username, password); 
      if (result.success) {
        console.log("Login successful, redirecting to:", from);
        navigate(from, { replace: true });
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Login</h2>
        
        {showRedirectMessage && message && (
          <div className="redirect-message">
            <div className="message-content">
              <p>{message}</p>
              <small>Log in to continue to {from !== '/' ? from : 'homepage'}</small>
            </div>
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
            {loading ? 'Logging in...' : 'Login'}
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