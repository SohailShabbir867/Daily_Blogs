// File Controller — CRUD for private study files (PDF/PPT) uploaded by CRs

const PrivateFile = require("../models/PrivateFile");
const {
  asyncHandler,
  buildSuccessResponse,
  parsePaginationParams,
  isValidObjectId,
} = require("../utils/helpers");
const { BadRequestError, NotFoundError, ForbiddenError } = require("../utils/errors");

// ── Public Endpoints ──────────────────────────────────────────────────────────

// GET /api/files — List all active files (metadata only, NO fileUrl, NO password)
const getFiles = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePaginationParams(req.query);
  const { subject, search, sortBy = "createdAt", sortOrder = "desc" } = req.query;

  const query = { isActive: true };

  if (subject && subject !== "All") {
    query.subject = { $regex: subject.trim(), $options: "i" };
  }

  if (search) {
    const safe = search.trim().slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    query.$or = [
      { title: { $regex: safe, $options: "i" } },
      { subject: { $regex: safe, $options: "i" } },
      { professorName: { $regex: safe, $options: "i" } },
      { tags: { $in: [new RegExp(safe, "i")] } },
    ];
  }

  const sortDir = sortOrder === "asc" ? 1 : -1;

  const [files, total] = await Promise.all([
    PrivateFile.find(query)
      .select("-fileUrl -cloudinaryPublicId -accessPassword") // never expose direct URL or hash publicly
      .populate("uploadedBy", "name")
      .sort({ [sortBy]: sortDir })
      .skip(skip)
      .limit(limit)
      .lean(),
    PrivateFile.countDocuments(query),
  ]);

  const totalPages = Math.ceil(total / limit);

  res.json(
    buildSuccessResponse(
      {
        files,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
      "Files retrieved successfully"
    )
  );
});

// GET /api/files/subjects — Get all unique subjects for filter dropdown
const getSubjects = asyncHandler(async (req, res) => {
  const subjects = await PrivateFile.distinct("subject", { isActive: true });
  res.json(buildSuccessResponse({ subjects: subjects.sort() }, "Subjects retrieved"));
});

// GET /api/files/:id — Get single file metadata (NO fileUrl)
const getFile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) throw new BadRequestError("Invalid file ID");

  const file = await PrivateFile.findOne({ _id: id, isActive: true })
    .select("-fileUrl -cloudinaryPublicId -accessPassword")
    .populate("uploadedBy", "name")
    .lean();

  if (!file) throw new NotFoundError("File not found");

  res.json(buildSuccessResponse({ file }, "File retrieved"));
});

// POST /api/files/:id/access — Verify password and return the file URL
const accessFile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  if (!isValidObjectId(id)) throw new BadRequestError("Invalid file ID");

  // Fetch WITH the hashed password field
  const file = await PrivateFile.findOne({ _id: id, isActive: true }).select("+accessPassword");

  if (!file) throw new NotFoundError("File not found");

  if (file.isPasswordProtected) {
    if (!password) throw new BadRequestError("Password is required to access this file");

    const isCorrect = await file.verifyPassword(password);
    if (!isCorrect) throw new ForbiddenError("Incorrect password");
  }

  // Increment access count (non-blocking)
  PrivateFile.findByIdAndUpdate(id, { $inc: { accessCount: 1 } }).catch(() => {});

  res.json(
    buildSuccessResponse(
      { fileUrl: file.fileUrl, fileName: file.fileName, fileType: file.fileType },
      "Access granted"
    )
  );
});

// ── CR + Super Admin Endpoints ─────────────────────────────────────────────────

// POST /api/files — Upload a new file (CR or Super Admin)
const createFile = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    subject,
    section,
    lectureNumber,
    professorName,
    lectureDate,
    tags,
    fileUrl,
    fileType,
    fileName,
    fileSizeBytes,
    cloudinaryPublicId,
    isPasswordProtected,
    accessPassword,
  } = req.body;

  if (!fileUrl) throw new BadRequestError("File URL is required — upload file to Cloudinary first");
  if (!fileUrl.startsWith("https://res.cloudinary.com/")) {
    throw new BadRequestError("Invalid file URL — must be a Cloudinary URL");
  }
  if (isPasswordProtected && !accessPassword) {
    throw new BadRequestError("Password is required when file is password-protected");
  }
  const tagsArr = Array.isArray(tags) ? tags.slice(0, 20) : [];

  const fileData = {
    title,
    description,
    subject,
    section,
    lectureNumber: lectureNumber ? parseInt(lectureNumber) : null,
    professorName,
    lectureDate: lectureDate ? new Date(lectureDate) : null,
    tags: tagsArr,
    fileUrl,
    fileType: fileType || "other",
    fileName,
    fileSizeBytes: fileSizeBytes || 0,
    cloudinaryPublicId,
    isPasswordProtected: !!isPasswordProtected,
    uploadedBy: req.user._id,
  };

  if (isPasswordProtected && accessPassword) {
    fileData.accessPassword = accessPassword; // pre-save hook hashes it
  }

  const file = await PrivateFile.create(fileData);
  await file.populate("uploadedBy", "name");

  console.log(`[FILE] New file uploaded: "${file.title}" by ${req.user.email}`);

  res.status(201).json(buildSuccessResponse({ file }, "File uploaded successfully"));
});

