// ConversationList - Shows all conversations for admins/super admins
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import api from '../../services/api';

const ConversationList = ({ onSelectConversation, onClose }) => {
    const { user } = useAuth();
    const { unreadCounts, socket, isConnected } = useChat();
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchConversations();

        // Listen for new conversations via socket
        if (socket && isConnected) {
            socket.on('new_conversation', (newConversation) => {
                // Add new conversation to the list
                setConversations(prev => {
                    // Check if conversation already exists
                    const exists = prev.some(conv => conv._id === newConversation._id);
                    if (exists) {
                        return prev;
                    }
                    return [newConversation, ...prev];
                });
            });

            socket.on('message_notification', ({ conversationId }) => {
                // Refresh conversations to update last message
                fetchConversations();
            });

            return () => {
                socket.off('new_conversation');
                socket.off('message_notification');
            };
        }
    }, [socket, isConnected]);

    const fetchConversations = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/chat/conversations');

            if (response.success) {
                setConversations(response.data);
            } else {
                setError('Could not load conversations');
            }
        } catch (error) {
            console.error('[CHAT] Error fetching conversations:', error);
            setError(error.response?.data?.message || 'Failed to load conversations');
        } finally {
            setLoading(false);
        }
    };

    // Get the other participant in the conversation
    const getPartner = (conversation) => {
        return conversation.participants.find(p => p._id !== user?._id) || conversation.participants[0];
    };

    // Get role badge
    const getRoleBadge = (participant) => {
        if (participant.isSuperAdmin) {
            return (
                <span className="text-[9px] px-1.5 py-0.5 bg-purple-500 text-white rounded-full font-bold">
                    👑 SUPER
                </span>
            );
        } else if (participant.role === 'admin') {
            return (
                <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500 text-white rounded-full font-bold">
                    🛡️ ADMIN
                </span>
            );
        }
        return (
            <span className="text-[9px] px-1.5 py-0.5 bg-blue-500 text-white rounded-full font-bold">
                👤 USER
            </span>
        );
    };

    // Format time
    const formatTime = (date) => {
        if (!date) return '';
        const now = new Date();
        const messageDate = new Date(date);
        const diffMs = now - messageDate;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays}d ago`;
        return messageDate.toLocaleDateString();
    };

    return (
        <div className="fixed bottom-16 sm:bottom-20 right-2 sm:right-4 w-[95vw] sm:w-80 bg-white rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200 z-50 animate-in slide-in-from-bottom-5">
            {/* Header */}
            <div className="p-3 sm:p-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <h3 className="font-semibold text-sm sm:text-base">Messages</h3>
                </div>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-emerald-600 rounded-lg transition-colors"
                    aria-label="Close"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Conversation List */}
            <div className="max-h-[50vh] sm:max-h-96 overflow-y-auto">
                {loading ? (
                    <div className="p-8 flex flex-col items-center justify-center text-gray-500">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500 mb-3" />
                        <p className="text-sm">Loading conversations...</p>
                    </div>
                ) : error ? (
                    <div className="p-8 text-center">
                        <svg className="w-12 h-12 mx-auto text-red-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-red-600 text-sm mb-3">{error}</p>
                        <button onClick={fetchConversations} className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">
                            Try Again
                        </button>
                    </div>
                ) : conversations.length === 0 ? (
                    <div className="p-8 text-center">
                        <svg className="w-16 h-16 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <p className="text-gray-500 text-sm">No conversations yet.</p>
                        <p className="text-gray-400 text-xs mt-2">Users will appear here when they message you.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {conversations.map(conversation => {
                            const partner = getPartner(conversation);
                            const unreadCount = unreadCounts[conversation._id] || 0;

                            return (
                                <button
                                    key={conversation._id}
                                    onClick={() => onSelectConversation(conversation)}
                                    className="w-full p-3 sm:p-4 flex items-center gap-3 hover:bg-emerald-50 active:bg-emerald-100 transition-colors text-left group relative"
                                >
                                    <div className="relative flex-shrink-0">
                                        <img
                                            src={partner.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(partner.name)}&background=${partner.isSuperAdmin ? '9333ea' : partner.role === 'admin' ? '10b981' : '3b82f6'}&color=fff`}
                                            alt={partner.name}
                                            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full group-hover:ring-2 ring-emerald-500 transition-all object-cover"
                                            onError={(e) => {
                                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(partner.name)}&background=10b981&color=fff`;
                                            }}
                                        />
                                        {unreadCount > 0 && (
                                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                                                {unreadCount > 9 ? '9+' : unreadCount}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2 mb-0.5">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-medium text-gray-800 truncate group-hover:text-emerald-700 transition-colors">
                                                    {partner.name}
                                                </h4>
                                                {getRoleBadge(partner)}
                                            </div>
                                            {conversation.updatedAt && (
                                                <span className="text-[10px] text-gray-400 flex-shrink-0">
                                                    {formatTime(conversation.updatedAt)}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 truncate">
                                            {conversation.lastMessage?.content || 'No messages yet'}
                                        </p>
                                    </div>

                                    <svg className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Footer */}
            {!loading && !error && conversations.length > 0 && (
                <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
                    <p className="text-xs text-gray-500">
                        💡 Chats auto-delete after 5 days
                    </p>
                </div>
            )}
        </div>
    );
};

export default ConversationList;
