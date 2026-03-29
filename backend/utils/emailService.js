// Email Service - Nodemailer configuration for sending emails

const nodemailer = require("nodemailer");
const dns = require("dns");

// Force IPv4 DNS resolution globally — Render's free tier blocks outbound IPv6.
// This must be set before any network calls.
dns.setDefaultResultOrder("ipv4first");

const https = require("https");

// ---------------------------------------------------------------------------
// Brevo HTTP API sender — uses HTTPS port 443, not blocked by Render free tier.
// Render blocks ALL outbound TCP on port 587 (SMTP), so this is the only
// reliable way to send email from a Render free-tier service.
// ---------------------------------------------------------------------------
const sendViaBrevoAPI = (mailOptions) => {
  return new Promise((resolve, reject) => {
    // Parse "Daily Blogs <email>" format
    const fromMatch = (mailOptions.from || "").match(/\"?([^\"<]+)\"?\s*<([^>]+)>/);
    const senderName = fromMatch ? fromMatch[1].trim() : "Daily Blogs";
    const senderEmail = fromMatch ? fromMatch[2].trim() : (process.env.SMTP_USER || "").trim();

    const body = {
      sender: { name: senderName, email: senderEmail },
      to: [{ email: mailOptions.to }],
      subject: mailOptions.subject,
    };
    if (mailOptions.html) body.htmlContent = mailOptions.html;
    if (mailOptions.text) body.textContent = mailOptions.text;
    const payload = JSON.stringify(body);

    const req = https.request(
      {
        hostname: "api.brevo.com",
        path: "/v3/smtp/email",
        method: "POST",
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
          Accept: "application/json",
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ messageId: (JSON.parse(data) || {}).messageId || "sent" });
          } else {
            reject(new Error(`Brevo API error ${res.statusCode}: ${data}`));
          }
        });
      }
    );
    req.setTimeout(30000, () => req.destroy(new Error("Brevo API timeout")));
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
};

// Create transporter/sender — prefers Brevo HTTP API, falls back to SMTP
const createTransporter = () => {
  // Brevo HTTP API (recommended for Azure/cloud) — set BREVO_API_KEY in env vars
  if (process.env.BREVO_API_KEY) {
    console.log("[EMAIL] BREVO_API_KEY found — using Brevo HTTP API (port 443, works on Azure/Render)");
    // Return duck-typed object compatible with all transporter.sendMail() call sites
    return { sendMail: sendViaBrevoAPI, _mode: "brevo-api" };
  }

  // Fall back to SMTP
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("⚠️ [EMAIL] No email credentials configured.");
    console.warn("   Set BREVO_API_KEY (recommended) OR both SMTP_USER + SMTP_PASS.");
    console.warn("   Email will be DISABLED until credentials are added to Azure App Settings.");
    return null;
  }

  try {
    const smtpUser = process.env.SMTP_USER.trim();
    const smtpPass = process.env.SMTP_PASS.trim();
    const host     = process.env.SMTP_HOST || "smtp.gmail.com";
    // Port 465 (SSL) is preferred over 587 (STARTTLS) on Azure — Azure blocks 587 outbound
    const port     = parseInt(process.env.SMTP_PORT) || 465;
    const secure   = port === 465 ? true : (process.env.SMTP_SECURE === "true");

    const transport = nodemailer.createTransport({
      host,
      port,
      secure,          // true for 465 (SSL), false for 587 (STARTTLS)
      requireTLS: !secure,
      lookup: (hostname, options, callback) => {
        dns.resolve4(hostname, (err, addresses) => {
          if (err) return callback(err);
          callback(null, addresses[0], 4);
        });
      },
      auth: { user: smtpUser, pass: smtpPass },
      connectionTimeout: 30000,
      greetingTimeout:   15000,
      socketTimeout:     30000,
      pool: false,
    });

    console.log(`[EMAIL] SMTP transporter created — host: ${host}:${port} (${secure ? "SSL" : "STARTTLS"}), user: ${smtpUser}`);
    return transport;
  } catch (error) {
    console.error("❌ [EMAIL] Failed to create SMTP transporter:", error.message);
    return null;
  }
};

