import { Link } from "react-router";
import "./upload.css";
import { useState, useEffect } from "react";
import { uploadDocument, getDocuments, deleteDocument } from "~/services/api";
import type { Document } from "~/types/document";

export default function Upload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
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
      setMessage("File uploaded successfully!");
      setSelectedFile(null);

      await loadDocuments();

      const fileInput = document.getElementById(
        "file-input"
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (error) {
      console.error("Upload error:", error);
      setMessage("Upload failed. Please try again.");
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
              style={{ display: "none" }}
            />

            <button
              className="upload-button"
              onClick={() => document.getElementById("file-input")?.click()}
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
            <div
              className={`upload-message ${message.includes("success") ? "success" : "error"}`}
            >
              {message}
            </div>
          )}

          <div className="uploaded-documents">
            <h2 className="documents-title">
              Uploaded Documents ({documents.length})
            </h2>

            {loading ? (
              <p>Loading documents...</p>
            ) : documents.length === 0 ? (
              <p className="no-documents">No documents uploaded yet</p>
            ) : (
              <div className="documents-list">
                {documents.map((doc) => (
                  <div key={doc.id} className="document-item">
                    <div className="document-info">
                      <span className="document-name">{doc.name}</span>
                    </div>
                    <button
                      className="delete-button"
                      onClick={() => handleDeleteDocument(doc.id, doc.name)}
                      title="Delete document"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="upload-info">
            <p>Support for PDF files up to 50MB</p>
          </div>
        </div>
      </div>
    </div>
  );
}
