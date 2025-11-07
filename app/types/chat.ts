export interface Message {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
}

export interface AiResponse {
    answer: string;
    model?: string;
    tokens?: number;
}

export interface AskQuestionRequest {
    question: string;
    documentId?: string;
}

export interface AskQuestionResponse {
    success: boolean;
    answer: string;
    documentId?: string;
    processingTime?: number;
    modelUsed?: string;
    error?: string;
}