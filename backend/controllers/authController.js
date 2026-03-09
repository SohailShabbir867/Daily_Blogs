// Authentication Controller - Handles user auth operations

const crypto = require("crypto");
const User = require("../models/User");
const { asyncHandler, buildSuccessResponse } = require("../utils/helpers");
const {
  BadRequestError,
  UnauthorizedError,
  ConflictError,
  NotFoundError,
} = require("../utils/errors");
const {
  generateOTP,
  sendPasswordResetOTP,
  sendEmailVerification,
} = require("../utils/emailService");

// Register a new user
const register = asyncHandler(async (req, res) => {
  const { name, email, password, acceptTerms } = req.body;

  // Validate terms acceptance
  if (!acceptTerms) {
    throw new BadRequestError("You must accept the Terms and Conditions to register");
  }

  // Check if email already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });

  if (existingUser) {
    throw new ConflictError("An account with this email already exists");
  }

  // Generate email verification token
  const verificationToken = crypto.randomBytes(32).toString("hex");
  const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Create new user (not verified yet)
  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
    isEmailVerified: false,
    emailVerificationToken: verificationToken,
    emailVerificationExpires: verificationExpires,
    termsAcceptedAt: new Date(), // Record when terms were accepted
  });

  // Send verification email (optional in development if SMTP not configured)
  let emailSent = false;
  try {
    await sendEmailVerification(user.email, user.name, verificationToken);
    emailSent = true;
  } catch (emailError) {
    console.error(`[AUTH] Failed to send verification email:`, emailError);

    const isEmailNotConfigured = emailError.message.includes("not configured");

    if (isEmailNotConfigured) {
      // SMTP not configured — auto-verify so user can still log in
      console.warn("[AUTH] SMTP not configured - auto-verifying user");
      user.isEmailVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      await user.save();
    } else {
      // Real SMTP error (bad credentials, network etc.) — keep the user
      // saved in DB and ask them to use the resend-verification flow.
      // Do NOT delete the user — the account exists, only email delivery failed.
      console.error("[AUTH] SMTP error during registration — user saved but email not sent");
      emailSent = false;
    }
  }

  // Log registration
  console.log(
    `[AUTH] New user registered${emailSent ? ' (pending verification)' : ' (auto-verified / email failed)'}: ${user.email} (ID: ${user._id})`
  );

  const requiresVerification = !user.isEmailVerified;
  const responseMessage = emailSent
    ? "Registration successful! Please check your email to verify your account before logging in."
    : requiresVerification
      ? "Registration successful! We couldn't send the verification email right now. Please use 'Resend Verification' on the login page."
      : "Registration successful! You can now log in.";

  res.status(201).json(
    buildSuccessResponse(
      {
        message: responseMessage,
        email: user.email,
        requiresVerification,
        autoVerified: !requiresVerification,
      },
      "User registered"
    )
  );
});

// Login user with email and password
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user with password field (normally excluded)
  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+password +loginAttempts +lockUntil"
  );

  // Check if user exists
  if (!user) {
    throw new UnauthorizedError("Invalid email or password");
  }

  // Check if email is verified
  if (!user.isEmailVerified) {
    throw new UnauthorizedError(
      "Please verify your email before logging in. Check your inbox for the verification link.",
      { code: "EMAIL_NOT_VERIFIED", email: user.email }
    );
  }

  // Check if account is locked
  if (user.lockUntil && user.lockUntil > Date.now()) {
    const remainingTime = Math.ceil((user.lockUntil - Date.now()) / 60000);
    throw new UnauthorizedError(
      `Account is temporarily locked. Please try again in ${remainingTime} minutes.`
    );
  }

  // Check if account is active
  if (!user.isActive) {
    throw new UnauthorizedError(
      "Your account has been deactivated. Please contact support."
    );
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    // Increment login attempts
    user.loginAttempts = (user.loginAttempts || 0) + 1;

    // Lock account after 5 failed attempts
    if (user.loginAttempts >= 5) {
      user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      await user.save();
      throw new UnauthorizedError(
        "Too many failed login attempts. Account locked for 15 minutes."
      );
    }

    await user.save();
    throw new UnauthorizedError("Invalid email or password");
  }

  // Reset login attempts on successful login
  if (user.loginAttempts > 0) {
    user.loginAttempts = 0;
    user.lockUntil = undefined;
  }

  // Update last login timestamp
  user.lastLogin = new Date();
  await user.save();

  // Create session
  req.session.userId = user._id;
  req.session.createdAt = new Date();

  // Debug: Log session info
  console.log(`[AUTH] Session created:`, {
    sessionID: req.session.id,
    userId: user._id,
    cookie: {
      maxAge: req.session.cookie.maxAge,
      expires: req.session.cookie.expires,
      httpOnly: req.session.cookie.httpOnly,
      secure: req.session.cookie.secure,
      sameSite: req.session.cookie.sameSite,
    }
  });

  // Get safe user data
  const userData = user.getSafeProfile();

  // Debug log to verify isSuperAdmin is included
  console.log(
    `[AUTH] User logged in: ${user.email} (ID: ${user._id}), isSuperAdmin=${userData.isSuperAdmin}, role=${userData.role}`
  );

  // Send response
  res.json(
    buildSuccessResponse(
      {
        user: userData,
        message: "Login successful! Welcome back.",
      },
      "Login successful"
    )
  );
});