// PUT /api/files/:id — Update file metadata (owner CR or Super Admin)
const updateFile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) throw new BadRequestError("Invalid file ID");

  const file = await PrivateFile.findById(id);
  if (!file) throw new NotFoundError("File not found");

  // Ownership check — only uploader or super admin can edit
  const isOwner = file.uploadedBy.toString() === req.user._id.toString();
  if (!isOwner && !req.user.isSuperAdmin) {
    throw new ForbiddenError("You can only edit your own files");
  }

  const allowedUpdates = [
    "title", "description", "subject", "section", "lectureNumber",
    "professorName", "lectureDate", "tags", "isPasswordProtected",
  ];

  allowedUpdates.forEach((field) => {
    if (req.body[field] !== undefined) {
      file[field] = req.body[field];
    }
  });

  // Handle password update — just assign, the pre-save hook hashes it
  if (req.body.accessPassword) {
    file.accessPassword = req.body.accessPassword;
    file.markModified("accessPassword");
  }

  await file.save();
  await file.populate("uploadedBy", "name");

  res.json(buildSuccessResponse({ file }, "File updated successfully"));
});

// DELETE /api/files/:id — Delete file (owner CR or Super Admin)
const deleteFile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) throw new BadRequestError("Invalid file ID");

  const file = await PrivateFile.findById(id);
  if (!file) throw new NotFoundError("File not found");

  const isOwner = file.uploadedBy.toString() === req.user._id.toString();
  if (!isOwner && !req.user.isSuperAdmin) {
    throw new ForbiddenError("You can only delete your own files");
  }

  await file.deleteOne();
  console.log(`[FILE] File deleted: "${file.title}" by ${req.user.email}`);

  res.json(buildSuccessResponse({}, "File deleted successfully"));
});

// GET /api/files/my — Get files uploaded by current CR user
const getMyFiles = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePaginationParams(req.query);

  const query = { uploadedBy: req.user._id };

  const [files, total] = await Promise.all([
    PrivateFile.find(query)
      .select("-accessPassword")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    PrivateFile.countDocuments(query),
  ]);

  const totalPages = Math.ceil(total / limit);

  res.json(
    buildSuccessResponse(
      {
        files,
        pagination: { currentPage: page, totalPages, totalItems: total, itemsPerPage: limit },
      },
      "Your files retrieved"
    )
  );
});

// ── Super Admin Only ──────────────────────────────────────────────────────────

// PATCH /api/files/:id/toggle — Enable or disable a file (Super Admin)
const toggleFileStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) throw new BadRequestError("Invalid file ID");

  const file = await PrivateFile.findById(id);
  if (!file) throw new NotFoundError("File not found");

  file.isActive = !file.isActive;
  await file.save();

  console.log(`[ADMIN] File ${file.isActive ? "enabled" : "disabled"}: "${file.title}"`);

  res.json(buildSuccessResponse({ isActive: file.isActive }, `File ${file.isActive ? "enabled" : "disabled"}`));
});

// GET /api/files/admin/all — Get ALL files for super admin (including inactive)
const adminGetAllFiles = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePaginationParams(req.query);

  const [files, total] = await Promise.all([
    PrivateFile.find({})
      .select("-accessPassword")
      .populate("uploadedBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    PrivateFile.countDocuments({}),
  ]);

  const totalPages = Math.ceil(total / limit);

  res.json(
    buildSuccessResponse(
      { files, pagination: { currentPage: page, totalPages, totalItems: total, itemsPerPage: limit } },
      "All files retrieved"
    )
  );
});

module.exports = {
  getFiles,
  getSubjects,
  getFile,
  accessFile,
  createFile,
  updateFile,
  deleteFile,
  getMyFiles,
  toggleFileStatus,
  adminGetAllFiles,
};
