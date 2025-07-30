import { createContext, useContext, useEffect, useState } from "react";

const backendUrl = "https://avatar-backend-production.up.railway.app";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const chat = async (userMessage) => {
    // Add user message to conversation history
    const userMsg = { role: "user", content: userMessage };
    setMessages((prevMessages) => [...prevMessages, userMsg]);
    
    setLoading(true);
    try {
      const data = await fetch(`${backendUrl}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage }),
      });
      const responseData = await data.json();
      
      const resp = responseData.messages || [responseData];
      
      // Add avatar response to conversation history
      setMessages((prevMessages) => [...prevMessages, ...resp]);
    } catch (error) {
      console.error("Error sending message:", error);
      // Add error message to conversation
      const errorMsg = { role: "assistant", content: "Sorry, I encountered an error. Please try again." };
      setMessages((prevMessages) => [...prevMessages, errorMsg]);
    } finally {
      setLoading(false);
    }
  };
  
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState();
  const [loading, setLoading] = useState(false);
  const [cameraZoomed, setCameraZoomed] = useState(true);
  const [processedMessageIds, setProcessedMessageIds] = useState(new Set());
  
  // Initialize with a fixed greeting message
  useEffect(() => {
    async function fetchGreeting() {
      try {
        const data = await fetch(`${backendUrl}/greeting`, {
          method: "GET"
        });
        const responseData = await data.json();
        
        const resp = responseData.messages || [responseData];
        
        // Add avatar response to conversation history
        setMessages(() => [...resp]);
      } catch (error) {
        console.error("Error sending message:", error);
        // Add error message to conversation
        const errorMsg = { role: "assistant", content: "Sorry, I encountered an error. Please try again." };
        setMessages(() => [errorMsg]);
      }
    }
    fetchGreeting();
  }, []);
  
  // Keep track of the current message being processed by the avatar
  const onMessagePlayed = () => {
    // Remove the current message from the queue but keep it in conversation history
    setMessage(null);
  };

  useEffect(() => {
    // Only process new messages if there's no current message being played
    if (message) {
      return;
    }
    
    // Find the next avatar message that hasn't been processed for TTS
    const nextAvatarMessage = messages.find((msg, index) => 
      !processedMessageIds.has(index) && msg.role !== "user"
    );
    
    if (nextAvatarMessage) {
      const messageIndex = messages.findIndex(msg => msg === nextAvatarMessage);
      setMessage(nextAvatarMessage);
      // Mark this message as processed for TTS
      setProcessedMessageIds(prev => new Set([...prev, messageIndex]));
    } else {
      setMessage(null);
    }
  }, [messages, message, processedMessageIds]);

  return (
    <ChatContext.Provider
      value={{
        chat,
        message,
        messages,
        onMessagePlayed,
        loading,
        cameraZoomed,
        setCameraZoomed,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