// Logout user and destroy session
const logout = asyncHandler(async (req, res) => {
  const userId = req.session.userId;

  // Destroy session
  req.session.destroy((err) => {
    if (err) {
      console.error("[AUTH] Session destruction error:", err);
      throw new BadRequestError("Failed to logout. Please try again.");
    }

    // Clear session cookie using the actual configured session name
    res.clearCookie(process.env.SESSION_NAME || "dailyblogs_sid", {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    console.log(`[AUTH] User logged out: ${userId}`);

    res.json(
      buildSuccessResponse(
        { message: "Logged out successfully" },
        "Logout successful"
      )
    );
  });
});

// Get current authenticated user's profile
const getCurrentUser = asyncHandler(async (req, res) => {
  // req.user is already attached by isAuthenticated middleware
  const user = await User.findById(req.user._id)
    .populate("savedBlogs", "title slug image publishedAt")
    .lean();

  if (!user) {
    throw new NotFoundError("User not found");
  }

  res.json(
    buildSuccessResponse({ user }, "User profile retrieved successfully")
  );
});

// Check if user has a valid session
const checkSession = asyncHandler(async (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.json(
      buildSuccessResponse(
        {
          isAuthenticated: false,
          user: null,
        },
        "Not authenticated"
      )
    );
  }

  // Find user - only fetch fields needed by the frontend
  const user = await User.findById(req.session.userId)
    .select("_id name email role isSuperAdmin isChatSupport isActive isEmailVerified avatar bio createdAt lastLogin savedBlogs")
    .lean();

  if (!user || !user.isActive) {
    // Invalid session, destroy it
    req.session.destroy(() => { });

    return res.json(
      buildSuccessResponse(
        {
          isAuthenticated: false,
          user: null,
        },
        "Session invalid"
      )
    );
  }

  // Debug log to verify isSuperAdmin is included
  console.log(
    `[AUTH] Session check: user=${user.email}, isSuperAdmin=${user.isSuperAdmin}, role=${user.role}`
  );

  res.json(
    buildSuccessResponse(
      {
        isAuthenticated: true,
        user,
      },
      "Session valid"
    )
  );
});

// Change user's password
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Get user with password
  const user = await User.findById(req.user._id).select("+password");

  if (!user) {
    throw new NotFoundError("User not found");
  }

  // Verify current password
  const isPasswordValid = await user.comparePassword(currentPassword);

  if (!isPasswordValid) {
    throw new UnauthorizedError("Current password is incorrect");
  }

  // Update password
  user.password = newPassword;
  await user.save();

  // Optionally: Destroy all other sessions for this user
  // This would require a different session store implementation

  console.log(`[AUTH] Password changed for user: ${user.email}`);

  res.json(
    buildSuccessResponse(
      { message: "Password changed successfully" },
      "Password updated"
    )
  );
});

// Refresh/extend user session
const refreshSession = asyncHandler(async (req, res) => {
  req.session.touch();

  res.json(
    buildSuccessResponse(
      { message: "Session refreshed", expiresAt: req.session.cookie.expires },
      "Session extended"
    )
  );
});

// Request password reset OTP
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new BadRequestError("Email is required");
  }

  const user = await User.findOne({ email: email.toLowerCase() });

  // Don't reveal if email exists or not (security)
  if (!user) {
    return res.json(
      buildSuccessResponse(
        { message: "If this email exists, you will receive an OTP shortly." },
        "OTP request processed"
      )
    );
  }

  // Generate OTP and set expiry (10 minutes)
  const otp = generateOTP();
  user.passwordResetOTP = otp;
  user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save({ validateBeforeSave: false });

  // Send OTP email
  try {
    await sendPasswordResetOTP(user.email, otp, user.name);
    console.log(`[AUTH] Password reset OTP sent to: ${user.email}`);
  } catch (error) {
    user.passwordResetOTP = undefined;
    user.otpExpires = undefined;
    await user.save({ validateBeforeSave: false });
    throw new BadRequestError("Failed to send email. Please try again.");
  }

  res.json(
    buildSuccessResponse(
      { message: "OTP sent to your email. Valid for 10 minutes." },
      "OTP sent"
    )
  );
});

