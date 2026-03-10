// Contact Controller - Handles contact form and admin management

const Contact = require("../models/Contact");
const { asyncHandler, buildSuccessResponse } = require("../utils/helpers");
const { BadRequestError, NotFoundError } = require("../utils/errors");
const { sendContactConfirmation } = require("../utils/emailService");

// Submit a new contact form (authenticated users only)
const submitContact = asyncHandler(async (req, res) => {
  // Always use the authenticated user's identity — never trust submitted name/email
  const name = req.user.name;
  const email = req.user.email;
  const { subject, message } = req.body;

  if (!subject || !message) {
    throw new BadRequestError("Subject and message are required");
  }

  const contact = await Contact.create({
    name,
    email,
    subject: subject.trim(),
    message: message.trim(),
  });

  // Send confirmation email (non-blocking)
  sendContactConfirmation(email, name, subject).catch(console.error);

  console.log(`[CONTACT] New contact submission from: ${email}`);

  res
    .status(201)
    .json(
      buildSuccessResponse(
        {
          message:
            "Your message has been sent successfully! We'll get back to you soon.",
        },
        "Contact submitted"
      )
    );
});

// Get all contacts (super admin only)
const getAllContacts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const status = req.query.status;
  const skip = (page - 1) * limit;

  const filter = {};
  if (status && status !== "all") {
    filter.status = status;
  }

  const [contacts, total] = await Promise.all([
    Contact.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Contact.countDocuments(filter),
  ]);

  res.json(
    buildSuccessResponse(
      {
        contacts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      "Contacts retrieved"
    )
  );
});

// Get single contact
const getContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    throw new NotFoundError("Contact not found");
  }

  // Mark as read if not already
  if (!contact.isRead) {
    contact.isRead = true;
    contact.status = "read";
    await contact.save();
  }

  res.json(buildSuccessResponse({ contact }, "Contact retrieved"));
});

// Update contact status
const updateContactStatus = asyncHandler(async (req, res) => {
  const { status, adminNotes } = req.body;

  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    throw new NotFoundError("Contact not found");
  }

  if (status) {
    contact.status = status;
  }
  if (adminNotes !== undefined) {
    contact.adminNotes = adminNotes;
  }

  await contact.save();

  res.json(buildSuccessResponse({ contact }, "Contact updated"));
});

// Delete contact
const deleteContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findByIdAndDelete(req.params.id);

  if (!contact) {
    throw new NotFoundError("Contact not found");
  }

  console.log(`[CONTACT] Contact deleted: ${contact._id}`);

  res.json(
    buildSuccessResponse(
      { message: "Contact deleted successfully" },
      "Contact deleted"
    )
  );
});

// Get contact stats (for dashboard)
const getContactStats = asyncHandler(async (req, res) => {
  const stats = await Contact.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const total = await Contact.countDocuments();
  const unread = await Contact.countDocuments({ isRead: false });

  res.json(
    buildSuccessResponse(
      {
        total,
        unread,
        byStatus: stats.reduce((acc, s) => {
          acc[s._id] = s.count;
          return acc;
        }, {}),
      },
      "Contact stats retrieved"
    )
  );
});

module.exports = {
  submitContact,
  getAllContacts,
  getContact,
  updateContactStatus,
  deleteContact,
  getContactStats,
};
