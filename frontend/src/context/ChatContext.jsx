// ChatContext - Manages Socket.IO connection and real-time chat state
import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within ChatProvider");
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [conversations, setConversations] = useState([]);

  // Socket URL - remove /api suffix for socket connection
  const SOCKET_URL =
    import.meta.env.VITE_API_URL?.replace("/api", "") ||
    "http://localhost:5000";

  useEffect(() => {
    let newSocket;

    // Only connect if user is logged in
    if (user?._id) {
      newSocket = io(SOCKET_URL, {
        withCredentials: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        transports: ["websocket", "polling"],
      });

      // Connection events
      newSocket.on("connect", () => {
        console.log("[CHAT] Socket connected");
        setIsConnected(true);
        // Join personal room for notifications
        if (user?._id) {
          newSocket.emit("join_user_room", user._id);
        }
      });

      newSocket.on("disconnect", (reason) => {
        console.log("[CHAT] Socket disconnected:", reason);
        setIsConnected(false);
      });

      newSocket.on("connect_error", (error) => {
        console.error("[CHAT] Socket connection error:", error.message);
        setIsConnected(false);
      });

      // Message notification
      newSocket.on(
        "message_notification",
        ({ conversationId, message, unreadCount }) => {
          if (!conversationId || !message) return;

          setUnreadCounts((prev) => ({
            ...prev,
            [conversationId]: unreadCount,
          }));

          // Browser notification
          if (Notification.permission === "granted") {
            new Notification("New message", {
              body:
                message.content.substring(0, 50) +
                (message.content.length > 50 ? "..." : ""),
              icon: "/logo.png",
            });
          }
        },
      );

      // New conversation started
      newSocket.on("new_conversation", (conversation) => {
        setConversations((prev) => [conversation, ...prev]);
      });

      setSocket(newSocket);
    }

    // Cleanup on unmount or user change
    return () => {
      if (newSocket) {
        newSocket.close();
      }
    };
  }, [user?._id, SOCKET_URL]);

  // Request notification permission on mount
  useEffect(() => {
    if (user && Notification.permission === "default") {
      Notification.requestPermission().then((permission) => {
        console.log("[CHAT] Notification permission:", permission);
      });
    }
  }, [user]);

  const value = {
    socket,
    isConnected,
    unreadCounts,
    setUnreadCounts,
    conversations,
    setConversations,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