// Verify OTP
const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw new BadRequestError("Email and OTP are required");
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+passwordResetOTP +otpExpires"
  );

  if (!user) {
    throw new BadRequestError("Invalid request");
  }

  // Check if OTP exists and hasn't expired
  if (!user.passwordResetOTP || !user.otpExpires) {
    throw new BadRequestError(
      "No OTP request found. Please request a new OTP."
    );
  }

  if (user.otpExpires < Date.now()) {
    user.passwordResetOTP = undefined;
    user.otpExpires = undefined;
    await user.save({ validateBeforeSave: false });
    throw new BadRequestError("OTP has expired. Please request a new one.");
  }

  if (user.passwordResetOTP !== otp) {
    throw new BadRequestError("Invalid OTP");
  }

  res.json(
    buildSuccessResponse(
      { message: "OTP verified successfully", verified: true },
      "OTP valid"
    )
  );
});

// Reset password with OTP
const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    throw new BadRequestError("Email, OTP, and new password are required");
  }

  if (newPassword.length < 6) {
    throw new BadRequestError("Password must be at least 6 characters");
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+passwordResetOTP +otpExpires +password"
  );

  if (!user) {
    throw new BadRequestError("Invalid request");
  }

  // Verify OTP again
  if (!user.passwordResetOTP || user.passwordResetOTP !== otp) {
    throw new BadRequestError("Invalid OTP");
  }

  if (user.otpExpires < Date.now()) {
    throw new BadRequestError("OTP has expired. Please request a new one.");
  }

  // Update password
  user.password = newPassword;
  user.passwordResetOTP = undefined;
  user.otpExpires = undefined;
  user.passwordChangedAt = new Date();
  await user.save();

  console.log(`[AUTH] Password reset completed for: ${user.email}`);

  res.json(
    buildSuccessResponse(
      { message: "Password reset successful! You can now login." },
      "Password reset"
    )
  );
});

// Verify email with token
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;

  if (!token) {
    throw new BadRequestError("Verification token is required");
  }

  // First, try to find user with this verification token
  let user = await User.findOne({
    emailVerificationToken: token,
  }).select("+emailVerificationToken +emailVerificationExpires");

  // If no user found with token, check if this might be a re-verification attempt
  // by looking for a user who was recently verified (prevents errors on page refresh)
  if (!user) {
    // Check if the token was already used (common with React StrictMode or page refresh)
    // We can't know which user, but we can provide a helpful message
    // The user can proceed to login if their email is already verified
    throw new BadRequestError(
      "This verification link has already been used. If you've verified your email, you can now log in.",
      { code: "ALREADY_VERIFIED" }
    );
  }

  // Check if email is already verified (edge case: somehow token wasn't cleared)
  if (user.isEmailVerified) {
    // Clear the token and return success
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    return res.json(
      buildSuccessResponse(
        {
          message: "Your email is already verified! You can log in now.",
          email: user.email,
          alreadyVerified: true,
        },
        "Email already verified"
      )
    );
  }

  // Check if token has expired
  if (user.emailVerificationExpires < Date.now()) {
    throw new BadRequestError(
      "Verification link has expired. Please request a new one from the login page."
    );
  }

  // Mark email as verified
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  console.log(`[AUTH] Email verified for: ${user.email}`);

  res.json(
    buildSuccessResponse(
      {
        message:
          "Email verified successfully! You can now log in to your account.",
        email: user.email,
      },
      "Email verified"
    )
  );
});

// Resend verification email
const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new BadRequestError("Email is required");
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+emailVerificationToken +emailVerificationExpires"
  );

  if (!user) {
    // Don't reveal if email exists or not for security
    throw new BadRequestError(
      "If an account exists with this email, a verification link will be sent."
    );
  }

  // Check if already verified
  if (user.isEmailVerified) {
    throw new BadRequestError(
      "This email is already verified. You can log in."
    );
  }

  // Generate new verification token
  const verificationToken = crypto.randomBytes(32).toString("hex");
  const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  user.emailVerificationToken = verificationToken;
  user.emailVerificationExpires = verificationExpires;
  await user.save();

  // Send verification email
  try {
    await sendEmailVerification(user.email, user.name, verificationToken);
  } catch (emailError) {
    console.error(`[AUTH] Failed to resend verification email:`, emailError);
    throw new BadRequestError(
      "Failed to send verification email. Please try again later."
    );
  }

  console.log(`[AUTH] Verification email resent to: ${user.email}`);

  res.json(
    buildSuccessResponse(
      {
        message: "Verification email sent! Please check your inbox.",
        email: user.email,
      },
      "Verification email resent"
    )
  );
});

module.exports = {
  register,
  login,
  logout,
  getCurrentUser,
  checkSession,
  changePassword,
  refreshSession,
  forgotPassword,
  verifyOTP,
  resetPassword,
  verifyEmail,
  resendVerification,
};
