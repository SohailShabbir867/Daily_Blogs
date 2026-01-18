// ChatWindow - Responsive real-time chat interface with improved role badges
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import api from '../../services/api';

const ChatWindow = ({ conversation, onClose, onBack }) => {
    const { user } = useAuth();
    const { socket, isConnected } = useChat();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [partnerTyping, setPartnerTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // Get chat partner (the other person in conversation)
    const partner = conversation.participants.find(p => p._id !== user._id) || conversation.participants[0];

    useEffect(() => {
        fetchMessages();
        markAsRead();

        if (socket && isConnected) {
            socket.emit('join_chat', conversation._id);

            socket.on('receive_message', (message) => {
                if (message.conversationId === conversation._id) {
                    setMessages(prev => {
                        if (prev.some(m => m._id === message._id)) {
                            return prev;
                        }
                        return [...prev, message];
                    });
                    scrollToBottom();
                    markAsRead();
                }
            });

            socket.on('user_typing', ({ conversationId, userId }) => {
                if (conversationId === conversation._id && userId !== user._id) {
                    setPartnerTyping(true);
                    scrollToBottom();
                }
            });

            socket.on('user_stop_typing', ({ conversationId, userId }) => {
                if (conversationId === conversation._id && userId !== user._id) {
                    setPartnerTyping(false);
                }
            });

            return () => {
                socket.emit('leave_chat', conversation._id);
                socket.off('receive_message');
                socket.off('user_typing');
                socket.off('user_stop_typing');
            };
        }
    }, [conversation._id, socket, isConnected]);

    const fetchMessages = async () => {
        try {
            setIsLoading(true);
            const response = await api.get(`/chat/messages/${conversation._id}`);
            if (response.success) {
                setMessages(response.data);
                setTimeout(scrollToBottom, 100);
            }
        } catch (error) {
            console.error('[CHAT] Error fetching messages:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const markAsRead = async () => {
        try {
            await api.patch(`/chat/read/${conversation._id}`);
        } catch (error) {
            console.error('[CHAT] Error marking as read:', error);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();

        const messageText = newMessage.trim();
        if (!messageText || isSending) return;

        try {
            setIsSending(true);

            const response = await api.post('/chat/message', {
                conversationId: conversation._id,
                content: messageText
            });

            if (response.success) {
                setMessages(prev => {
                    if (prev.some(m => m._id === response.data._id)) {
                        return prev;
                    }
                    return [...prev, response.data];
                });
                setNewMessage('');

                if (socket && isConnected) {
                    socket.emit('stop_typing', { conversationId: conversation._id, userId: user._id });
                }

                scrollToBottom();
            }
        } catch (error) {
            console.error('[CHAT] Error sending message:', error);
            alert(error.response?.data?.message || 'Failed to send message');
        } finally {
            setIsSending(false);
        }
    };

    const handleTyping = (e) => {
        setNewMessage(e.target.value);

        if (!socket || !isConnected) return;

        socket.emit('typing', { conversationId: conversation._id, userId: user._id });

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('stop_typing', { conversationId: conversation._id, userId: user._id });
        }, 2000);
    };

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="fixed bottom-16 sm:bottom-20 right-2 sm:right-4 w-[95vw] sm:w-96 h-[70vh] sm:h-[500px] max-h-[600px] bg-white rounded-xl sm:rounded-2xl shadow-2xl flex flex-col border border-gray-200 z-50 animate-in slide-in-from-bottom-5">
            {/* Header */}
            <div className="p-3 sm:p-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-t-xl sm:rounded-t-2xl flex justify-between items-center">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="p-1 hover:bg-emerald-600 rounded-lg transition-colors"
                            aria-label="Back to list"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                    )}

                    <div className="relative flex-shrink-0">
                        <img
                            src={partner?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(partner?.name || 'User')}&background=random`}
                            alt={partner?.name}
                            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-white object-cover"
                        />
                        {partner?.isActive && (
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-400 border-2 border-emerald-600 rounded-full" />
                        )}
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                            <h3 className="font-semibold text-sm sm:text-base truncate">{partner?.name || 'Chat'}</h3>

                            {/* Super Admin Badge - Premium Compact Style */}
                            {partner?.isSuperAdmin && (
                                <span className="inline-flex items-center gap-0.5 text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full font-bold shadow-sm border border-purple-400/30">
                                    <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    Super
                                </span>
                            )}

                            {/* Admin Badge - Subtle Style */}
                            {partner?.role === 'admin' && !partner?.isSuperAdmin && (
                                <span className="inline-flex items-center gap-0.5 text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 bg-white/20 backdrop-blur-sm text-white rounded-full font-medium border border-white/20">
                                    <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Admin
                                </span>
                            )}

                            {/* User Badge - For regular users */}
                            {partner?.role === 'user' && !partner?.isSuperAdmin && (
                                <span className="inline-flex items-center gap-0.5 text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 bg-blue-500/80 text-white rounded-full font-medium">
                                    <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                    User
                                </span>
                            )}
                        </div>
                        <p className="text-[10px] sm:text-xs text-emerald-100 truncate">
                            {partner?.isSuperAdmin ? '👑 Senior Support' : partner?.role === 'admin' ? '🛡️ Support Team' : '👤 Member'}
                            {!isConnected && <span className="ml-1">• Connecting...</span>}
                        </p>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="p-1 hover:bg-emerald-600 rounded-lg transition-colors flex-shrink-0"
                    aria-label="Close chat"
                >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-gradient-to-b from-gray-50 to-white space-y-3 sm:space-y-4">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm">
                        <svg className="w-16 h-16 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <p>No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    <>
                        {messages.map((msg, index) => {
                            const isMe = msg.sender._id === user._id;
                            return (
                                <div key={msg._id || index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div
                                        className={`max-w-[80%] sm:max-w-[75%] px-3 sm:px-4 py-2 rounded-2xl text-sm break-words ${isMe
                                            ? 'bg-emerald-500 text-white rounded-br-none shadow-md'
                                            : 'bg-white text-gray-800 shadow-sm rounded-bl-none border border-gray-100'
                                            }`}
                                    >
                                        <p className="whitespace-pre-wrap">{msg.content}</p>
                                        <span className={`text-[10px] block mt-1 ${isMe ? 'text-emerald-100' : 'text-gray-400'}`}>
                                            {formatTime(msg.createdAt)}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}

                        {partnerTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-none shadow-sm border border-gray-100">
                                    <div className="flex space-x-1.5 items-center">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-3 sm:p-4 bg-white border-t border-gray-100 rounded-b-xl sm:rounded-b-2xl">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={handleTyping}
                        placeholder="Type a message..."
                        disabled={isSending || !isConnected}
                        maxLength={2000}
                        className="flex-1 px-3 sm:px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-sm transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || isSending || !isConnected}
                        className="p-2 sm:p-2.5 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 shadow-md disabled:transform-none flex-shrink-0"
                        aria-label="Send message"
                    >
                        {isSending ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        )}
                    </button>
                </div>

                {newMessage.length > 1800 && (
                    <p className="text-xs text-gray-500 mt-1.5 text-right">
                        {newMessage.length}/2000
                    </p>
                )}
            </form>
        </div>
    );
};

export default ChatWindow;
