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

//authAPI
export const authAPI = {
  //login
  login: async (username: string, password: string): Promise<any> => {
    const response = await apiRequest(`/auth/login`, {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    
    return data;
  },
  //register
  register: async (username: string, password: string): Promise<any> => {
    console.log(" Register attempt to:", `/auth/register`);
    console.log(" Register body:", { username, password: "***" });
    const response = await apiRequest(`/auth/register`, {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });

    return response.json();
  },

  //logout
  logout: async (): Promise<any> => {
    const response = await apiRequest(`/auth/logout`, {
      method: "POST",
    });

    return response.json();
  },
};

//ApiRequest
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  console.log(`API Request: ${options.method || "GET"} ${url}`);

  const headers: Record<string, string> = {};

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
    credentials: "include" as RequestCredentials,
  };
  
  try {
    const response = await fetch(url, config);
    console.log(`API Response: ${response.status} ${response.statusText}`);

    if (response.status === 401) {
      console.warn("Authentication failed, redirecting to login");
      throw new Error("Authentication failed");
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error ${response.status}:`, errorText);
      throw new Error(`Request failed: ${response.status} - ${errorText}`);
    }

    return response;
  } catch (error) {
    console.error("API Request failed:", error);
    throw error;
  }
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

  console.log("Sending question to backend:", payload);

  const response = await apiRequest("/ask", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const responseText = await response.text();
  console.log("RAW Response from backend:", responseText);

  let data;
  try {
    data = JSON.parse(responseText);
    console.log("Parsed JSON data:", data);
  } catch (e) {
    console.error("JSON Parse Error:", e);
    throw new Error("Invalid JSON response from server: " + responseText);
  }

  return data;
}

//UploadDocument
export async function uploadDocument(
  formData: FormData
): Promise<UploadDocumentResponse> {
  const headers: Record<string, string> = {};

  const response = await apiRequest(`/upload`, {
    method: `POST`,
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload failed`);
  }

  const result = await response.json();
   
   console.log("Upload API response:", result);
  
  return {
    success: true,
    document: {
      id: result.id || 'temporary-id',
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
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const response = await apiRequest(`/auth/user`, {
      method: "GET",
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};

//getCurrentUser
export const getCurrentUser = async (): Promise<{
  username: string;
} | null> => {
  try {
    const response = await apiRequest(`/auth/user`, {
      method: "GET",
    });

    if (response.ok) {
      const userData = await response.json();
      return userData;
    }
    return null;
  } catch (error) {
    return null;
  }
};
