import { Link } from "react-router";
import "./upload.css";
import { useState, useEffect } from "react";
import { uploadDocument, getDocuments, deleteDocument } from "~/services/api";
import type { Document } from "~/types/document";

export default function Upload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");
  const [message, setMessage] = useState<string>("");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const docs = await getDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error("Error loading documents:", error);
      setMessage("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setMessage("");
      setUploadProgress(0);
      setUploadStatus("");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage("Please select a file first");
      return;
    }

    setUploading(true);
    setUploadProgress(10);
    setUploadStatus("Preparing file...");
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      setUploadStatus("Uploading to server...");
      setUploadProgress(30);

      const result = await uploadDocument(formData);

      clearInterval(progressInterval);
      setUploadProgress(70);
      setUploadStatus("Processing document...");

      await new Promise((resolve) => setTimeout(resolve, 800));

      setUploadProgress(90);
      setUploadStatus("Creating embeddings...");

      await new Promise((resolve) => setTimeout(resolve, 1200));

      setUploadProgress(100);
      setUploadStatus("Done!");

      setMessage("File uploaded successfully!");
      setSelectedFile(null);

      await loadDocuments();

      const fileInput = document.getElementById(
        "file-input"
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      setTimeout(() => {
        setUploadProgress(0);
        setUploadStatus("");
      }, 3000);

    } catch (error) {
      console.error("Upload error:", error);
      setMessage("Upload failed. Please try again.");
      setUploadStatus("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (id: string, fileName: string) => {
    if (!confirm(`Are you sure you want to delete "${fileName}"?`)) {
      return;
    }

    try {
      await deleteDocument(id);
      setMessage(`Document "${fileName}" deleted successfully`);
      setDocuments(documents.filter((doc) => doc.id !== id));
    } catch (error) {
      console.error("Delete error: ", error);
      setMessage("Failed to delete document");
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.classList.add("drag-over");
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.classList.remove("drag-over");
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.classList.remove("drag-over");
    
    const file = event.dataTransfer.files[0];
    if (file) {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const allowedExtensions = ['pdf', 'pptx', 'xlsx', 'xls'];
      
      if (fileExtension && allowedExtensions.includes(fileExtension)) {
        setSelectedFile(file);
        setMessage("");
        setUploadProgress(0);
        setUploadStatus("");
      } else {
        setMessage("Only PDF, Excel and PowerPoint files are allowed");
      }
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
            className={`upload-area ${uploading ? 'uploading' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {uploading ? (
              <div className="upload-progress-container">
                <div className="upload-progress">
                  <div 
                    className="upload-progress-bar" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <div className="upload-status">
                  <div className="upload-spinner"></div>
                  <span>{uploadStatus}</span>
                  <span className="upload-percentage">{uploadProgress}%</span>
                </div>
                <p className="upload-text">
                  Processing: {selectedFile?.name}
                </p>
              </div>
            ) : (
              <>
                <div className="upload-icon"></div>
                <p className="upload-text">
                  Drag and drop your file here or click to browse files
                </p>
                <p className="upload-subtext">
                  Supports PDF, Excel (.xlsx, .xls), PowerPoint (.pptx)
                </p>

                <input
                  id="file-input"
                  type="file"
                  accept=".pdf,.pptx,.xlsx,.xls"
                  onChange={handleFileSelect}
                  style={{ display: "none" }}
                />

                <button
                  className="upload-button"
                  onClick={() => document.getElementById("file-input")?.click()}
                  disabled={uploading}
                >
                  {uploading ? "Uploading..." : "Browse files"}
                </button>
              </>
            )}
          </div>

          {selectedFile && !uploading && (
            <div className="selected-file">
              <div className="file-info">
                <div className="file-details">
                  <p className="file-name">{selectedFile.name}</p>
                  <p className="file-size">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                className="upload-submit-button"
                onClick={handleUpload}
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <span className="button-spinner"></span>
                    Uploading...
                  </>
                ) : (
                  'Upload File'
                )}
              </button>
            </div>
          )}

          {message && (
            <div
              className={`upload-message ${message.includes("success") ? "success" : "error"}`}
            >
              {message.includes("success") ? "✅" : "❌"} {message}
            </div>
          )}

          <div className="uploaded-documents">
            <h2 className="documents-title">
              Uploaded Documents ({documents.length})
            </h2>

            {loading ? (
              <div className="documents-loading">
                <div className="loading-spinner"></div>
                <p>Loading documents...</p>
              </div>
            ) : documents.length === 0 ? (
              <p className="no-documents">
                No documents uploaded yet
              </p>
            ) : (
              <div className="documents-list">
                {documents.map((doc) => (
                  <div key={doc.id} className="document-item">
                    <div className="document-info">
                      <span className="document-name">{doc.name}</span>
                      <span className="document-date">
                        {new Date(doc.uploadDate).toLocaleDateString()}
                      </span>
                    </div>
                    <button
                      className="delete-button"
                      onClick={() => handleDeleteDocument(doc.id, doc.name)}
                      title="Delete document"
                      disabled={uploading}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="upload-info">
            <p>Max file size: 50MB • Files are processed with AI embeddings</p>
          </div>
        </div>
      </div>
    </div>
  );
}