const transporter = createTransporter();

// Log startup email configuration
if (transporter) {
  if (transporter._mode === "brevo-api") {
    console.log("✅ [EMAIL] Brevo HTTP API configured — ready to send emails");
  } else {
    // SMTP fallback — verify on startup
    transporter.verify((error) => {
      if (error) {
        console.error("❌ [EMAIL] SMTP connection FAILED:", error.message);
        console.error(`   Code: ${error.code || "N/A"} | Response: ${error.response || "N/A"}`);
        console.error("   → Render free tier blocks outbound SMTP (port 587). Add BREVO_API_KEY env var instead.");
      } else {
        console.log("✅ [EMAIL] SMTP connection verified — ready to send emails");
      }
    });
  }
}

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email for password reset
const sendPasswordResetOTP = async (email, otp, userName) => {
  const mailOptions = {
    from: `"Daily Blogs" <${process.env.SMTP_USER || "noreply@dailyblogs.com"}>`,
    to: email,
    subject: "Password Reset OTP - Daily Blogs",
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Password Reset OTP</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #374151; background-color: #f3f4f6; }
          .email-wrapper { width: 100%; background-color: #f3f4f6; padding: 24px 12px; }
          .container { max-width: 580px; width: 100%; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
          .header { background: linear-gradient(135deg, #059669 0%, #0d9488 100%); color: white; padding: 32px 28px; text-align: center; }
          .header h1 { font-size: 24px; font-weight: 700; margin: 0; }
          .content { padding: 32px 28px; }
          .content p { margin-bottom: 16px; color: #374151; font-size: 16px; }
          .otp-box { background: #f0fdf4; border: 2px dashed #059669; padding: 28px 20px; text-align: center; margin: 24px 0; border-radius: 12px; }
          .otp-label { color: #6b7280; font-size: 14px; margin-bottom: 8px; }
          .otp-code { font-size: 40px; font-weight: 800; color: #059669; letter-spacing: 10px; font-family: 'Courier New', Courier, monospace; line-height: 1.2; word-spacing: -4px; }
          .otp-expiry { color: #9ca3af; font-size: 13px; margin-top: 8px; }
          .warning-box { background: #fef2f2; border-left: 4px solid #ef4444; padding: 14px 16px; border-radius: 4px; margin-top: 24px; color: #b91c1c; font-size: 14px; line-height: 1.5; }
          .footer { background: #f9fafb; text-align: center; padding: 20px 24px; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb; }
          @media only screen and (max-width: 600px) {
            .email-wrapper { padding: 0; }
            .container { border-radius: 0; box-shadow: none; }
            .header { padding: 24px 16px; }
            .header h1 { font-size: 20px; }
            .content { padding: 24px 16px; }
            .content p { font-size: 15px; }
            .otp-code { font-size: 32px; letter-spacing: 6px; }
            .otp-box { padding: 20px 12px; }
            .footer { padding: 16px; }
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset</h1>
            </div>
            <div class="content">
              <p>Hello <strong>${userName || "User"}</strong>,</p>
              <p>We received a request to reset your Daily Blogs password. Use the one-time code below to proceed:</p>

              <div class="otp-box">
                <p class="otp-label">Your OTP Code</p>
                <p class="otp-code">${otp}</p>
                <p class="otp-expiry">⏱ Valid for 10 minutes only</p>
              </div>

              <p>Enter this code on the password reset page to create a new password.</p>

              <div class="warning-box">
                ⚠️ If you did not request a password reset, please ignore this email. Your account is safe — no changes have been made.
              </div>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Daily Blogs. All rights reserved.</p>
              <p style="margin-top: 4px;">This is an automated message, please do not reply.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Hello ${userName ||
      "User"},\n\nYour password reset OTP is: ${otp}\n\nThis code is valid for 10 minutes.\n\nIf you didn't request this, please ignore this email.\n\n- Daily Blogs Team`,
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
    from: `"Daily Blogs" <${process.env.SMTP_USER || "noreply@dailyblogs.com"}>`,
    to: email,
    subject: "Welcome to Daily Blogs! 🎉",
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Welcome to Daily Blogs!</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #374151; background-color: #f3f4f6; }
          .email-wrapper { width: 100%; background-color: #f3f4f6; padding: 24px 12px; }
          .container { max-width: 580px; width: 100%; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
          .header { background: linear-gradient(135deg, #059669 0%, #0d9488 100%); color: white; padding: 36px 28px; text-align: center; }
          .header h1 { font-size: 26px; font-weight: 700; margin: 0; }
          .header p { color: rgba(255,255,255,0.85); font-size: 14px; margin-top: 6px; }
          .content { padding: 32px 28px; }
          .content p { margin-bottom: 16px; color: #374151; font-size: 16px; }
          .feature-list { list-style: none; padding: 0; margin: 16px 0 24px; }
          .feature-list li { padding: 10px 0; font-size: 15px; color: #374151; border-bottom: 1px solid #f3f4f6; }
          .feature-list li:last-child { border-bottom: none; }
          .cta-box { text-align: center; margin: 28px 0 8px; }
          .cta-btn { display: inline-block; background: linear-gradient(135deg, #059669 0%, #0d9488 100%); color: #ffffff !important; text-decoration: none; padding: 16px 40px; border-radius: 10px; font-size: 16px; font-weight: 700; box-shadow: 0 4px 12px rgba(5,150,105,0.3); }
          .footer { background: #f9fafb; text-align: center; padding: 20px 24px; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb; }
          @media only screen and (max-width: 600px) {
            .email-wrapper { padding: 0; }
            .container { border-radius: 0; box-shadow: none; }
            .header { padding: 24px 16px; }
            .header h1 { font-size: 22px; }
            .content { padding: 24px 16px; }
            .content p { font-size: 15px; }
            .cta-btn { display: block; padding: 14px 20px; text-align: center; }
            .footer { padding: 16px; }
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="container">
            <div class="header">
              <h1>Welcome to Daily Blogs! 🎉</h1>
              <p>Your journey to great reading starts now</p>
            </div>
            <div class="content">
              <p>Hello <strong>${userName}</strong>,</p>
              <p>Thank you for joining Daily Blogs! We're thrilled to have you as part of our growing community of curious readers and writers.</p>
              <p>Here's what you can do with your account:</p>
              <ul class="feature-list">
                <li>📖 &nbsp;Read amazing blog posts from expert writers</li>
                <li>💾 &nbsp;Save your favorite articles to read later</li>
                <li>💬 &nbsp;Comment and engage with the community</li>
                <li>🔔 &nbsp;Get notified when new stories go live</li>
              </ul>
              <div class="cta-box">
                <a href="${(process.env.CORS_ORIGIN || process.env.CLIENT_URL || 'http://localhost:5173').split(',')[0].trim()}" class="cta-btn">Start Exploring →</a>
              </div>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Daily Blogs. All rights reserved.</p>
              <p style="margin-top: 4px;">This is an automated message, please do not reply.</p>
            </div>
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
    from: `"Daily Blogs Support" <${process.env.SMTP_USER || "support@dailyblogs.com"}>`,
    to: email,
    subject: "We received your message - Daily Blogs",
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Message Received</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #374151; background-color: #f3f4f6; }
          .email-wrapper { width: 100%; background-color: #f3f4f6; padding: 24px 12px; }
          .container { max-width: 580px; width: 100%; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
          .header { background: linear-gradient(135deg, #059669 0%, #0d9488 100%); color: white; padding: 32px 28px; text-align: center; }
          .header h1 { font-size: 24px; font-weight: 700; margin: 0; }
          .content { padding: 32px 28px; }
          .content p { margin-bottom: 16px; color: #374151; font-size: 16px; }
          .subject-box { background: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px 20px; border-radius: 10px; margin: 20px 0; }
          .subject-box p { margin: 0; color: #065f46; font-weight: 600; font-size: 15px; }
          .info-box { background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 14px 16px; border-radius: 4px; margin-top: 8px; color: #0369a1; font-size: 14px; line-height: 1.5; }
          .footer { background: #f9fafb; text-align: center; padding: 20px 24px; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb; }
          @media only screen and (max-width: 600px) {
            .email-wrapper { padding: 0; }
            .container { border-radius: 0; box-shadow: none; }
            .header { padding: 24px 16px; }
            .header h1 { font-size: 20px; }
            .content { padding: 24px 16px; }
            .content p { font-size: 15px; }
            .footer { padding: 16px; }
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="container">
            <div class="header">
              <h1>📬 Message Received</h1>
            </div>
            <div class="content">
              <p>Hello <strong>${name}</strong>,</p>
              <p>Thank you for reaching out to Daily Blogs Support! We've received your message and our team will be in touch soon.</p>
              <div class="subject-box">
                <p>📋 Subject: "${subject}"</p>
              </div>
              <div class="info-box">
                ⏱️ Our support team typically responds within <strong>24–48 hours</strong> during business days.
              </div>
              <p style="margin-top: 20px;">In the meantime, feel free to explore more great content on Daily Blogs!</p>
              <p>Best regards,<br><strong>Daily Blogs Support Team</strong></p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Daily Blogs. All rights reserved.</p>
              <p style="margin-top: 4px;">This is an automated confirmation, please do not reply to this email.</p>
            </div>
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
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>New Blog Post</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #374151; background-color: #f3f4f6; }
          .email-wrapper { width: 100%; background-color: #f3f4f6; padding: 24px 12px; }
          .container { max-width: 580px; width: 100%; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
          .header { background: linear-gradient(135deg, #059669 0%, #0d9488 100%); color: white; padding: 32px 28px; text-align: center; }
          .header h1 { font-size: 24px; font-weight: 700; }
          .content { padding: 28px; }
          .content > p { margin-bottom: 16px; font-size: 16px; color: #374151; }
          .blog-card { background: #f9fafb; border-radius: 12px; overflow: hidden; margin: 20px 0; border: 1px solid #e5e7eb; }
          .blog-image { width: 100%; height: 200px; object-fit: cover; background: linear-gradient(135deg, #059669 0%, #0d9488 100%); display: block; }
          .blog-info { padding: 20px; }
          .blog-title { font-size: 20px; font-weight: 700; color: #1f2937; margin: 0 0 10px 0; }
          .blog-meta { color: #6b7280; font-size: 14px; margin-bottom: 10px; }
          .blog-description { color: #4b5563; margin-bottom: 16px; font-size: 15px; }
          .read-btn { display: inline-block; background: linear-gradient(135deg, #059669 0%, #0d9488 100%); color: #ffffff !important; padding: 13px 28px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 15px; }
          .footer { background: #f9fafb; text-align: center; padding: 20px 24px; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb; }
          .unsubscribe { color: #9ca3af; text-decoration: underline; }
          @media only screen and (max-width: 600px) {
            .email-wrapper { padding: 0; }
            .container { border-radius: 0; box-shadow: none; }
            .header { padding: 24px 16px; }
            .header h1 { font-size: 20px; }
            .content { padding: 20px 16px; }
            .blog-info { padding: 16px; }
            .blog-title { font-size: 18px; }
            .read-btn { display: block; text-align: center; padding: 14px 20px; }
            .blog-image { height: 160px; }
            .footer { padding: 16px; }
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
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
            <p style="margin-top:6px;">
              <a href="${backendUrl}/api/subscribe/unsubscribe/${unsubscribeToken}" class="unsubscribe">
                Unsubscribe from notifications
              </a>
            </p>
          </div>
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
    from: `"Daily Blogs" <${process.env.SMTP_USER || "noreply@dailyblogs.com"}>`,
    to: email,
    subject: "Verify Your Email - Daily Blogs ✉️",
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Verify Your Email</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #374151; background-color: #f3f4f6; }
          .email-wrapper { width: 100%; background-color: #f3f4f6; padding: 24px 12px; }
          .container { max-width: 580px; width: 100%; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
          .header { background: linear-gradient(135deg, #059669 0%, #0d9488 100%); color: white; padding: 36px 28px; text-align: center; }
          .header h1 { font-size: 26px; font-weight: 700; margin: 0; }
          .header p { margin-top: 6px; color: rgba(255,255,255,0.85); font-size: 14px; }
          .content { padding: 32px 28px; }
          .content p { margin-bottom: 16px; color: #374151; font-size: 16px; }
          .verify-box { background: #f0fdf4; border: 2px solid #059669; padding: 28px 20px; text-align: center; margin: 28px 0; border-radius: 12px; }
          .verify-btn { display: inline-block; background: linear-gradient(135deg, #059669 0%, #0d9488 100%); color: #ffffff !important; text-decoration: none; padding: 16px 40px; border-radius: 10px; font-size: 16px; font-weight: 700; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(5,150,105,0.3); }
          .link-box { margin-top: 16px; padding: 10px; background: #f9fafb; border-radius: 6px; }
          .link-text { word-break: break-all; color: #059669; font-size: 12px; }
          .expiry-note { font-size: 14px; color: #6b7280; margin-top: 8px; }
          .warning-box { background: #fef2f2; border-left: 4px solid #ef4444; padding: 14px 16px; border-radius: 4px; margin-top: 24px; color: #b91c1c; font-size: 14px; line-height: 1.5; }
          .footer { background: #f9fafb; text-align: center; padding: 20px 24px; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb; }
          @media only screen and (max-width: 600px) {
            .email-wrapper { padding: 0; }
            .container { border-radius: 0; box-shadow: none; }
            .header { padding: 24px 16px; }
            .header h1 { font-size: 22px; }
            .content { padding: 24px 16px; }
            .content p { font-size: 15px; }
            .verify-btn { display: block; padding: 14px 20px; font-size: 15px; text-align: center; }
            .verify-box { padding: 20px 12px; margin: 20px 0; }
            .footer { padding: 16px; }
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="container">
            <div class="header">
              <h1>✉️ Verify Your Email</h1>
              <p>One step away from your account</p>
            </div>
            <div class="content">
              <p>Hello <strong>${userName || "there"}</strong>!</p>
              <p>Thank you for joining Daily Blogs. To activate your account and start reading, please verify your email address:</p>

              <div class="verify-box">
                <a href="${verificationLink}" class="verify-btn">✅ Verify My Email</a>
                <div class="link-box">
                  <p style="color:#6b7280; font-size:12px; margin-bottom:4px;">Or copy &amp; paste this link in your browser:</p>
                  <p class="link-text">${verificationLink}</p>
                </div>
                <p class="expiry-note">🕐 This link expires in <strong>24 hours</strong></p>
              </div>

              <p style="font-size:14px; color:#6b7280;">If you did not create an account, you can safely ignore this email.</p>

              <div class="warning-box">
                ⚠️ Never share this verification link with anyone. Daily Blogs staff will never ask for this link.
              </div>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Daily Blogs. All rights reserved.</p>
              <p style="margin-top:4px;">This is an automated message, please do not reply.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Hello ${userName || "there"}!\n\nThank you for registering with Daily Blogs.\n\nPlease verify your email by clicking this link:\n${verificationLink}\n\nThis link will expire in 24 hours.\n\nIf you didn't create an account, please ignore this email.\n\n— Daily Blogs Team`,
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
    console.error(`[EMAIL] Failed to send verification email to ${email}:`, {
      message: error.message,
      code: error.code,
      response: error.response,
      command: error.command,
    });
    throw new Error("Failed to send verification email. Please try again.");
  }
}
