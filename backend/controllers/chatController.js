const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const User = require("../models/User");
const { asyncHandler } = require("../utils/helpers");
const { BadRequestError, NotFoundError, ForbiddenError } = require("../utils/errors");

// Helper: Get global io instance
const getIO = (req) => req.app.get("io");

// @desc    Get all support admins (including super admins)
// @route   GET /api/chat/support-admins
// @access  Registered Users
const getSupportAdmins = asyncHandler(async (req, res) => {
    // Find all admins and super admins who are active
    // Everyone can chat with all admins (no isChatSupport requirement)
    const admins = await User.find({
        $or: [
            { role: "admin", isActive: true },
            { isSuperAdmin: true, isActive: true }
        ]
    })
        .select("name email avatar bio role isSuperAdmin isActive lastLogin isChatSupport")
        .lean();

    res.status(200).json({
        success: true,
        count: admins.length,
        data: admins,
    });
});

// @desc    Start or get existing conversation with an admin
// @route   POST /api/chat/conversation
// @access  Registered Users
const startConversation = asyncHandler(async (req, res) => {
    const { adminId } = req.body;
    const userId = req.user._id;

    if (!adminId) {
        throw new BadRequestError("Admin ID is required");
    }

    // Check if target user is admin or super admin
    const admin = await User.findById(adminId);
    if (!admin || !admin.isActive) {
        throw new BadRequestError("User not found or inactive");
    }

    // Must be either admin OR super admin (removed isChatSupport requirement)
    const isValidChatTarget = admin.isSuperAdmin || admin.role === "admin";
    if (!isValidChatTarget) {
        throw new BadRequestError("This user is not available for chat");
    }

    // Check for existing conversation
    let conversation = await Conversation.findOne({
        participants: { $all: [userId, adminId] },
    });

    if (!conversation) {
        conversation = await Conversation.create({
            participants: [userId, adminId],
            unreadCount: { [userId.toString()]: 0, [adminId.toString()]: 0 }
        });
    }

    // Populate participants
    await conversation.populate("participants", "name email avatar role isSuperAdmin");

    res.status(200).json({
        success: true,
        data: conversation,
    });

    // Notify admin via socket if connected (optional, but good for UX)
    const io = getIO(req);
    if (io) {
        io.to(adminId.toString()).emit("new_conversation", conversation);
    }
});

// @desc    Get user's conversations
// @route   GET /api/chat/conversations
// @access  Registered Users/Admins
const getConversations = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const conversations = await Conversation.find({ participants: userId })
        .populate("participants", "name email avatar role isSuperAdmin")
        .populate("lastMessage")
        .sort({ updatedAt: -1 });

    // Decrypt lastMessage content for preview
    const decryptedConversations = conversations.map(conv => {
        const convObj = conv.toObject();
        if (convObj.lastMessage && convObj.lastMessage.isEncrypted && convObj.lastMessage.content) {
            const { decrypt } = require("../utils/encryption");
            try {
                convObj.lastMessage.content = decrypt(convObj.lastMessage.content);
            } catch {
                convObj.lastMessage.content = "Unable to decrypt message";
            }
        }
        return convObj;
    });

    res.status(200).json({
        success: true,
        count: decryptedConversations.length,
        data: decryptedConversations,
    });
});

// @desc    Get messages for a conversation
// @route   GET /api/chat/messages/:conversationId
// @access  Participants
const getMessages = asyncHandler(async (req, res) => {
    const { conversationId } = req.params;
    const userId = req.user._id;

    const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: userId,
    });

    if (!conversation) {
        throw new NotFoundError("Conversation not found");
    }

    const messages = await Message.find({ conversationId })
        .populate("sender", "name email avatar role isSuperAdmin")
        .sort({ createdAt: 1 });

    // Decrypt messages before sending to frontend
    const decryptedMessages = Message.decryptMessages(messages);

    res.status(200).json({
        success: true,
        count: decryptedMessages.length,
        data: decryptedMessages,
    });
});

// @desc    Send a message
// @route   POST /api/chat/message
// @access  Participants
const sendMessage = asyncHandler(async (req, res) => {
    const { conversationId, content } = req.body;
    const userId = req.user._id;

    // Validate message content
    if (!content || typeof content !== 'string') {
        throw new BadRequestError("Message content is required");
    }

    const trimmedContent = content.trim();
    if (trimmedContent.length === 0) {
        throw new BadRequestError("Message cannot be empty");
    }

    if (trimmedContent.length > 2000) {
        throw new BadRequestError("Message exceeds maximum length of 2000 characters");
    }

    const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: userId,
    });

    if (!conversation) {
        throw new NotFoundError("Conversation not found");
    }

    const message = await Message.create({
        conversationId,
        sender: userId,
        content: trimmedContent,
    });

    // Update conversation
    const otherParticipantId = conversation.participants.find(
        (p) => p.toString() !== userId.toString()
    );

    conversation.lastMessage = message._id;
    // Increment unread count for the other participant
    const currentUnread = conversation.unreadCount.get(otherParticipantId.toString()) || 0;
    conversation.unreadCount.set(otherParticipantId.toString(), currentUnread + 1);
    await conversation.save();

    // Populate sender for frontend (include role info)
    await message.populate("sender", "name email avatar role isSuperAdmin");

    // Get decrypted version for socket emission (database stores encrypted)
    const decryptedMessage = message.toDecrypted();

    const io = getIO(req);
    if (io) {
        // Emit decrypted message to room (conversation room)
        io.to(conversationId).emit("receive_message", decryptedMessage);

        // Also emit notification to the other user's personal room
        io.to(otherParticipantId.toString()).emit("message_notification", {
            conversationId,
            message: decryptedMessage,
            unreadCount: currentUnread + 1
        });
    }

    res.status(201).json({
        success: true,
        data: decryptedMessage,
    });
});

// @desc    Toggle chat support status (Super Admin only)
// @route   PATCH /api/chat/admin-status/:adminId
// @access  Super Admin
const toggleChatSupport = asyncHandler(async (req, res) => {
    const { adminId } = req.params;
    const { enabled } = req.body;

    const admin = await User.findById(adminId);
    if (!admin || admin.role !== "admin") {
        throw new NotFoundError("Admin not found");
    }

    admin.isChatSupport = enabled;
    await admin.save();

    res.status(200).json({
        success: true,
        data: {
            _id: admin._id,
            isChatSupport: admin.isChatSupport,
        }
    });
});

// @desc    Mark conversation as read
// @route   PATCH /api/chat/read/:conversationId
// @access  Participants
const markAsRead = asyncHandler(async (req, res) => {
    const { conversationId } = req.params;
    const userId = req.user._id;

    const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: userId,
    });

    if (!conversation) {
        throw new NotFoundError("Conversation not found");
    }

    // Reset unread count for this user
    conversation.unreadCount.set(userId.toString(), 0);
    await conversation.save();

    res.status(200).json({
        success: true,
        message: "Marked as read"
    });
});


module.exports = {
    getSupportAdmins,
    startConversation,
    getConversations,
    getMessages,
    sendMessage,
    toggleChatSupport,
    markAsRead
};
