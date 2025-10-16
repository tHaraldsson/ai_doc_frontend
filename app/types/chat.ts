export interface Message {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
}

export interface AiResponse {
    answer: string;
    model: string;
    tokens: number;
}