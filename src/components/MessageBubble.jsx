import React from "react";

const MessageBubble = ({ sender, text, timestamp, avatar, isTyping = false }) => {
    const isUser = sender === "user";

    if (isTyping) {
        return (
            <div className="flex justify-start mb-4">
                <div className="flex items-end space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                        <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                        </svg>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                        <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4 group`}>
            <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md xl:max-w-lg ${isUser ? "flex-row-reverse space-x-reverse" : ""}`}>
                {/* Avatar */}
                {!isUser && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-medium shadow-md">
                        {avatar || "AI"}
                    </div>
                )}
                {isUser && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-sm font-medium shadow-md">
                        {avatar || "U"}
                    </div>
                )}

                {/* Message Container */}
                <div className="relative">
                    <div
                        className={`relative px-4 py-3 rounded-2xl shadow-sm transition-all duration-200 group-hover:shadow-md ${
                            isUser
                                ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-md"
                                : "bg-white text-gray-800 border border-gray-200 rounded-bl-md hover:border-gray-300"
                        }`}
                    >
                        {/* Message Text */}
                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                            {text}
                        </p>

                        {/* Tail */}
                        <div
                            className={`absolute bottom-0 w-3 h-3 ${
                                isUser
                                    ? "right-0 transform translate-x-1 bg-blue-700"
                                    : "left-0 transform -translate-x-1 bg-white border-l border-b border-gray-200"
                            } rotate-45`}
                        ></div>
                    </div>

                    {/* Timestamp */}
                    {timestamp && (
                        <div className={`text-xs text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
                            isUser ? "text-right" : "text-left"
                        }`}>
                            {timestamp}
                        </div>
                    )}
                </div>

                {/* Message Status  */}
                {isUser && (
                    <div className="flex flex-col justify-end pb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="text-blue-600">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                            </svg>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessageBubble;