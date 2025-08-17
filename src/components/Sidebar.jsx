import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import { useUserData } from "@nhost/react";
import nhost from "../nhost";

// GraphQL Queries and Mutations
const GET_CHATS = gql`
  query GetChats($userId: uuid!) {
    chats(where: { user_id: { _eq: $userId } }, order_by: { created_at: desc }) {
      id
      title
      user_id
    }
  }
`;

const CREATE_CHAT = gql`
  mutation CreateChat($title: String!, $userId: uuid!) {
    insert_chats_one(object: { title: $title, user_id: $userId }) {
      id
      title
    }
  }
`;

const RENAME_CHAT = gql`
  mutation RenameChat($id: uuid!, $title: String!) {
    update_chats_by_pk(pk_columns: { id: $id }, _set: { title: $title }) {
      id
      title
    }
  }
`;

// Constants
const MAX_TITLE_LENGTH = 25;

export default function Sidebar({ onSelectChat, activeChatId }) {
  const userData = useUserData();
  const userId = userData?.id;

  // State
  const [newTitle, setNewTitle] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredChatId, setHoveredChatId] = useState(null);
  const [renamingChatId, setRenamingChatId] = useState(null);
  const [renameTitle, setRenameTitle] = useState("");

  // Refs
  const chatsEndRef = useRef(null);
  const renameInputRef = useRef(null);

  // GraphQL hooks
  const { data, loading, error } = useQuery(GET_CHATS, {
    variables: { userId },
    skip: !userId,
    fetchPolicy: 'cache-and-network', // Always fetch fresh data
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: true,
  });

  const [createChat, { loading: creating }] = useMutation(CREATE_CHAT, {
    refetchQueries: [{ query: GET_CHATS, variables: { userId } }],
  });

  const [renameChat] = useMutation(RENAME_CHAT, {
    refetchQueries: [{ query: GET_CHATS, variables: { userId } }],
  });

  // Effects
  useEffect(() => {
    if (data?.chats) {
      chatsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [data?.chats]);

  useEffect(() => {
    if (renamingChatId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingChatId]);

  // Utility functions
  const truncateTitle = (title) =>
    title.length > MAX_TITLE_LENGTH ? `${title.substring(0, MAX_TITLE_LENGTH)}...` : title;

  const canEditChat = (chat) => chat.user_id === userId;

  // Event handlers
  const handleCreateChat = async () => {
    const title = newTitle.trim();
    if (!title || !userId) return;

    try {
      const { data: result } = await createChat({
        variables: { title, userId },
      });
      
      setNewTitle("");
      if (result?.insert_chats_one) {
        onSelectChat(result.insert_chats_one.id);
      }
    } catch (err) {
      console.error("Error creating chat:", err);
    }
  };

  const startRename = (chat) => {
    if (!canEditChat(chat)) return;
    
    setRenamingChatId(chat.id);
    setRenameTitle(chat.title);
  };

  const cancelRename = () => {
    setRenamingChatId(null);
    setRenameTitle("");
  };

  const handleRenameSubmit = async () => {
    const newName = renameTitle.trim();
    const currentChat = data?.chats?.find(c => c.id === renamingChatId);
    
    if (!newName || !userId || !renamingChatId || newName === currentChat?.title) {
      cancelRename();
      return;
    }

    try {
      await renameChat({ 
        variables: { id: renamingChatId, title: newName } 
      });
      cancelRename();
    } catch (err) {
      console.error("Error renaming chat:", err);
      cancelRename();
    }
  };

  const handleKeyDown = (e, action) => {
    e.stopPropagation();
    if (e.key === "Enter") {
      e.preventDefault();
      action();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancelRename();
    }
  };

  // Render helpers
  const renderLoadingState = () => (
    <div className="w-80 bg-white border-r border-gray-200 h-full flex flex-col shadow-sm flex-shrink-0">
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    </div>
  );

  const renderEmptyState = () => (
    <div className="p-6 text-center">
      <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </div>
      <h3 className="text-gray-800 font-medium mb-2">No chats yet</h3>
      <p className="text-gray-500 text-sm">Create your first chat to get started</p>
    </div>
  );

  const renderChatItem = (chat) => {
    const isActive = activeChatId === chat.id;
    const isHovered = hoveredChatId === chat.id;
    const isRenaming = renamingChatId === chat.id;
    const showEditButton = (isHovered || isActive) && !isRenaming && canEditChat(chat);

    return (
      <div
        key={chat.id}
        className={`group relative p-3 rounded-xl transition-all duration-200 ${
          isActive
            ? "bg-blue-100 border border-blue-200 shadow-sm"
            : "hover:bg-gray-50 hover:shadow-sm cursor-pointer"
        }`}
        onMouseEnter={() => setHoveredChatId(chat.id)}
        onMouseLeave={() => setHoveredChatId(null)}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full transition-colors duration-200 ${
              isActive ? "bg-blue-500" : "bg-gray-300 group-hover:bg-gray-400"
            }`}
            onClick={() => !isRenaming && onSelectChat(chat.id)}
          />

          <div className="flex-1 min-w-0">
            {isRenaming ? (
              <input
                ref={renameInputRef}
                type="text"
                value={renameTitle}
                onChange={(e) => setRenameTitle(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, handleRenameSubmit)}
                onBlur={() => setTimeout(handleRenameSubmit, 100)}
                onClick={(e) => e.stopPropagation()}
                className="w-full text-sm font-medium bg-white border border-blue-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <div onClick={() => onSelectChat(chat.id)}>
                <h3
                  className={`text-sm font-medium truncate transition-colors duration-200 ${
                    isActive ? "text-blue-900" : "text-gray-800 group-hover:text-gray-900"
                  }`}
                >
                  {truncateTitle(chat.title)}
                </h3>
                <p className="text-xs text-gray-500 truncate">Your private conversation</p>
              </div>
            )}
          </div>

          {showEditButton && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  startRename(chat);
                }}
                className="p-1.5 rounded-md hover:bg-blue-100 text-gray-500 hover:text-blue-600 transition-colors"
                title="Rename chat"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Early return for loading state or no user
  if (!userData || !userId) {
    return renderLoadingState();
  }

  // Don't render chats if we don't have user data or there's an error
  const shouldShowChats = userData && userId && !loading;

  return (
    <div
      className={`${
        isCollapsed ? "w-16" : "w-80"
      } bg-white border-r border-gray-200 h-full flex flex-col transition-all duration-300 shadow-sm flex-shrink-0`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
        {!isCollapsed && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800">My Chats</h2>
            <p className="text-xs text-gray-500">Your personal conversations</p>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg bg-gray-200 hover:bg-white/50 transition-colors duration-200"
        >
          <svg
            className={`w-5 h-5 text-gray-600 transition-transform duration-300 ${
              isCollapsed ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {!isCollapsed && (
        <>
          {/* New Chat Input */}
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="New chat title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateChat()}
                className="flex-1 p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
              />
              <button
                onClick={handleCreateChat}
                disabled={!newTitle.trim() || creating || !userId}
                className={`p-3 rounded-xl transition-all duration-200 flex items-center justify-center ${
                  newTitle.trim() && !creating && userId
                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transform hover:scale-105"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                {creating ? (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Chats List */}
          <div className="flex-1 overflow-y-auto">
            {!shouldShowChats || loading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-12 bg-gray-200 rounded-xl" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="p-4 text-center text-red-600">
                <p className="text-sm font-medium">Error loading your chats</p>
                <p className="text-xs mt-1">{error.message}</p>
              </div>
            ) : !data?.chats?.length ? (
              renderEmptyState()
            ) : (
              <div className="p-2 space-y-1">
                {data.chats
                  .filter(chat => chat.user_id === userId) // Extra safety filter
                  .map(renderChatItem)}
              </div>
            )}
            <div ref={chatsEndRef} />
          </div>
        </>
      )}
    </div>
  );
}