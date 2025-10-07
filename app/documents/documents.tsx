import { Link } from "react-router";
import "./documents.css";

export default function Documents() {
  return (
    <div className="documents-container">
      <div className="documents-content">
        <Link to="/" className="documents-back-link">
          Back to Homepage
        </Link>
        
        <div className="documents-card">
          <h1 className="documents-title">My documents</h1>
          
          <div className="documents-empty-state">
            <p>No files yet</p>
            <Link 
              to="/upload" 
              className="documents-empty-link"
            >
              
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}