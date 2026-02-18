// Encryption utility for chat messages - AES-256-GCM encryption
const crypto = require("crypto");

// Encryption key - should be stored in environment variables
if (!process.env.CHAT_ENCRYPTION_KEY && process.env.NODE_ENV === "production") {
    console.error("⚠️ WARNING: CHAT_ENCRYPTION_KEY not set in production. Using random key - messages will not persist across restarts!");
}
const ENCRYPTION_KEY = process.env.CHAT_ENCRYPTION_KEY || crypto.randomBytes(32).toString("hex").slice(0, 32);
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16; // GCM mode needs 12-16 bytes IV
const AUTH_TAG_LENGTH = 16;

/**
 * Encrypt a message
 * @param {string} text - Plain text to encrypt
 * @returns {string} - Encrypted string (iv:authTag:ciphertext)
 */
const encrypt = (text) => {
    if (!text) return text;

    try {
        // Generate random IV for each encryption
        const iv = crypto.randomBytes(IV_LENGTH);

        // Create cipher with AES-256-GCM
        const cipher = crypto.createCipheriv(
            ALGORITHM,
            Buffer.from(ENCRYPTION_KEY.padEnd(32, "0").slice(0, 32)),
            iv
        );

        // Encrypt the text
        let encrypted = cipher.update(text, "utf8", "hex");
        encrypted += cipher.final("hex");

        // Get the auth tag for GCM
        const authTag = cipher.getAuthTag();

        // Return iv:authTag:ciphertext format
        return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
    } catch (error) {
        console.error("[ENCRYPTION] Encryption failed:", error.message);
        return text; // Return original text if encryption fails
    }
};

/**
 * Decrypt a message
 * @param {string} encryptedText - Encrypted string (iv:authTag:ciphertext)
 * @returns {string} - Decrypted plain text
 */
const decrypt = (encryptedText) => {
    if (!encryptedText) return encryptedText;

    // Check if this is an encrypted message (has the iv:authTag:ciphertext format)
    if (!encryptedText.includes(":")) {
        return encryptedText; // Not encrypted, return as-is
    }

    try {
        const parts = encryptedText.split(":");

        // Must have exactly 3 parts: iv, authTag, ciphertext
        if (parts.length !== 3) {
            return encryptedText; // Not properly encrypted
        }

        const iv = Buffer.from(parts[0], "hex");
        const authTag = Buffer.from(parts[1], "hex");
        const encrypted = parts[2];

        // Create decipher
        const decipher = crypto.createDecipheriv(
            ALGORITHM,
            Buffer.from(ENCRYPTION_KEY.padEnd(32, "0").slice(0, 32)),
            iv
        );

        // Set auth tag for GCM
        decipher.setAuthTag(authTag);

        // Decrypt
        let decrypted = decipher.update(encrypted, "hex", "utf8");
        decrypted += decipher.final("utf8");

        return decrypted;
    } catch (error) {
        // If decryption fails, return original (might not be encrypted)
        return encryptedText;
    }
};

/**
 * Check if a string appears to be encrypted
 * @param {string} text - Text to check
 * @returns {boolean} - True if encrypted
 */
const isEncrypted = (text) => {
    if (!text || typeof text !== "string") return false;
    const parts = text.split(":");
    return parts.length === 3 && parts[0].length === 32; // IV is 16 bytes = 32 hex chars
};

module.exports = {
    encrypt,
    decrypt,
    isEncrypted,
};
