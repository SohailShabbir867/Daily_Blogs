// ChatWidget - Floating chat button with responsive design
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import SupportAdminList from './SupportAdminList';
import ConversationList from './ConversationList';
import ChatWindow from './ChatWindow';
import api from '../../services/api';

const ChatWidget = () => {
    const { user } = useAuth();
    const { unreadCounts, isConnected } = useChat();
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState('list'); // 'list' or 'chat'
    const [activeConversation, setActiveConversation] = useState(null);
    const [error, setError] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    // Don't show for guests
    if (!user) return null;

    // Calculate total unread messages
    const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0);

    const handleStartChat = async (admin) => {
        try {
            setError(null);
            const response = await api.post('/chat/conversation', { adminId: admin._id });

            if (response.success) {
                setActiveConversation(response.data);
                setView('chat');
            } else {
                setError('Could not start conversation. Please try again.');
            }
        } catch (error) {
            console.error('[CHAT] Error starting conversation:', error);
            setError(error.response?.data?.message || 'Failed to start conversation');
        }
    };

    const handleSelectConversation = (conversation) => {
        setActiveConversation(conversation);
        setView('chat');
    };

    const handleClose = () => {
        setIsOpen(false);
        setTimeout(() => {
            setView('list');
            setActiveConversation(null);
            setError(null);
        }, 300); // Wait for animation
    };

    const handleBackToList = () => {
        setView('list');
        setActiveConversation(null);
        // Force refresh by changing key
        setRefreshKey(Date.now());
    };

    return (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end">
            {/* Error notification */}
            {error && (
                <div className="mb-2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm max-w-xs animate-in slide-in-from-bottom-5">
                    {error}
                    <button onClick={() => setError(null)} className="ml-2 font-bold">×</button>
                </div>
            )}

            {/* Support Admin List OR Conversation List */}
            {isOpen && view === 'list' && (
                // Show conversations for admins/super admins, support list for regular users
                user.isSuperAdmin || user.role === 'admin' ? (
                    <ConversationList
                        key={refreshKey}
                        onSelectConversation={handleSelectConversation}
                        onClose={handleClose}
                    />
                ) : (
                    <SupportAdminList
                        key={refreshKey}
                        onSelectAdmin={handleStartChat}
                        onClose={handleClose}
                    />
                )
            )}

            {/* Chat Window */}
            {isOpen && view === 'chat' && activeConversation && (
                <ChatWindow
                    conversation={activeConversation}
                    onClose={handleClose}
                    onBack={handleBackToList}
                />
            )}

            {/* Floating Chat Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="group relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-full shadow-lg hover:shadow-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none focus:ring-4 focus:ring-emerald-300"
                aria-label={isOpen ? 'Close chat' : 'Open chat'}
            >
                {/* Connection Status Indicator */}
                {!isConnected && user && (
                    <span className="absolute -top-1 -left-1 w-3 h-3 bg-yellow-400 border-2 border-white rounded-full animate-pulse" title="Connecting..." />
                )}

                {/* Close Icon (X) */}
                {isOpen ? (
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 transform transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <div className="relative">
                        {/* Chat Bubble Icon */}
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>

                        {/* Unread Badge */}
                        {totalUnread > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] sm:text-xs font-bold w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded-full border-2 border-emerald-600 animate-bounce">
                                {totalUnread > 9 ? '9+' : totalUnread}
                            </span>
                        )}

                        {/* Pulse Effect for New Messages */}
                        {totalUnread > 0 && (
                            <span className="absolute inset-0 rounded-full bg-red-500 opacity-75 animate-ping" />
                        )}
                    </div>
                )}

                {/* Tooltip */}
                <span className="absolute bottom-full right-0 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap pointer-events-none">
                    {isOpen ? 'Close chat' : totalUnread > 0 ? `${totalUnread} new message${totalUnread > 1 ? 's' : ''}` : 'Chat with support'}
                    <span className="absolute top-full right-4 -mt-1 border-4 border-transparent border-t-gray-900" />
                </span>
            </button>
        </div>
    );
};

export default ChatWidget;
