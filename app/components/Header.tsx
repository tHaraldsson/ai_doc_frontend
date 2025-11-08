import { LogoutButton } from "./LogoutButton";
import { useAuth } from "~/context/AuthContext";
import "./header.css";

export function Header() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <header className="header">
        <div className="header-content">
          <h1 className="header-title">AI Document Assistant</h1>
          <div>Loading...</div>
        </div>
      </header>
    );
  }

  return (
    <header className="header">
      <div className="header-content">
        <h1 className="header-title">AI Document Assistant</h1>
        
        <div className="header-user-section">
          {user ? (
            <>
              <span className="user-greeting">Logged in as: {user}</span>
              <LogoutButton />
            </>
          ) : (
            <a href="/login" className="login-link">
              Login
            </a>
          )}
        </div>
      </div>
    </header>
  );
}