import { Link } from "react-router";
import "./upload.css";
import { useState } from "react";
import { uploadDocument } from "~/services/api";


export default function Upload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string>("");

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setMessage("");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage("Please select a file first");
      return;
    }

    setUploading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const result = await uploadDocument(formData);
      setMessage("File uploaded successfully!")
      setSelectedFile(null);

      const fileInput = document.getElementById("file-input") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (error) {
      console.error("Upload error:", error);
      setMessage("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault;
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      setMessage("");
    }
  };


   return (
    <div className="upload-container">
      <div className="upload-content">
        <Link to="/" className="upload-back-link">
          Back to homepage
        </Link>
        
        <div className="upload-card">
          <h1 className="upload-title">Upload documents</h1>
          
          <div 
            className="upload-area"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <p className="upload-text">
              Drag and drop your file here or click to browse files
            </p>
            
            <input
              id="file-input"
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            
            <button 
              className="upload-button"
              onClick={() => document.getElementById('file-input')?.click()}
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Choose file"}
            </button>

            {selectedFile && (
              <div className="selected-file">
                <p>Selected file: {selectedFile.name}</p>
                <button 
                  className="upload-submit-button"
                  onClick={handleUpload}
                  disabled={uploading}
                >
                  {uploading ? "Uploading..." : "Upload File"}
                </button>
              </div>
            )}
          </div>

          {message && (
            <div className={`upload-message ${message.includes("success") ? "success" : "error"}`}>
              {message}
            </div>
          )}

          <div className="upload-info">
            <p>Support for PDF files up to 50MB</p>
          </div>
        </div>
      </div>
    </div>
  );
}