import React, { useRef, useEffect } from "react";
import { useChat } from "../hooks/useChat";

export const ChatBox = () => {
  const { messages, loading } = useChat();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Debug: Log messages to console
  useEffect(() => {
    console.log("ChatBox - Current messages:", messages);
  }, [messages]);

  return (
    <div className="fixed top-20 left-4 w-80 h-96 z-20 pointer-events-auto">
      <div className="bg-white bg-opacity-90 backdrop-blur-md rounded-lg shadow-lg border border-gray-200 flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-pink-500 to-purple-500 rounded-t-lg">
          <h3 className="text-white font-semibold text-lg">Conversation</h3>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <svg
                className="w-12 h-12 mx-auto mb-3 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <p className="text-sm">Start a conversation to see messages here</p>
            </div>
                     ) : (
             messages.map((msg, index) => {
               // Handle different message structures
               const role = msg.role || (msg.role === "user" ? "user" : "assistant");
               const content = msg.content || msg.message || msg.text || JSON.stringify(msg);
               
               return (
                 <div
                   key={index}
                   className={`flex ${role === "user" ? "justify-end" : "justify-start"}`}
                 >
                   <div
                     className={`max-w-xs px-3 py-2 rounded-lg ${
                       role === "user"
                         ? "bg-pink-500 text-white rounded-br-none"
                         : "bg-gray-100 text-gray-800 rounded-bl-none"
                     }`}
                   >
                     <p className="text-sm break-words">{content}</p>
                     <p className="text-xs opacity-70 mt-1">
                       {role === "user" ? "You" : "Avatar"}
                     </p>
                   </div>
                 </div>
               );
             })
           )}
          
          {/* Loading indicator */}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-800 rounded-lg rounded-bl-none px-3 py-2">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  </div>
                  <span className="text-xs text-gray-500">Avatar is thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{messages.length} messages</span>
            <span>{loading ? "Processing..." : "Ready"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}; 