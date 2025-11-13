export interface Message {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
}

export interface AiResponse {
    answer: string;
    type: string;
    tokensUsed: number;
}

export interface AskQuestionRequest {
    question: string;
    documentId?: string;
}

export interface AskQuestionResponse {
    answer: string;
    model: string;
    tokens: number
}