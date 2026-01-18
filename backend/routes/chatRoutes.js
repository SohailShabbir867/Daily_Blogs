const express = require("express");
const router = express.Router();
const {
    getSupportAdmins,
    startConversation,
    getConversations,
    getMessages,
    sendMessage,
    toggleChatSupport,
    markAsRead,
} = require("../controllers/chatController");
const { isAuthenticated, isSuperAdmin } = require("../middleware/auth");

// All chat routes require authentication
router.use(isAuthenticated);

// User/Admin routes
router.get("/support-admins", getSupportAdmins);
router.post("/conversation", startConversation);
router.get("/conversations", getConversations);
router.get("/messages/:conversationId", getMessages);
router.post("/message", sendMessage);
router.patch("/read/:conversationId", markAsRead);

// Super Admin routes
router.patch("/admin-status/:adminId", isSuperAdmin, toggleChatSupport);

module.exports = router;
