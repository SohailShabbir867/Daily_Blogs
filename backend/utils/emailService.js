// Email Service - Nodemailer configuration for sending emails

const nodemailer = require("nodemailer");

// Create transporter based on environment
const createTransporter = () => {
  // Check if SMTP credentials are available
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("⚠️ SMTP credentials not configured. Email functionality will be disabled.");
    return null;
  }

  try {
    // For production, use real SMTP settings
    if (process.env.NODE_ENV === "production") {
      return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }

    // For development, use Gmail
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } catch (error) {
    console.error("❌ Failed to create email transporter:", error.message);
    return null;
  }
};

const transporter = createTransporter();

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email for password reset
const sendPasswordResetOTP = async (email, otp, userName) => {
  const mailOptions = {
    from: `"Daily Blogs" <${process.env.SMTP_USER || "noreply@dailyblogs.com"
      }>`,
    to: email,
    subject: "Password Reset OTP - Daily Blogs",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp-box { background: #fff; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 10px; }
          .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
          .warning { color: #e74c3c; font-size: 14px; margin-top: 20px; }
          .footer { text-align: center; color: #888; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${userName || "User"}</strong>,</p>
            <p>We received a request to reset your password. Use the OTP below to proceed:</p>
            
            <div class="otp-box">
              <p style="margin: 0; color: #666;">Your OTP Code</p>
              <p class="otp-code">${otp}</p>
              <p style="margin: 0; color: #888; font-size: 14px;">Valid for 10 minutes</p>
            </div>
            
            <p>Enter this code on the password reset page to create a new password.</p>
            
            <p class="warning">⚠️ If you didn't request this password reset, please ignore this email or contact support if you're concerned about your account security.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Daily Blogs. All rights reserved.</p>
            <p>This is an automated message, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Hello ${userName || "User"
      },\n\nYour password reset OTP is: ${otp}\n\nThis code is valid for 10 minutes.\n\nIf you didn't request this, please ignore this email.\n\n- Daily Blogs Team`,
  };

  if (!transporter) {
    console.warn(`[EMAIL] Transporter not configured. Skipping OTP email to ${email}`);
    return { success: false, message: "Email service not configured" };
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] Password reset OTP sent to: ${email}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[EMAIL] Failed to send OTP to ${email}:`, error.message);
    throw new Error("Failed to send email. Please try again later.");
  }
};

// Send welcome email
const sendWelcomeEmail = async (email, userName) => {
  const mailOptions = {
    from: `"Daily Blogs" <${process.env.SMTP_USER || "noreply@dailyblogs.com"
      }>`,
    to: email,
    subject: "Welcome to Daily Blogs! 🎉",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; color: #888; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Daily Blogs! 🎉</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${userName}</strong>,</p>
            <p>Thank you for joining Daily Blogs! We're excited to have you as part of our community.</p>
            <p>With your new account, you can:</p>
            <ul>
              <li>📖 Read amazing blog posts</li>
              <li>💾 Save your favorite articles</li>
              <li>💬 Engage with the community</li>
            </ul>
            <p>Start exploring now!</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Daily Blogs. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  if (!transporter) {
    console.warn(`[EMAIL] Transporter not configured. Skipping welcome email to ${email}`);
    return;
  }

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] Welcome email sent to: ${email}`);
  } catch (error) {
    console.error(
      `[EMAIL] Failed to send welcome email to ${email}:`,
      error.message
    );
  }
};

// Send contact confirmation email
const sendContactConfirmation = async (email, name, subject) => {
  const mailOptions = {
    from: `"Daily Blogs Support" <${process.env.SMTP_USER || "support@dailyblogs.com"
      }>`,
    to: email,
    subject: "We received your message - Daily Blogs",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .footer { text-align: center; color: #888; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📬 Message Received</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${name}</strong>,</p>
            <p>Thank you for contacting Daily Blogs support!</p>
            <p>We've received your message regarding: <strong>"${subject}"</strong></p>
            <p>Our team will review your inquiry and get back to you within 24-48 hours.</p>
            <p>Thank you for your patience!</p>
            <p>Best regards,<br>Daily Blogs Support Team</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Daily Blogs. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  if (!transporter) {
    console.warn(`[EMAIL] Transporter not configured. Skipping contact confirmation to ${email}`);
    return;
  }

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] Contact confirmation sent to: ${email}`);
  } catch (error) {
    console.error(
      `[EMAIL] Failed to send contact confirmation to ${email}:`,
      error.message
    );
  }
};

/**
 * Send new blog notification to a subscriber
 * @param {string} subscriberEmail - Subscriber's email
 * @param {string} subscriberName - Subscriber's name (optional)
 * @param {Object} blog - Blog post details
 * @param {string} authorName - Author's name
 * @param {string} unsubscribeToken - Token for unsubscribe link
 */
const sendNewBlogNotification = async (
  subscriberEmail,
  subscriberName,
  blog,
  authorName,
  unsubscribeToken
) => {
  const clientUrl = (process.env.CORS_ORIGIN || process.env.CLIENT_URL || "http://localhost:5173")
    .split(",")[0].trim();
  const backendUrl = process.env.BACKEND_URL || "http://localhost:5000";

  const mailOptions = {
    from: `"Daily Blogs" <${process.env.SMTP_USER || "noreply@dailyblogs.com"
      }>`,
    to: subscriberEmail,
    subject: `📝 New Blog: ${blog.title} - Daily Blogs`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f3f4f6; }
          .container { max-width: 600px; margin: 0 auto; background: white; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { padding: 30px; }
          .blog-card { background: #f9fafb; border-radius: 12px; overflow: hidden; margin: 20px 0; }
          .blog-image { width: 100%; height: 200px; object-fit: cover; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
          .blog-info { padding: 20px; }
          .blog-title { font-size: 20px; font-weight: bold; color: #1f2937; margin: 0 0 10px 0; }
          .blog-meta { color: #6b7280; font-size: 14px; margin-bottom: 10px; }
          .blog-description { color: #4b5563; margin-bottom: 15px; }
          .read-btn { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; }
          .footer { text-align: center; padding: 20px; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb; }
          .unsubscribe { color: #9ca3af; text-decoration: underline; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📝 New Blog Post!</h1>
          </div>
          <div class="content">
            <p>Hello${subscriberName ? ` <strong>${subscriberName}</strong>` : ""
      }!</p>
            <p>Great news! <strong>${authorName}</strong> just published a new article on Daily Blogs that we think you'll love.</p>
            
            <div class="blog-card">
              ${blog.image
        ? `<img src="${blog.image}" alt="${blog.title}" class="blog-image" />`
        : '<div class="blog-image"></div>'
      }
              <div class="blog-info">
                <h2 class="blog-title">${blog.title}</h2>
                <p class="blog-meta">
                  By ${authorName} • ${blog.category || "Article"} • ${blog.readTime || 5
      } min read
                </p>
                <p class="blog-description">${blog.description || ""}</p>
                <a href="${clientUrl}/blog/${blog._id || blog.id
      }" class="read-btn">Read Full Article →</a>
              </div>
            </div>
            
            <p>Happy reading! 📚</p>
            <p>— The Daily Blogs Team</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Daily Blogs. All rights reserved.</p>
            <p>
              <a href="${backendUrl}/api/subscribe/unsubscribe/${unsubscribeToken}" class="unsubscribe">
                Unsubscribe from notifications
              </a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Hello${subscriberName ? ` ${subscriberName}` : ""
      }!\n\n${authorName} just published a new article: "${blog.title
      }"\n\nRead it here: ${clientUrl}/blog/${blog._id || blog.id
      }\n\n— The Daily Blogs Team\n\nUnsubscribe: ${backendUrl}/api/subscribe/unsubscribe/${unsubscribeToken}`,
  };

  if (!transporter) {
    console.warn(`[EMAIL] Transporter not configured. Skipping blog notification to ${subscriberEmail}`);
    return { success: false, error: "Email service not configured" };
  }

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] Blog notification sent to: ${subscriberEmail}`);
    return { success: true };
  } catch (error) {
    console.error(
      `[EMAIL] Failed to send notification to ${subscriberEmail}:`,
      error.message
    );
    return { success: false, error: error.message };
  }
};

/**
 * Send blog notifications to all active subscribers
 * @param {Object} blog - Blog post details
 * @param {string} authorName - Author's name
 */
const notifyAllSubscribers = async (blog, authorName) => {
  const Subscriber = require("../models/Subscriber");

  try {
    const subscribers = await Subscriber.find({ isActive: true }).lean();

    if (subscribers.length === 0) {
      console.log("[EMAIL] No active subscribers to notify");
      return { sent: 0, failed: 0 };
    }

    console.log(
      `[EMAIL] Sending blog notification to ${subscribers.length} subscribers...`
    );

    let sent = 0;
    let failed = 0;

    // Send emails in batches to avoid overwhelming the SMTP server
    for (const subscriber of subscribers) {
      const result = await sendNewBlogNotification(
        subscriber.email,
        subscriber.name,
        blog,
        authorName,
        subscriber.unsubscribeToken
      );

      if (result.success) {
        sent++;
      } else {
        failed++;
      }

      // Small delay between emails to prevent rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log(
      `[EMAIL] Blog notifications complete: ${sent} sent, ${failed} failed`
    );
    return { sent, failed };
  } catch (error) {
    console.error("[EMAIL] Error notifying subscribers:", error.message);
    return { sent: 0, failed: 0, error: error.message };
  }
};

module.exports = {
  generateOTP,
  sendPasswordResetOTP,
  sendWelcomeEmail,
  sendContactConfirmation,
  sendNewBlogNotification,
  notifyAllSubscribers,
  sendEmailVerification,
  transporter,
};

/**
 * Send email verification link to new user
 * @param {string} email - User's email address
 * @param {string} userName - User's name
 * @param {string} verificationToken - Unique verification token
 */
async function sendEmailVerification(email, userName, verificationToken) {
  // Use CORS_ORIGIN (Vercel URL in production) or CLIENT_URL fallback
  const clientUrl = (process.env.CORS_ORIGIN || process.env.CLIENT_URL || "http://localhost:5173")
    .split(",")[0]  // take first origin if comma-separated
    .trim();
  const verificationLink = `${clientUrl}/verify-email/${verificationToken}`;

  const mailOptions = {
    from: `"Daily Blogs" <${process.env.SMTP_USER || "noreply@dailyblogs.com"
      }>`,
    to: email,
    subject: "Verify Your Email - Daily Blogs ✉️",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f3f4f6; }
          .container { max-width: 600px; margin: 0 auto; background: white; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { padding: 30px; background: #f9f9f9; }
          .verify-box { background: #fff; border: 2px solid #667eea; padding: 25px; text-align: center; margin: 20px 0; border-radius: 10px; }
          .verify-btn { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; }
          .verify-btn:hover { opacity: 0.9; }
          .link-text { word-break: break-all; color: #667eea; font-size: 12px; margin-top: 15px; }
          .warning { color: #e74c3c; font-size: 14px; margin-top: 20px; padding: 15px; background: #fef2f2; border-radius: 8px; }
          .footer { text-align: center; padding: 20px; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✉️ Verify Your Email</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${userName || "there"}</strong>!</p>
            <p>Thank you for registering with Daily Blogs. To complete your registration and start using your account, please verify your email address by clicking the button below:</p>
            
            <div class="verify-box">
              <a href="${verificationLink}" class="verify-btn">Verify My Email</a>
              <p class="link-text">Or copy and paste this link in your browser:<br>${verificationLink}</p>
            </div>
            
            <p><strong>This link will expire in 24 hours.</strong></p>
            
            <div class="warning">
              ⚠️ If you didn't create an account with Daily Blogs, please ignore this email. Someone may have entered your email address by mistake.
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Daily Blogs. All rights reserved.</p>
            <p>This is an automated message, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Hello ${userName || "there"
      }!\n\nThank you for registering with Daily Blogs.\n\nPlease verify your email by clicking this link:\n${verificationLink}\n\nThis link will expire in 24 hours.\n\nIf you didn't create an account, please ignore this email.\n\n— Daily Blogs Team`,
  };

  if (!transporter) {
    console.warn(`[EMAIL] Transporter not configured. Skipping verification email to ${email}`);
    throw new Error("Email service not configured. Please contact support.");
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] Verification email sent to: ${email}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(
      `[EMAIL] Failed to send verification email to ${email}:`,
      error.message
    );
    throw new Error("Failed to send verification email. Please try again.");
  }
}
