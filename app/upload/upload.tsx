import { Link } from "react-router";
import "./upload.css";

export default function Upload() {
  return (
    <div className="upload-container">
      <div className="upload-content">
        <Link to="/" className="upload-back-link">
          Back to homepage
        </Link>
        
        <div className="upload-card">
          <h1 className="upload-title">Upload documents</h1>
          
          <div className="upload-area">
            <p className="upload-text">
              Pull and release your file here or click to browse files
            </p>
            <button className="upload-button">
              Choose file
            </button>
          </div>

          <div className="upload-info">
            <p>Support for files up to 50MB</p>
          </div>
        </div>
      </div>
    </div>
  );
}