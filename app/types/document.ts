export interface Document {
  id: string;
  name: string;
  uploadDate: string;
  size?: number;
  fileType?: string;
  content?: string;
}

export interface UploadDocumentResponse {
  success: boolean;
  document: Document;
  message?: string;
}

export interface DocumentListResponse {
  documents: Document[];
  total: number;
}