import { Link } from "react-router";
import "./upload.css";
import { useState, useEffect, useRef } from "react";
import { uploadDocument, getDocuments, deleteDocument } from "~/services/api";
import type { Document } from "~/types/document";
import type { FileWithPath } from "~/types/upload";

export default function Upload() {
  const [selectedFiles, setSelectedFiles] = useState<FileWithPath[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");
  const [message, setMessage] = useState<string>("");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<boolean | null>(null);
  const [deletingAll, setDeletingAll] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

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
      setUploadSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAllDocuments = async () => {
    if (documents.length === 0) {
      setMessage("No documents to delete");
      setUploadSuccess(false);
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete ALL ${documents.length} documents? This cannot be undone.`
      )
    ) {
      return;
    }
    
    setDeletingAll(true);
    setDeleteSuccess(null);
    setMessage(`Deleting ${documents.length} documents...`);
    setUploadSuccess(null);

    try {
      let deletedCount = 0;
      let failedFiles: string[] = [];

      for (const doc of documents) {
        try {
          await deleteDocument(doc.id);
          deletedCount++;

          setMessage(`Deleting... ${deletedCount}/${documents.length}`);
        } catch (error) {
          console.error(`Failed to delete ${doc.name}:`, error);
          failedFiles.push(doc.name);
        }

        if (deletedCount < documents.length) {
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
      }
      
      if (failedFiles.length === 0) {
        setMessage(`✅ Successfully deleted ${deletedCount} documents`);
        setDeleteSuccess(`Deleted ${deletedCount} documents`);
        setUploadSuccess(true);

        setTimeout(() => {
          setMessage("");
          setDeleteSuccess(null);
          setUploadSuccess(null);
        }, 3000);

        await loadDocuments();
      } else {
        setMessage(
          `Deleted ${deletedCount} files, failed: ${failedFiles.length}`
        );
        setUploadSuccess(false);
      }
    } catch (error) {
      console.error("Error deleting all documents:", error);
      setMessage("❌ Failed to delete all documents");
      setUploadSuccess(false);
    } finally {
      setDeletingAll(false);
    }
  };

  const handleDeleteDocument = async (id: string, fileName: string) => {
    if (!confirm(`Are you sure you want to delete "${fileName}"?`)) {
      return;
    }

    try {
      await deleteDocument(id);

      setMessage(`✅ Document "${fileName}" deleted successfully`);
      setDeleteSuccess(fileName);
      setUploadSuccess(true);

      setDocuments(documents.filter((doc) => doc.id !== id));

      setTimeout(() => {
        setMessage("");
        setDeleteSuccess(null);
        setUploadSuccess(null);
      }, 3000);
    } catch (error) {
      console.error("Delete error: ", error);
      setMessage(`❌ Failed to delete "${fileName}"`);
      setUploadSuccess(false);
    }
  };

  const handleFolderSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const fileArray: FileWithPath[] = [];
    const allowedExtensions = ["pdf", "pptx", "xlsx", "xls", "ppt"];

    Array.from(files).forEach((file) => {
      const fileExtension = file.name.split(".").pop()?.toLowerCase();

      if (fileExtension && allowedExtensions.includes(fileExtension)) {
        const webkitPath = file.webkitRelativePath || "";
        const folderPath = webkitPath.split("/").slice(0, -1).join("/");

        fileArray.push({
          file,
          webkitRelativePath: webkitPath,
          relativePath: webkitPath,
          folderPath,
          filename: file.name,
        });
      }
    });

    if (fileArray.length > 0) {
      setSelectedFiles(fileArray);
      setMessage(`Found ${fileArray.length} files in folder`);
      setUploadProgress(0);
      setUploadStatus("");
      setUploadSuccess(null);
    } else {
      setMessage("No supported files found in the selected folder");
      setUploadSuccess(false);
    }

    if (event.target) {
      event.target.value = "";
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const fileArray: FileWithPath[] = [];
    const allowedExtensions = ["pdf", "pptx", "xlsx", "xls", "ppt"];

    Array.from(files).forEach((file) => {
      const fileExtension = file.name.split(".").pop()?.toLowerCase();

      if (fileExtension && allowedExtensions.includes(fileExtension)) {
        fileArray.push({
          file,
          webkitRelativePath: file.name,
          relativePath: file.name,
          folderPath: "",
          filename: file.name,
        });
      }
    });

    if (fileArray.length > 0) {
      setSelectedFiles((prev) => [...prev, ...fileArray]);
      setMessage(`Added ${fileArray.length} file(s)`);
      setUploadSuccess(null);
    } else {
      setMessage("No supported files selected");
      setUploadSuccess(false);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
    event.dataTransfer.dropEffect = "copy";
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    const items = event.dataTransfer.items;
    const files: FileWithPath[] = [];
    const allowedExtensions = ["pdf", "pptx", "xlsx", "xls", "ppt"];

    const getFilesFromEntry = async (
      entry: any,
      path = ""
    ): Promise<FileWithPath[]> => {
      const results: FileWithPath[] = [];

      if (entry.isFile) {
        return new Promise((resolve) => {
          entry.file((file: File) => {
            const fileExtension = file.name.split(".").pop()?.toLowerCase();
            if (fileExtension && allowedExtensions.includes(fileExtension)) {
              results.push({
                file,
                webkitRelativePath: path ? `${path}/${file.name}` : file.name,
                relativePath: path ? `${path}/${file.name}` : file.name,
                folderPath: path,
                filename: file.name,
              });
            }
            resolve(results);
          });
        });
      } else if (entry.isDirectory) {
        const dirReader = entry.createReader();
        const entries = await new Promise<any[]>((resolve) => {
          dirReader.readEntries(resolve);
        });

        for (const childEntry of entries) {
          const childPath = path ? `${path}/${entry.name}` : entry.name;
          const childFiles = await getFilesFromEntry(childEntry, childPath);
          results.push(...childFiles);
        }
      }

      return results;
    };

    try {
      const filePromises: Promise<FileWithPath[]>[] = [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const entry = item.webkitGetAsEntry();

        if (entry) {
          filePromises.push(getFilesFromEntry(entry));
        }
      }

      const allFilesArrays = await Promise.all(filePromises);
      const allFiles = allFilesArrays.flat();

      if (allFiles.length > 0) {
        setSelectedFiles(allFiles);
        setMessage(`Found ${allFiles.length} files in dropped folder(s)`);
        setUploadSuccess(null);
      } else {
        setMessage("No supported files found in dropped items");
        setUploadSuccess(false);
      }
    } catch (error) {
      console.error("Error processing dropped items:", error);
      setMessage(
        "Error processing dropped items. Try selecting folder manually."
      );
      setUploadSuccess(false);
    }
  };

  const handleUploadAll = async () => {
  if (selectedFiles.length === 0) {
    setMessage("Please select files or folders first");
    setUploadSuccess(false);
    return;
  }

  setUploading(true);
  setUploadSuccess(null);
  setUploadStatus("Preparing upload...");
  setUploadProgress(0);

  const totalFiles = selectedFiles.length;
  let uploadedCount = 0;
  let failedFiles: { name: string; error: string }[] = [];

  console.log("=== START UPLOAD DEBUG ===");
  console.log("Total files to upload:", totalFiles);

  for (let i = 0; i < selectedFiles.length; i++) {
    const fileWithPath = selectedFiles[i];
    const progress = Math.round((i / totalFiles) * 100);

    setUploadProgress(progress);
    setUploadStatus(
      `Uploading ${i + 1}/${totalFiles}: ${fileWithPath.filename}`
    );

    try {
      console.log(`\n--- File ${i + 1} ---`);
      console.log("Filename:", fileWithPath.filename);
      console.log("File object:", fileWithPath.file);
      console.log("File size:", fileWithPath.file.size, "bytes");
      console.log("File type:", fileWithPath.file.type);
      console.log("File instanceof File:", fileWithPath.file instanceof File);
      console.log("File instanceof Blob:", fileWithPath.file instanceof Blob);
      
      const arrayBuffer = await fileWithPath.file.arrayBuffer();
      console.log("ArrayBuffer size:", arrayBuffer.byteLength, "bytes");
      
      if (arrayBuffer.byteLength === 0) {
        console.error("ERROR: ArrayBuffer is 0 bytes! File is empty!");
        throw new Error("File appears to be empty when read");
      }

      const formData = new FormData();
      formData.append("file", fileWithPath.file, fileWithPath.filename);
      
      console.log("FormData created");
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, 
          value instanceof File 
            ? `${value.name} (${value.size} bytes)` 
            : value
        );
      }

      if (arrayBuffer.byteLength > 0) {
        const bytes = new Uint8Array(arrayBuffer.slice(0, 20));
        const hex = Array.from(bytes)
          .map(b => b.toString(16).padStart(2, '0'))
          .join(' ');
        console.log("First 20 bytes (hex):", hex);
        
        const ascii = Array.from(bytes)
          .map(b => b >= 32 && b < 127 ? String.fromCharCode(b) : '.')
          .join('');
        console.log("First 20 bytes (ASCII):", ascii);
      }

      if (i > 0) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      console.log("Sending upload request...");
      await uploadDocument(formData);
      console.log("Upload successful!");
      
      uploadedCount++;
      
    } catch (error: any) {
      console.error(`FAILED to upload ${fileWithPath.filename}:`, error);
      
      let errorMessage = "Unknown error";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      failedFiles.push({
        name: fileWithPath.filename,
        error: errorMessage,
      });
    }
  }

  console.log("=== UPLOAD COMPLETE ===");
  console.log("Uploaded:", uploadedCount, "Failed:", failedFiles.length);

    setUploadProgress(100);

    if (failedFiles.length === 0) {
      setUploadStatus("All files uploaded successfully!");
      setMessage(`Successfully uploaded ${uploadedCount} file(s)`);
      setUploadSuccess(true);

      setSelectedFiles([]);
    } else {
      setUploadStatus("Upload completed with errors");

      const errorDetails = failedFiles
        .slice(0, 3)
        .map((f) => `${f.name}: ${f.error}`)
        .join("; ");

      const extraMsg =
        failedFiles.length > 3 ? `... and ${failedFiles.length - 3} more` : "";
      setMessage(
        `Uploaded ${uploadedCount} files, failed: ${failedFiles.length} (${errorDetails}${extraMsg})`
      );
      setUploadSuccess(false);
    }

    await loadDocuments();

    setTimeout(() => {
      setUploading(false);
      setUploadProgress(0);
      setUploadStatus("");
    }, 3000);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setUploadSuccess(null);
  };

  const clearAllFiles = () => {
    setSelectedFiles([]);
    setMessage("");
    setUploadSuccess(null);
  };

  const groupFilesByFolder = () => {
    const groups: Record<string, FileWithPath[]> = {};

    selectedFiles.forEach((fileWithPath) => {
      const folder = fileWithPath.folderPath || "Files";
      if (!groups[folder]) {
        groups[folder] = [];
      }
      groups[folder].push(fileWithPath);
    });

    return groups;
  };

  const getTotalSize = () => {
    const totalBytes = selectedFiles.reduce(
      (sum, fileWithPath) => sum + fileWithPath.file.size,
      0
    );

    if (totalBytes < 1024 * 1024) {
      return `${(totalBytes / 1024).toFixed(1)} KB`;
    }
    return `${(totalBytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="upload-container">
      <div className="upload-content">
        <Link to="/" className="upload-back-link">
          Back to homepage
        </Link>

        <div className="upload-card">
          <h1 className="upload-title">Upload Documents & Folders</h1>

          <div
            className={`upload-area ${isDragging ? "drag-over" : ""} ${uploading ? "uploading" : ""}`}
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
                  Uploading {selectedFiles.length} files...
                </p>
              </div>
            ) : (
              <>
                <div className="upload-icon"></div>
                <p className="upload-text">
                  Drag and drop folders or files here
                </p>
                <p className="upload-subtext">
                  Supports folders with PDF, Excel, PowerPoint files
                </p>

                <div className="upload-buttons">
                  <button
                    className="upload-button"
                    onClick={() => folderInputRef.current?.click()}
                  >
                    Select Folder
                  </button>
                  <span className="button-separator">or</span>
                  <button
                    className="upload-button secondary"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Select Files
                  </button>
                </div>

                <input
                  ref={folderInputRef}
                  type="file"
                  accept=".pdf,.pptx,.xlsx,.xls,.ppt"
                  onChange={handleFolderSelect}
                  style={{ display: "none" }}
                  webkitdirectory=""
                  directory=""
                  multiple
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.pptx,.xlsx,.xls,.ppt"
                  onChange={handleFileSelect}
                  style={{ display: "none" }}
                  multiple
                />
              </>
            )}
          </div>

          {message && (
            <div
              className={`upload-message ${
                uploadSuccess === true
                  ? "success"
                  : uploadSuccess === false
                    ? "error"
                    : "info"
              }`}
            >
              {uploadSuccess === true && "✅ "}
              {uploadSuccess === false && "❌ "}
              <div className="message-content">
                {message}
                {uploadSuccess === false &&
                  selectedFiles.length > 0 &&
                  message.toLowerCase().includes("failed") && (
                    <button
                      className="retry-button"
                      onClick={() => {
                        setMessage("");
                        handleUploadAll();
                      }}
                    >
                      Retry Failed Files
                    </button>
                  )}
              </div>
            </div>
          )}

          {selectedFiles.length > 0 && !uploading && (
            <div className="selected-files-summary">
              <div className="summary-header">
                <h3>
                  Selected: {selectedFiles.length} file(s) ({getTotalSize()})
                </h3>
                <div className="summary-actions">
                  <button className="clear-all-button" onClick={clearAllFiles}>
                    Clear All
                  </button>
                  <button
                    className="upload-submit-button"
                    onClick={handleUploadAll}
                  >
                    Upload All Files
                  </button>
                </div>
              </div>

              {Object.entries(groupFilesByFolder()).map(([folder, files]) => (
                <div key={folder} className="folder-group">
                  <div className="folder-header">
                    <span className="folder-name">
                      {folder === "Files" ? "Files" : folder}
                    </span>
                    <span className="file-count">({files.length} files)</span>
                  </div>
                  <div className="files-list">
                    {files.map((fileWithPath, fileIndex) => {
                      const globalIndex = selectedFiles.findIndex(
                        (f) =>
                          f.webkitRelativePath ===
                          fileWithPath.webkitRelativePath
                      );

                      return (
                        <div key={globalIndex} className="file-item">
                          <div className="file-info">
                            <div className="file-details">
                              <p className="file-name">
                                {fileWithPath.filename}
                              </p>
                              <p className="file-size">
                                {(fileWithPath.file.size / 1024 / 1024).toFixed(
                                  2
                                )}{" "}
                                MB
                              </p>
                            </div>
                          </div>
                          <button
                            className="remove-file-button"
                            onClick={() => removeFile(globalIndex)}
                            title="Remove file"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="uploaded-documents">
            <div className="documents-header">
              <h2 className="documents-title">
                Uploaded Documents ({documents.length})
              </h2>

              {documents.length > 0 && (
                <button
                  className="delete-all-button"
                  onClick={handleDeleteAllDocuments}
                  disabled={deletingAll || uploading}
                  title="Delete all documents"
                >
                  {deletingAll ? (
                    <>
                      <span className="button-spinner"></span>
                      Deleting...
                    </>
                  ) : (
                    "Delete All"
                  )}
                </button>
              )}
            </div>

            {loading ? (
              <div className="documents-loading">
                <div className="loading-spinner"></div>
                <p>Loading documents...</p>
              </div>
            ) : documents.length === 0 ? (
              <p className="no-documents">No documents uploaded yet</p>
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
                      className={`delete-button ${deleteSuccess === doc.name ? "success" : ""}`}
                      onClick={() => handleDeleteDocument(doc.id, doc.name)}
                      title="Delete document"
                      disabled={deletingAll || uploading}
                    >
                      {deleteSuccess === doc.name ? "✓" : "×"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="upload-info">
            <p>Max file size: 10MB • Files are processed with AI embeddings</p>
          </div>
        </div>
      </div>
    </div>
  );
}
