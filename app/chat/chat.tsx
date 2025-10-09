import { Link } from "react-router";
import "./chat.css";
import { useState, useEffect, useRef } from "react";
import type { Message } from "~/types/chat"

export default function Chat() {
  
  const [messages, setMessages] = useState<Message[]>([
    {
        id: "1",
        text: "Hello! I am your AI-assistant. You can ask me about your uploaded documents. What would you like to know?",
        isUser: false,
        timestamp: new Date
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [documentAvailable, setDocumentsAvailable] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth"});
  };

  useEffect(() => {
    scrollToBottom(); 
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || loading) return;

    const userMessage: Message = {
        id: Date.now().toString(),
        text: inputText,
        isUser: true,
        timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    setLoading(true);

    try {

        const response = await fetch(`http://localhost:8080/api/ask?question=${encodeURIComponent(inputText)}`);
        const answer = await response.text();

        const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: answer,
            isUser: false,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
        console.error("Error sending message:", error);
        const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: "Error when handling question. Try again later.",
            isUser: false,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
    } finally {
        setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === `Enter`) {
        e.preventDefault();
        handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{
        id: "1",
        text: "Hello! I am your AI-assistant. You can ask me about your uploaded documents. What would you like to know?",
        isUser: false,
        timestamp: new Date()
    }]);

  };
  
    return (
    <div className="chat-container">
      <div className="chat-content">
        <div className="chat-header">
          <Link to="/" className="chat-back-link">
            Back to Homepage
          </Link>
          <h1>AI Dokument Assistant</h1>
          <button onClick={clearChat} className="clear-chat-btn">
            Clear chat
          </button>
        </div>
        
        <div className="chat-card">
          

          {/* chatt meddelanden */}
          <div className="chat-messages">
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.isUser ? 'user-message' : 'ai-message'}`}>
                <div className="message-avatar">
                  {message.isUser ? <img className="user-avatar" src="/public/pictures/user.png" alt="user" /> : <img className="robot-avatar" src="/public/pictures/robot.png" alt="ai assistant" />}
                </div>
                <div className="message-content">
                  <div className="message-text">
                    {message.text}
                  </div>
                  <div className="message-time">
                    {message.timestamp.toLocaleTimeString('sv-SE', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="message ai-message">
                <div className="message-avatar">
                  <img className="robot-avatar" src="/pictures/robot.png" alt="ai assistant" />
                </div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span>AI typing</span>
                    <div className="typing-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* inkommande text */}
          <div className="chat-input-container">
            <div className="input-wrapper">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask a question about the documents..."
                className="chat-input"
                rows={2}
                disabled={loading}
              />
              <button 
                onClick={handleSendMessage} 
                disabled={!inputText.trim() || loading}
                className="send-button"
              >
                <span className="send-icon">↑</span>
              </button>
            </div>
            <div className="input-hint">
              Press Enter to send
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
