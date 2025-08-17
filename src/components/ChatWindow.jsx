import { gql, useSubscription } from "@apollo/client";
import { useUserData } from "@nhost/react";
import { useEffect, useRef, useState } from "react";
import MessageBubble from "./MessageBubble";

const GET_MESSAGES = gql`
  subscription Messages($chatId: uuid!) {
    messages(where: { chat_id: { _eq: $chatId } }, order_by: { created_at: asc }) {
      id
      content
      user_id
      created_at
    }
  }
`;

const BOT_ID = import.meta.env.VITE_BOT_ID;

// Typing indicator component
const TypingIndicator = ({ avatar }) => {
  return (
    <div className="flex items-start gap-3 mb-4">
      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
        {avatar}
      </div>
      <div className="bg-gray-100 rounded-2xl px-4 py-3 max-w-xs">
        <div className="flex items-center gap-1">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          <span className="text-xs text-gray-500 ml-2">AI is typing...</span>
        </div>
      </div>
    </div>
  );
};

export default function ChatWindow({ chatId }) {
  const userData = useUserData();
  const [isTyping, setIsTyping] = useState(false);
  const { data, loading, error } = useSubscription(GET_MESSAGES, {
    variables: { chatId },
  });
  const messagesEndRef = useRef(null);
  // const lastMessageRef = useRef(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data?.messages, isTyping]);

  // Logic to detect when bot should be typing
  useEffect(() => {
    if (!data?.messages || !userData?.id) return;

    const messages = data.messages;
    if (messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];
    const isLastMessageFromUser = lastMessage.user_id === userData.id;
    const isLastMessageFromBot = lastMessage.user_id === BOT_ID;

    // Show typing if last message was from user (bot should respond)
    if (isLastMessageFromUser) {
      setIsTyping(true);
    } 
    // Hide typing if last message was from bot (bot has responded)
    else if (isLastMessageFromBot) {
      setIsTyping(false);
    }
  }, [data?.messages, userData?.id]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full"></div>
          <p className="text-gray-600 font-medium">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center p-6 bg-red-50 rounded-xl border border-red-200">
          <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-red-800 font-medium">Error loading messages</p>
          <p className="text-red-600 text-sm mt-1">{error.message}</p>
        </div>
      </div>
    );
  }

  const messages = data?.messages || [];

  const getSender = (userId) => {
    if (userId === userData?.id) return "user";
    if (userId === BOT_ID) return "bot";
    return "other";
  };

  const getAvatar = (userId) => {
    if (userId === userData?.id) return "U";
    if (userId === BOT_ID) return "AI";
    return userId.slice(0, 2).toUpperCase();
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto p-4">
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Start a conversation</h3>
              <p className="text-gray-500">Send a message to begin chatting</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                sender={getSender(msg.user_id)}
                text={msg.content}
                timestamp={new Date(msg.created_at).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
                avatar={getAvatar(msg.user_id)}
              />
            ))}
            {isTyping && <TypingIndicator avatar="AI" />}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}