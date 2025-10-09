import type { Document, UploadDocumentResponse, DocumentListResponse } from "~/types/document";

const API_BASE_URL = 'http://localhost:8080/api';

/*
export async function fetchDocuments(): Promise<Document[]> {
    try {
        const textContent = await fetchTextFromDb();

        const document: Document = {
            id: 
        }
    }
}
    */
    

export async function uploadDocument(formData: FormData): Promise<UploadDocumentResponse> {
    const response = await fetch(`${API_BASE_URL}/upload`, {
        method: `POST`,
        body: formData,
    });
    if (!response.ok) {
        throw new Error(`Upload failed`);
    }

    try {
        return await response.json();
    } catch (error) {
        const text = await response.text();
        return {
            success: true,
            message: text,
            document: {} as Document
        };
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
    