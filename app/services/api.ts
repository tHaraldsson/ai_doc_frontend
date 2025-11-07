import type { Document, UploadDocumentResponse } from "~/types/document";
import type {
  AskQuestionRequest,
  AskQuestionResponse,
  AiResponse,
} from "~/types/chat";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api";
console.log(
  "API_BASE_URL:",
  import.meta.env.VITE_API_URL,
  "Full URL:",
  API_BASE_URL
);

export const getToken = (): string | null => {
  return localStorage.getItem("jwtToken");
};

export const setToken = (token: string): void => {
  localStorage.setItem("jwtToken", token);
};

export const removeToken = (): void => {
  localStorage.removeItem("jwtToken");
};

//authAPI
export const authAPI = {
  login: async (username: string, password: string): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Login failed: ${errorText}`);
    }

    const data = await response.json();
    if (data.token) {
      setToken(data.token);
    }
    return data;
  },

  register: async (username: string, password: string): Promise<any> => {
    console.log(" Register attempt to:", `${API_BASE_URL}/auth/register`);
    console.log(" Register body:", { username, password: "***" });
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Registration failed: ${errorText}`);
    }

    return response.json();
  },
};

//ApiRequest
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getToken();

  const headers: Record<string, string> = {};

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const finalHeaders = {
    ...headers,
    ...((options.headers as Record<string, string>) || {}),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: finalHeaders,
  });

  if (response.status === 401) {
    removeToken();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Authentication failed");
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `HTTP error! status: ${response.status}, message: ${errorText}`
    );
  }

  return response;
};

//AskQuestion
export async function askQuestion(
  question: string,
  documentId?: string
): Promise<AskQuestionResponse> {
  const payload: AskQuestionRequest = { question };
  if (documentId) {
    payload.documentId = documentId;
  }

  const response = await apiRequest("/ask", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const data: AskQuestionResponse = await response.json();
  return data;
}

//UploadDocument
export async function uploadDocument(
  formData: FormData
): Promise<UploadDocumentResponse> {
  const token = getToken();

  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: `POST`,
    headers: headers,
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
    message: result.message,
  };
}

//getDocuments
export async function getDocuments(): Promise<Document[]> {
  const response = await apiRequest("/documents", {
    method: "GET",
  });

  const backendDocs = await response.json();

  return backendDocs.map((doc: any) => ({
    id: String(doc.id),
    name: doc.fileName,
    uploadDate: new Date().toISOString(),
  }));
}

//deleteDocument
export async function deleteDocument(id: string): Promise<void> {
  await apiRequest(`/deletedocument/${id}`, {
    method: "DELETE",
  });
}

export async function fetchTextFromDb(): Promise<string> {
  const response = await apiRequest("/textindb", {
    method: "GET",
  });

  const text = await response.text();
  return text;
}

//isAuthenticated
export const isAuthenticated = (): boolean => {
  const token = getToken();
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp > currentTime;
  } catch (error) {
    return false;
  }
};

//getCurrentUser
export const getCurrentUser = (): { username: string } | null => {
  const token = getToken();
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return { username: payload.sub };
  } catch (error) {
    return null;
  }
};
