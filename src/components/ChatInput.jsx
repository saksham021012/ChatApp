import React, { useState, useRef, useEffect } from "react";
import nhost from "../nhost";

const ChatInput = ({ chatId }) => {
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const textareaRef = useRef(null);
    const user = nhost.auth.getUser();

    // Auto-resize textarea
    const adjustTextareaHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = Math.min(textarea.scrollHeight, 128) + 'px';
        }
    };

    useEffect(() => {
        if (error && input.trim()) {
            setError(null);
        }
    }, [input, error]);

    const resetInput = () => {
        setInput("");
        if (textareaRef.current) {
            textareaRef.current.style.height = '48px';
            textareaRef.current.focus();
        }
    };

    const handleSend = async () => {
        const trimmedInput = input.trim();
        if (!trimmedInput || !user || !chatId || isLoading) return;

        setIsLoading(true);
        setError(null);

        //clear input
        const messageToSend = trimmedInput;
        resetInput();

        try {
            const response = await fetch("/webhook-test/sendMessage", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chatId,
                    userId: user.id,
                    content: messageToSend,
                }),
            });

            if (!response.ok) {
                throw new Error(`Failed to send message: ${response.status}`);
            }

        } catch (error) {
            console.error("Error sending message:", error);
            setError("Failed to send message. Please try again.");
            // Restore  message if send failed
            setInput(messageToSend);
            setTimeout(adjustTextareaHeight, 0);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleInputChange = (e) => {
        setInput(e.target.value);
        adjustTextareaHeight();
    };

    const canSend = input.trim() && !isLoading && user && chatId;

    return (
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-lg">
            <div className="max-w-4xl mx-auto p-4">
                {/* Error message */}
                {error && (
                    <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}
                
                <div className="flex items-end gap-3">
                    <div className="flex-1 relative">
                        <textarea
                            ref={textareaRef}
                            className="w-full resize-none rounded-2xl bg-gray-50 border border-gray-200 px-4 py-3 pr-4
                                     text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 
                                     focus:border-transparent transition-all duration-200 max-h-32 min-h-[48px]
                                     disabled:opacity-50 disabled:cursor-not-allowed"
                            placeholder={isLoading ? "Sending..." : "Type your message..."}
                            value={input}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            disabled={isLoading}
                            rows={1}
                            style={{
                                height: 'auto',
                                minHeight: '48px'
                            }}
                        />
                        
                        {/* char count when approaching limit) */}
                        {input.length > 800 && (
                            <div className="absolute -top-6 right-2 text-xs text-gray-400">
                                {input.length}/1000
                            </div>
                        )}
                    </div>
                    
                    <button
                        onClick={handleSend}
                        disabled={!canSend}
                        className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 
                                  ${canSend 
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95' 
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                        title={isLoading ? "Sending..." : "Send message"}
                    >
                        {isLoading ? (
                            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle 
                                    className="opacity-25" 
                                    cx="12" 
                                    cy="12" 
                                    r="10" 
                                    stroke="currentColor" 
                                    strokeWidth="4"
                                />
                                <path 
                                    className="opacity-75" 
                                    fill="currentColor" 
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                            </svg>
                        ) : (
                            <svg 
                                className="w-5 h-5" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" 
                                />
                            </svg>
                        )}
                    </button>
                </div>
                
                <div className="text-xs text-gray-400 text-center mt-2">
                    Press Enter to send, Shift + Enter for new line
                </div>
            </div>
        </div>
    );
};

export default ChatInput;