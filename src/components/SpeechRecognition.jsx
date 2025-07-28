import { useState, useEffect, useRef } from "react";

export const SpeechRecognition = ({ inputRef, onTranscriptUpdate, disabled }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [recognition, setRecognition] = useState(null);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [isFreshStart, setIsFreshStart] = useState(true);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'zh-HK';
      
             recognitionInstance.onstart = () => {
         setIsListening(true);
         // Only clear transcript if we're starting fresh
         if (isFreshStart) {
           setTranscript("");
           setIsFreshStart(false);
         }
       };
      
             recognitionInstance.onresult = (event) => {
         let finalTranscript = '';
         let interimTranscript = '';
         
         for (let i = event.resultIndex; i < event.results.length; i++) {
           const transcript = event.results[i][0].transcript;
           if (event.results[i].isFinal) {
             finalTranscript += transcript;
           } else {
             interimTranscript += transcript;
           }
         }
         
         // Accumulate only final results, show interim results separately
         setTranscript(prevTranscript => {
           const accumulatedFinal = prevTranscript + finalTranscript;
           const currentDisplay = accumulatedFinal + interimTranscript;
           
           // Update input field in real-time
           if (inputRef.current) {
             inputRef.current.value = currentDisplay;
           }
           
           // Notify parent component
           if (onTranscriptUpdate) {
             onTranscriptUpdate(currentDisplay);
           }
           
           return accumulatedFinal;
         });
       };
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
      
             recognitionInstance.onend = () => {
         setIsListening(false);
         // Mark as fresh start for next recording session
         setIsFreshStart(true);
         // Update input field with final transcript when recognition ends
         setTranscript(prevTranscript => {
           if (prevTranscript && inputRef.current) {
             inputRef.current.value = prevTranscript;
           }
           return prevTranscript;
         });
       };
      
      setRecognition(recognitionInstance);
    } else {
      console.warn('Speech recognition not supported in this browser');
      setSpeechSupported(false);
    }
  }, [inputRef, onTranscriptUpdate]);

  const startListening = () => {
    if (recognition && !isListening) {
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition && isListening) {
      recognition.stop();
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <>
      <button
        onClick={toggleListening}
        disabled={disabled || !speechSupported}
        className={`p-4 rounded-md transition-all duration-200 ${
          isListening 
            ? "bg-red-500 hover:bg-red-600 text-white animate-pulse" 
            : speechSupported
            ? "bg-blue-500 hover:bg-blue-600 text-white"
            : "bg-gray-400 text-gray-600 cursor-not-allowed"
        } ${(disabled || !speechSupported) ? "cursor-not-allowed opacity-30" : ""}`}
        title={!speechSupported ? "Speech recognition not supported" : isListening ? "Stop listening" : "Start voice input"}
      >
        {isListening ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
            />
          </svg>
        )}
      </button>

             {/* Speech recognition status */}
       {isListening && (
         <div className="fixed top-20 right-4 flex items-center justify-center gap-2 pointer-events-none z-50">
           <div className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-md">
             <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
             <span className="text-sm font-medium">Listening... Click microphone to stop</span>
           </div>
         </div>
       )}
    </>
  );
}; 