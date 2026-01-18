const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
    {
        participants: {
            type: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            }],
            validate: {
                validator: function (participants) {
                    // Security: Ensure exactly 2 participants (user + admin)
                    return participants.length === 2;
                },
                message: "Conversation must have exactly 2 participants"
            }
        },
        lastMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
        },
        unreadCount: {
            type: Map,
            of: Number,
            default: {},
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        lastActivityAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Index for quick retrieval of user's conversations (optimized)
conversationSchema.index({ participants: 1 });
conversationSchema.index({ updatedAt: -1 });
conversationSchema.index({ lastActivityAt: -1 });

// 🔥 AUTO-DELETE: Conversations older than 5 days (TTL index)
// MongoDB will automatically delete inactive conversations after 5 days
conversationSchema.index({ lastActivityAt: 1 }, { expireAfterSeconds: 5 * 24 * 60 * 60 }); // 5 days

// Update lastActivityAt on any update
conversationSchema.pre('save', function (next) {
    this.lastActivityAt = new Date();
    next();
});

// Helper: Check if user is participant (Security)
conversationSchema.methods.isParticipant = function (userId) {
    return this.participants.some(p => p.toString() === userId.toString());
};

// Helper: Get unread count for a user
conversationSchema.methods.getUnreadCount = function (userId) {
    return this.unreadCount.get(userId.toString()) || 0;
};

module.exports = mongoose.model("Conversation", conversationSchema);
