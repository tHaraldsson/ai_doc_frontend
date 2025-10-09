import { Link } from "react-router";
import "./home.css";

export default function Home() {
  return (
    <div className="home-container">
      {/* Header */}
      <header className="home-header">
        <div className="home-header-content">
          <h1 className="home-title">AI Document Assistant</h1>
          <p className="home-subtitle">
            Analyze and find information in your documents
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="home-main">
        <div className="home-hero">
          <h2 className="home-hero-title">Smart document search</h2>
          <p className="home-hero-text">
            Upload your files and ask questions about the documents content.
          </p>
        </div>

        {/* Features */}
        <div className="home-features">
          <div className="home-feature-card">
            <h3 className="home-feature-title">Upload your documents</h3>
            <p className="home-feature-text">Support for PDF files</p>
          </div>

          <div className="home-feature-card">
            <h3 className="home-feature-title">Ask questions</h3>
            <p className="home-feature-text">
              Ask about specific parts of your documents and get precise
              answers.
            </p>
          </div>

          <div className="home-feature-card">
            <h3 className="home-feature-title">Conversation</h3>
            <p className="home-feature-text">
              Have dialogues about your documents.
            </p>
          </div>
        </div>

        {/* cta Buttons */}
        <div className="home-cta-section">
          <Link to="/upload" className="home-primary-button">
            Upload documents
          </Link>
          <Link to="/chat" className="home-primary-button">
            Chat with AI
          </Link>
          <div className="home-secondary-link">
            Or{" "}
            <Link to="/documents" className="home-link">
              browse existing documents
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="home-footer">
        <p>AI Document Assistant • Examensarbete • Tommy Haraldsson • 2025</p>
      </footer>
    </div>
  );
}
