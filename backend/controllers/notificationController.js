// Notification Controller - Send emails/notifications to users

const User = require("../models/User");
const { transporter } = require("../utils/emailService");
const { asyncHandler, buildSuccessResponse } = require("../utils/helpers");
const { BadRequestError, NotFoundError } = require("../utils/errors");

// Send notification to specific recipients
const sendNotification = asyncHandler(async (req, res) => {
  const { subject, message, recipientType, specificUserId } = req.body;

  if (!subject || !message) {
    throw new BadRequestError("Subject and message are required");
  }

  if (!recipientType) {
    throw new BadRequestError("Recipient type is required");
  }

  let recipients = [];
  let recipientDescription = "";

  switch (recipientType) {
    case "all":
      // All active users (users + admins)
      recipients = await User.find({ isActive: true, isEmailVerified: true })
        .select("email name")
        .lean();
      recipientDescription = "all users";
      break;

    case "users":
      // Only regular users (not admins)
      recipients = await User.find({
        isActive: true,
        isEmailVerified: true,
        role: "user",
      })
        .select("email name")
        .lean();
      recipientDescription = "all regular users";
      break;

    case "admins":
      // Only admins (including super admins)
      recipients = await User.find({
        isActive: true,
        isEmailVerified: true,
        $or: [{ role: "admin" }, { isSuperAdmin: true }],
      })
        .select("email name")
        .lean();
      recipientDescription = "all admins";
      break;

    case "single":
      // Single user by ID
      if (!specificUserId) {
        throw new BadRequestError("User ID is required for single recipient");
      }
      const user = await User.findById(specificUserId)
        .select("email name")
        .lean();
      if (!user) {
        throw new NotFoundError("User not found");
      }
      recipients = [user];
      recipientDescription = user.email;
      break;

    default:
      throw new BadRequestError(
        "Invalid recipient type. Use: all, users, admins, or single"
      );
  }

  if (recipients.length === 0) {
    throw new BadRequestError("No recipients found matching the criteria");
  }

  // Send emails
  const results = { sent: 0, failed: 0, errors: [] };

  for (const recipient of recipients) {
    try {
      await transporter.sendMail({
        from: `"Daily Blogs Admin" <${
          process.env.SMTP_USER || "admin@dailyblogs.com"
        }>`,
        to: recipient.email,
        subject: subject,
        html: generateNotificationEmail(recipient.name, subject, message),
        text: `Hello ${
          recipient.name || "User"
        },\n\n${message}\n\n— Daily Blogs Team`,
      });
      results.sent++;
    } catch (error) {
      results.failed++;
      results.errors.push({ email: recipient.email, error: error.message });
      console.error(
        `[NOTIFICATION] Failed to send to ${recipient.email}:`,
        error.message
      );
    }
  }

  console.log(
    `[NOTIFICATION] Sent by ${req.user.email} to ${recipientDescription}: ${results.sent} sent, ${results.failed} failed`
  );

  res.json(
    buildSuccessResponse(
      {
        totalRecipients: recipients.length,
        sent: results.sent,
        failed: results.failed,
        errors: results.errors.length > 0 ? results.errors : undefined,
      },
      `Notification sent to ${results.sent} recipient(s)`
    )
  );
});

// Send maintenance/downtime notification
const sendMaintenanceNotification = asyncHandler(async (req, res) => {
  const { startTime, endTime, reason, affectedServices } = req.body;

  if (!startTime || !reason) {
    throw new BadRequestError("Start time and reason are required");
  }

  // Get all active users
  const recipients = await User.find({ isActive: true, isEmailVerified: true })
    .select("email name")
    .lean();

  if (recipients.length === 0) {
    throw new BadRequestError("No active users found");
  }

  const subject = "⚠️ Scheduled Maintenance Notice - Daily Blogs";
  const results = { sent: 0, failed: 0 };

  for (const recipient of recipients) {
    try {
      await transporter.sendMail({
        from: `"Daily Blogs" <${
          process.env.SMTP_USER || "admin@dailyblogs.com"
        }>`,
        to: recipient.email,
        subject: subject,
        html: generateMaintenanceEmail(
          recipient.name,
          startTime,
          endTime,
          reason,
          affectedServices
        ),
      });
      results.sent++;
    } catch (error) {
      results.failed++;
      console.error(
        `[MAINTENANCE] Failed to notify ${recipient.email}:`,
        error.message
      );
    }
  }

  console.log(
    `[MAINTENANCE] Notification sent by ${req.user.email}: ${results.sent} sent, ${results.failed} failed`
  );

  res.json(
    buildSuccessResponse(
      { sent: results.sent, failed: results.failed },
      `Maintenance notification sent to ${results.sent} users`
    )
  );
});

