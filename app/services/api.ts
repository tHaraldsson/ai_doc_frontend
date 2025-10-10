import type {
  Document,
  UploadDocumentResponse,
  DocumentListResponse,
} from "~/types/document";

const API_BASE_URL = "http://localhost:8080/api";

export async function uploadDocument(
  formData: FormData
): Promise<UploadDocumentResponse> {
  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: `POST`,
    body: formData,
  });
  if (!response.ok) {
    throw new Error(`Upload failed`);
  }

  const result = await response.json();

  return {
    success: true,
    document: {
      id: result.id || String(Date.now()),
      name: result.filename,
      uploadDate: new Date().toISOString(),
    },
    message: result.message
  }
}

export async function getDocuments(): Promise<Document[]> {
  const response = await fetch(`${API_BASE_URL}/documents`);
  if (!response.ok) {
    throw new Error(`Failed to fetch documents`);
  }

const backendDocs = await response.json();

  return backendDocs.map((doc: any) => ({
    id: String(doc.id),
    name: doc.fileName,
    uploadDate: new Date().toISOString(),
  }));
}

export async function deleteDocument(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/deletedocument/${id}`, {
    method: `DELETE`,
  });
  if (!response.ok) {
    throw new Error(`Failed to delete document`)
  }
}

export async function fetchTextFromDb(): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/textindb`);
  if (!response.ok) {
    throw new Error("Failed to fetch document text");
  }
  const text = await response.text();
  return text;
}
