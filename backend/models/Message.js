const mongoose = require("mongoose");
const { encrypt, decrypt } = require("../utils/encryption");
const { stripHtml } = require("../utils/sanitize");

const messageSchema = new mongoose.Schema(
    {
        conversationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
            required: true,
            index: true,
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        content: {
            type: String,
            required: [true, "Message content is required"],
            trim: true,
            maxlength: [10000, "Encrypted message too long"], // Increased for encrypted content
        },
        isEncrypted: {
            type: Boolean,
            default: true,
        },
        readBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Index for fetching messages of a conversation (optimized)
messageSchema.index({ conversationId: 1, createdAt: 1 });

// 🔥 AUTO-DELETE: Messages older than 5 days (TTL index)
messageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 5 * 24 * 60 * 60 });

// 🔐 ENCRYPT: Encrypt content before saving
messageSchema.pre('save', function (next) {
    if (this.content && this.isModified('content')) {
        // First sanitize - strip all HTML tags and dangerous content
        let sanitized = stripHtml(this.content);

        // Additional security: remove control characters
        sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

        // Trim excessive whitespace
        sanitized = sanitized.trim().replace(/\s+/g, ' ');

        // Validate content length (before encryption)
        if (sanitized.length > 2000) {
            const error = new Error('Message content exceeds maximum length of 2000 characters');
            return next(error);
        }

        // Then encrypt
        this.content = encrypt(sanitized);
        this.isEncrypted = true;
    }
    next();
});

// 🔐 DECRYPT: Virtual to get decrypted content
messageSchema.virtual('decryptedContent').get(function () {
    if (this.isEncrypted && this.content) {
        return decrypt(this.content);
    }
    return this.content;
});

// Method to get decrypted message object
messageSchema.methods.toDecrypted = function () {
    const obj = this.toObject();
    if (obj.isEncrypted && obj.content) {
        obj.content = decrypt(obj.content);
    }
    return obj;
};

// Static method to decrypt an array of messages
messageSchema.statics.decryptMessages = function (messages) {
    return messages.map(msg => {
        // Convert to plain object if needed
        const msgObj = msg.toObject ? msg.toObject() : msg;

        if (msgObj.isEncrypted && msgObj.content) {
            // Decrypt content while preserving all other fields (including populated sender)
            return {
                ...msgObj,
                content: decrypt(msgObj.content),
            };
        }
        return msgObj;
    });
};

module.exports = mongoose.model("Message", messageSchema);