// Send error/issue notification to admins only
const sendErrorNotification = asyncHandler(async (req, res) => {
  const { errorType, description, severity, affectedFeatures } = req.body;

  if (!errorType || !description) {
    throw new BadRequestError("Error type and description are required");
  }

  // Get all admins
  const admins = await User.find({
    isActive: true,
    $or: [{ role: "admin" }, { isSuperAdmin: true }],
  })
    .select("email name")
    .lean();

  if (admins.length === 0) {
    throw new BadRequestError("No admins found");
  }

  const subject = `🚨 ${
    severity === "critical" ? "CRITICAL" : "Issue"
  } Alert - Daily Blogs`;
  const results = { sent: 0, failed: 0 };

  for (const admin of admins) {
    try {
      await transporter.sendMail({
        from: `"Daily Blogs System" <${
          process.env.SMTP_USER || "system@dailyblogs.com"
        }>`,
        to: admin.email,
        subject: subject,
        html: generateErrorEmail(
          admin.name,
          errorType,
          description,
          severity,
          affectedFeatures
        ),
      });
      results.sent++;
    } catch (error) {
      results.failed++;
      console.error(
        `[ERROR-ALERT] Failed to notify ${admin.email}:`,
        error.message
      );
    }
  }

  console.log(
    `[ERROR-ALERT] Sent by ${req.user.email}: ${results.sent} admins notified`
  );

  res.json(
    buildSuccessResponse(
      { sent: results.sent, failed: results.failed },
      `Error notification sent to ${results.sent} admin(s)`
    )
  );
});

// Get recipient count for preview
const getRecipientCount = asyncHandler(async (req, res) => {
  const { recipientType } = req.query;

  let count = 0;
  let description = "";

  switch (recipientType) {
    case "all":
      count = await User.countDocuments({
        isActive: true,
        isEmailVerified: true,
      });
      description = "all users and admins";
      break;
    case "users":
      count = await User.countDocuments({
        isActive: true,
        isEmailVerified: true,
        role: "user",
      });
      description = "regular users only";
      break;
    case "admins":
      count = await User.countDocuments({
        isActive: true,
        isEmailVerified: true,
        $or: [{ role: "admin" }, { isSuperAdmin: true }],
      });
      description = "admins only";
      break;
    default:
      count = 0;
      description = "unknown";
  }

  res.json(
    buildSuccessResponse({ count, description }, "Recipient count retrieved")
  );
});

// Email template generators
function generateNotificationEmail(userName, subject, message) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .message { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #667eea; }
        .footer { text-align: center; color: #888; font-size: 12px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📢 ${subject}</h1>
        </div>
        <div class="content">
          <p>Hello <strong>${userName || "User"}</strong>,</p>
          <div class="message">
            ${message.replace(/\n/g, "<br>")}
          </div>
          <p>Thank you for being part of Daily Blogs!</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Daily Blogs. All rights reserved.</p>
          <p>This is an official notification from the Daily Blogs team.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateMaintenanceEmail(
  userName,
  startTime,
  endTime,
  reason,
  affectedServices
) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f39c12; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .info-box { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .time { font-size: 18px; font-weight: bold; color: #e74c3c; }
        .footer { text-align: center; color: #888; font-size: 12px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚠️ Scheduled Maintenance</h1>
        </div>
        <div class="content">
          <p>Hello <strong>${userName || "User"}</strong>,</p>
          <p>We will be performing scheduled maintenance on Daily Blogs.</p>
          
          <div class="info-box">
            <p><strong>📅 Start Time:</strong> <span class="time">${startTime}</span></p>
            ${
              endTime
                ? `<p><strong>📅 End Time:</strong> <span class="time">${endTime}</span></p>`
                : ""
            }
            <p><strong>📝 Reason:</strong> ${reason}</p>
            ${
              affectedServices
                ? `<p><strong>🔧 Affected Services:</strong> ${affectedServices}</p>`
                : ""
            }
          </div>
          
          <p>During this time, the website may be temporarily unavailable. We apologize for any inconvenience.</p>
          <p>Thank you for your patience!</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Daily Blogs. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateErrorEmail(
  adminName,
  errorType,
  description,
  severity,
  affectedFeatures
) {
  const severityColors = {
    critical: "#e74c3c",
    high: "#e67e22",
    medium: "#f39c12",
    low: "#3498db",
  };
  const color = severityColors[severity] || severityColors.medium;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: ${color}; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .alert-box { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid ${color}; }
        .severity { display: inline-block; background: ${color}; color: white; padding: 3px 10px; border-radius: 3px; font-size: 12px; }
        .footer { text-align: center; color: #888; font-size: 12px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚨 System Alert</h1>
        </div>
        <div class="content">
          <p>Hello <strong>${adminName || "Admin"}</strong>,</p>
          <p>A system issue has been reported that requires attention.</p>
          
          <div class="alert-box">
            <p><strong>Type:</strong> ${errorType}</p>
            <p><strong>Severity:</strong> <span class="severity">${(
              severity || "medium"
            ).toUpperCase()}</span></p>
            <p><strong>Description:</strong><br>${description.replace(
              /\n/g,
              "<br>"
            )}</p>
            ${
              affectedFeatures
                ? `<p><strong>Affected Features:</strong> ${affectedFeatures}</p>`
                : ""
            }
            <p><strong>Reported At:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <p>Please investigate and take appropriate action.</p>
        </div>
        <div class="footer">
          <p>This is an automated system alert from Daily Blogs.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

module.exports = {
  sendNotification,
  sendMaintenanceNotification,
  sendErrorNotification,
  getRecipientCount,
};
