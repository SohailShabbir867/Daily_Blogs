// Subscriber Controller - Handles newsletter subscription operations

const Subscriber = require("../models/Subscriber");
const User = require("../models/User");
const { asyncHandler, buildSuccessResponse } = require("../utils/helpers");
const {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} = require("../utils/errors");

// Subscribe to newsletter
const subscribe = asyncHandler(async (req, res) => {
  const { email, name, acceptedTerms } = req.body;

  // Require authentication
  if (!req.user) {
    throw new UnauthorizedError("Please login to subscribe for notifications");
  }

  // Verify the email matches the logged-in user's email
  if (!email || email.toLowerCase() !== req.user.email.toLowerCase()) {
    throw new BadRequestError(
      "You can only subscribe with your registered email address"
    );
  }

  // Require terms acceptance
  if (!acceptedTerms) {
    throw new BadRequestError(
      "You must accept the Terms of Service to subscribe"
    );
  }

  // Check if already subscribed
  const existingSubscriber = await Subscriber.findOne({
    email: email.toLowerCase(),
  });

  if (existingSubscriber) {
    if (existingSubscriber.isActive) {
      throw new BadRequestError("You are already subscribed to notifications");
    } else {
      // Reactivate subscription
      existingSubscriber.isActive = true;
      existingSubscriber.name = name || existingSubscriber.name;
      existingSubscriber.userId = req.user._id;
      existingSubscriber.acceptedTermsAt = new Date();
      await existingSubscriber.save();

      return res.json(
        buildSuccessResponse(
          { subscriber: { email: existingSubscriber.email } },
          "Welcome back! Your subscription has been reactivated."
        )
      );
    }
  }

  // Create new subscriber linked to user account
  const subscriber = await Subscriber.create({
    email: email.toLowerCase(),
    name: name || req.user.name || "",
    userId: req.user._id,
    acceptedTermsAt: new Date(),
  });

  console.log(
    `[SUBSCRIBE] New subscriber: ${email} (User ID: ${req.user._id})`
  );

  res
    .status(201)
    .json(
      buildSuccessResponse(
        { subscriber: { email: subscriber.email } },
        "Successfully subscribed! You'll receive notifications when new blogs are posted."
      )
    );
});

// Unsubscribe from newsletter
const unsubscribe = asyncHandler(async (req, res) => {
  const { token } = req.params;

  const subscriber = await Subscriber.findOne({ unsubscribeToken: token });

  if (!subscriber) {
    throw new NotFoundError("Invalid unsubscribe link");
  }

  subscriber.isActive = false;
  await subscriber.save();

  console.log(`[UNSUBSCRIBE] User unsubscribed: ${subscriber.email}`);

  // Return HTML page for unsubscribe confirmation
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Unsubscribed - Daily Blogs</title>
      <style>
        body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f3f4f6; }
        .container { text-align: center; padding: 40px; background: white; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        h1 { color: #1f2937; }
        p { color: #6b7280; }
        a { color: #3b82f6; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>✅ Unsubscribed Successfully</h1>
        <p>You have been unsubscribed from Daily Blogs notifications.</p>
        <p>We're sorry to see you go!</p>
        <p><a href="${
          process.env.CLIENT_URL || "http://localhost:5173"
        }">Return to Daily Blogs</a></p>
      </div>
    </body>
    </html>
  `);
});

// Get all subscribers (Admin only)
const getSubscribers = asyncHandler(async (req, res) => {
  const subscribers = await Subscriber.find({ isActive: true })
    .select("email name subscribedAt")
    .sort({ subscribedAt: -1 })
    .lean();

  res.json(
    buildSuccessResponse(
      {
        subscribers,
        count: subscribers.length,
      },
      "Subscribers retrieved successfully"
    )
  );
});

// Get subscriber stats (Admin only)
const getSubscriberStats = asyncHandler(async (req, res) => {
  const [totalActive, totalInactive, recentSubscribers] = await Promise.all([
    Subscriber.countDocuments({ isActive: true }),
    Subscriber.countDocuments({ isActive: false }),
    Subscriber.countDocuments({
      isActive: true,
      subscribedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    }),
  ]);

  res.json(
    buildSuccessResponse(
      {
        totalActive,
        totalInactive,
        recentSubscribers,
        total: totalActive + totalInactive,
      },
      "Subscriber stats retrieved successfully"
    )
  );
});

module.exports = {
  subscribe,
  unsubscribe,
  getSubscribers,
  getSubscriberStats,
};
