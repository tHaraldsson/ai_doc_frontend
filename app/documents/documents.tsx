import { fetchTextFromDb } from "~/services/api";
import type { Document } from "~/types/document";
import { Link } from "react-router";
import "./documents.css";
import { useEffect, useState } from "react";

export default function Documents() {
  const [textContent, setTextContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadText() {
      try {
        const text = await fetchTextFromDb();
        setTextContent(text);
      } catch (err) {
        setError("could not load document");
        console.error("Error fetching documents: ", err);
      } finally {
        setLoading(false);
      }
    }

    loadText();
  }, []);

  if (loading) {
    return (
      <div className="documents-container">
        <div className="documents-content">
          <div className="documents-card">
            <p>Loading documents...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="documents-container">
        <div className="documents-content">
          <div className="documents-card">
            <p className="error-message">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="documents-container">
      <div className="documents-content">
        <Link to="/" className="documents-back-link">
          Back to Homepage
        </Link>

        <div className="documents-card">
          <h1 className="documents-title">Document Content</h1>

          {textContent ? (
            <div className="text-content">
              <pre className="content-text">{textContent}</pre>
            </div>
          ) : (
            <div className="documents-empty-state">
              <p>No content available</p>
              <Link to="/upload" className="documents-empty-link">
                Upload a document
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
