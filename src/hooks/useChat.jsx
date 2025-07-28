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
      console.log("Backend response:", responseData);
      
      const resp = responseData.messages || [responseData];
      console.log("Extracted messages:", resp);
      
      // Add avatar response to conversation history
      setMessages((prevMessages) => {
        const newMessages = [...prevMessages, ...resp];
        console.log("Updated messages array:", newMessages);
        return newMessages;
      });
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
  
  // Keep track of the current message being processed by the avatar
  const onMessagePlayed = () => {
    // Remove the current message from the queue but keep it in conversation history
    setMessage(null);
  };

  useEffect(() => {
    console.log("useChat useEffect - messages:", messages);
    
    // Only process new messages if there's no current message being played
    if (message) {
      console.log("useChat useEffect - message already being processed, skipping");
      return;
    }
    
    // Find the next avatar message that hasn't been processed for TTS
    const nextAvatarMessage = messages.find(msg => 
      !msg.ttsProcessed && msg.role !== "user"
    );
    
    console.log("useChat useEffect - nextAvatarMessage:", nextAvatarMessage);
    
    if (nextAvatarMessage) {
      console.log("useChat useEffect - setting message for TTS:", nextAvatarMessage);
      setMessage(nextAvatarMessage);
      // Mark this message as processed for TTS
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg === nextAvatarMessage ? { ...msg, ttsProcessed: true } : msg
        )
      );
    } else {
      console.log("useChat useEffect - no message to process, setting to null");
      setMessage(null);
    }
  }, [messages, message]);

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
