import React, { useState } from "react";
import { useSignOut, useAuthenticated, useUserData } from "@nhost/react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import ChatInput from "../components/ChatInput";
import { useNavigate } from "react-router-dom";

const ChatPage = () => {
    const { signOut } = useSignOut();
    const isAuthenticated = useAuthenticated();
    const user = useUserData(); 

    const [activeChatId, setActiveChatId] = useState(null);
    const [messages, setMessages] = useState([]); 
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    //  sign-out
    const handleSignOut = () => {
        signOut();
        setActiveChatId(null); 
        setMessages([]);       
        navigate('/')
    };

    if (!isAuthenticated) {
        return (
            <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-gray-200">
                    <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Authentication Required</h2>
                    <p className="text-gray-600">Please sign in to access the chat application</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="text-center p-8">
                    <div className="animate-spin w-12 h-12 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading your profile</h2>
                    <p className="text-gray-600">Please wait while we set up your account...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-screen flex bg-gray-50 overflow-hidden fixed inset-0">
            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar - hidden on mobile unless menu is open */}
            <div className={`${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
                           fixed inset-y-0 left-0 z-50 lg:relative lg:translate-x-0 
                           transition-transform duration-300 ease-in-out lg:block lg:flex-shrink-0`}>
                <Sidebar activeChatId={activeChatId} onSelectChat={(chatId) => {
                    setActiveChatId(chatId);
                    setIsMobileMenuOpen(false); // close mobile menu when chat is selected
                }} />
            </div>

            {/* Main Chat Area */}
            <div className="flex flex-col flex-1 min-w-0 w-full overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center px-4 py-3 bg-white border-b border-gray-200 shadow-sm">
                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                    >
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    {/* Header Title */}
                    <div className="flex items-center gap-3 flex-1 lg:flex-none">
                        <div className="hidden lg:block w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
                        <div>
                            <h1 className="text-lg font-semibold text-gray-800">
                                {activeChatId ? "Active Chat" : "Welcome to ChatBot"}
                            </h1>
                            <p className="text-sm text-gray-500 hidden lg:block">
                                {activeChatId ? "Continue your conversation" : "Select a chat or start a new one"}
                            </p>
                        </div>
                    </div>

                    {/* User Menu */}
                    <div className="flex items-center gap-3">
                        {/* User Avatar */}
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-md">
                                {user?.displayName?.charAt(0) || user?.email?.charAt(0) || "U"}
                            </div>
                            <div className="hidden md:block">
                                <p className="text-sm font-medium text-gray-800">
                                    {user?.displayName || user?.email?.split('@')[0]}
                                </p>
                                <p className="text-xs text-gray-500">Online</p>
                            </div>
                        </div>

                        {/* Sign Out Button */}
                        <button
                            onClick={handleSignOut}
                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 
                                     hover:bg-red-50 rounded-lg transition-all duration-200 
                                     hover:shadow-md transform hover:scale-105"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span className="hidden sm:inline">Sign Out</span>
                        </button>
                    </div>
                </div>

                {/* Chat Content */}
                {activeChatId ? (
                    <div className="flex flex-col flex-1 min-h-0">
                        <ChatWindow
                            chatId={activeChatId}
                            currentUserId={user.id}
                            messages={messages}
                        />
                        <ChatInput
                            chatId={activeChatId}
                            onNewMessage={(message) =>
                                setMessages((prev) => [...prev, message])
                            }
                        />
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
                        <div className="text-center max-w-md mx-auto px-6">
                            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-3">Start Chatting</h2>
                            <p className="text-gray-600 mb-6 leading-relaxed">
                                Select an existing conversation from the sidebar or create a new chat to begin your AI-powered conversation experience.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <button
                                    onClick={() => setIsMobileMenuOpen(true)}
                                    className="lg:hidden flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                    View Chats
                                </button>
                                <div className="hidden lg:flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-600 rounded-xl">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    <span className="text-sm">Ready to chat</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Chat Status Indicator */}
            {activeChatId && (
                <div className="fixed bottom-4 right-4 z-30">
                    <div className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-full shadow-lg text-sm font-medium">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <span>Connected</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatPage;