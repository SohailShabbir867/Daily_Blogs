// ManageFiles.jsx — CR file upload and management panel
import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  getMyFiles,
  createFile,
  updateFile,
  deleteFile,
  adminGetAllFiles,
  toggleFileStatus,
} from "../../services/fileService";

// ── Cloudinary raw file upload ────────────────────────────────────────────────
const CLOUD_NAME = "devjo9jtq";
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "rtdkgidy";

const uploadFileToCloudinary = async (file, onProgress) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", "dailyblogs/files");
  formData.append("resource_type", "raw");

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    if (onProgress) {
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable)
          onProgress(Math.round((e.loaded / e.total) * 100));
      });
    }
    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        const err = JSON.parse(xhr.responseText);
        reject(new Error(err.error?.message || "Upload failed"));
      }
    });
    xhr.addEventListener("error", () =>
      reject(new Error("Network error during upload"))
    );
    xhr.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/upload`
    );
    xhr.send(formData);
  });
};

const FILE_TYPES = ["pdf", "ppt", "pptx", "doc", "docx"];
const EMPTY_FORM = {
  title: "",
  description: "",
  subject: "",
  section: "",
  lectureNumber: "",
  professorName: "",
  lectureDate: "",
  tags: "",
  isPasswordProtected: true,
  accessPassword: "",
};

const ManageFiles = () => {
  const { user, isCR, isSuperAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingFile, setEditingFile] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [user, authLoading, navigate]);

  const loadFiles = useCallback(async () => {
    if (!isCR) return;
    setIsLoading(true);
    try {
      const res = isSuperAdmin
        ? await adminGetAllFiles({ limit: 50 })
        : await getMyFiles({ limit: 50 });
      setFiles(res.data?.files || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [isCR, isSuperAdmin]);

  useEffect(() => {
    if (!authLoading && user) loadFiles();
  }, [loadFiles, authLoading, user]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    if (!FILE_TYPES.includes(ext)) {
      setError("Only PDF, PPT, PPTX, DOC, DOCX files are allowed");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File must be under 10MB (Cloudinary free plan limit)");
      return;
    }
    setSelectedFile(file);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!editingFile && !selectedFile) {
      setError("Please select a file to upload");
      return;
    }
    if (!form.title.trim() || !form.subject.trim()) {
      setError("Title and Subject are required");
      return;
    }
    if (form.isPasswordProtected && !form.accessPassword.trim() && !editingFile) {
      setError("Password is required for password-protected files");
      return;
    }

    setIsSubmitting(true);
    try {
      let fileUrl = editingFile?.fileUrl;
      let fileType = editingFile?.fileType;
      let fileName = editingFile?.fileName;
      let fileSizeBytes = editingFile?.fileSizeBytes;
      let cloudinaryPublicId = editingFile?.cloudinaryPublicId;

      if (selectedFile) {
        setUploadProgress(0);
        const cloudData = await uploadFileToCloudinary(selectedFile, setUploadProgress);
        fileUrl = cloudData.secure_url;
        fileType = selectedFile.name.split(".").pop().toLowerCase();
        fileName = selectedFile.name;
        fileSizeBytes = selectedFile.size;
        cloudinaryPublicId = cloudData.public_id;
      }

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        subject: form.subject.trim(),
        section: form.section.trim(),
        lectureNumber: form.lectureNumber || null,
        professorName: form.professorName.trim(),
        lectureDate: form.lectureDate || null,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        isPasswordProtected: form.isPasswordProtected,
        ...(form.accessPassword.trim() && {
          accessPassword: form.accessPassword.trim(),
        }),
        fileUrl,
        fileType,
        fileName,
        fileSizeBytes,
        cloudinaryPublicId,
      };

      if (editingFile) {
        await updateFile(editingFile._id, payload);
        setSuccess("File updated successfully!");
      } else {
        await createFile(payload);
        setSuccess("File uploaded successfully!");
      }

      setShowForm(false);
      setEditingFile(null);
      setForm(EMPTY_FORM);
      setSelectedFile(null);
      setUploadProgress(0);
      await loadFiles();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (file) => {
    setEditingFile(file);
    setForm({
      title: file.title || "",
      description: file.description || "",
      subject: file.subject || "",
      section: file.section || "",
      lectureNumber: file.lectureNumber || "",
      professorName: file.professorName || "",
      lectureDate: file.lectureDate ? file.lectureDate.slice(0, 10) : "",
      tags: (file.tags || []).join(", "),
      isPasswordProtected: file.isPasswordProtected ?? true,
      accessPassword: "",
    });
    setShowForm(true);
    setSelectedFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (file) => {
    if (!window.confirm(`Delete "${file.title}"? This cannot be undone.`)) return;
    try {
      await deleteFile(file._id);
      setSuccess("File deleted");
      await loadFiles();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggle = async (file) => {
    try {
      await toggleFileStatus(file._id);
      await loadFiles();
    } catch (err) {
      setError(err.message);
    }
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingFile(null);
    setForm(EMPTY_FORM);
    setSelectedFile(null);
    setError("");
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
      </div>
    );
  }

  if (!isCR) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🚫</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-500 mb-4">
            Only Class Representatives (CRs) can access this page.
          </p>
          <Link to="/admin" className="text-emerald-600 hover:underline">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30 py-6 sm:py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
              📁 Manage Study Files
            </h1>
            <p className="text-gray-500 mt-1 text-sm sm:text-base">
              Upload and manage private study materials for your class
            </p>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <Link
              to="/files"
              className="flex-1 sm:flex-none text-center px-3 sm:px-4 py-2 bg-white border border-emerald-200 text-emerald-700 rounded-xl hover:bg-emerald-50 transition text-sm font-medium"
            >
              View Library
            </Link>
            <button
              onClick={() => {
                setShowForm(true);
                setEditingFile(null);
                setForm(EMPTY_FORM);
                setSelectedFile(null);
              }}
              className="flex-1 sm:flex-none px-4 sm:px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition font-semibold shadow-lg shadow-emerald-500/20 text-sm"
            >
              + Upload File
            </button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl mb-4 text-sm">
            {success}
          </div>
        )}

        {/* Upload / Edit Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-xl p-5 sm:p-6 mb-6 sm:mb-8 border border-emerald-100">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-5">
              {editingFile ? "✏️ Edit File" : "📤 Upload New File"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {/* File Drop Zone */}
              {!editingFile && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Select File{" "}
                    <span className="text-red-500">*</span>
                    <span className="text-gray-400 font-normal ml-2 text-xs">
                      (PDF, PPT, PPTX, DOC, DOCX — max 10MB)
                    </span>
                  </label>
                  <div
                    className="border-2 border-dashed border-emerald-300 rounded-xl p-5 sm:p-6 text-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/50 transition"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {selectedFile ? (
                      <div className="flex items-center justify-center gap-3">
                        <span className="text-2xl">📄</span>
                        <div className="text-left">
                          <p className="font-semibold text-gray-800 text-sm">
                            {selectedFile.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-3xl sm:text-4xl mb-2">📂</div>
                        <p className="text-gray-600 font-medium text-sm">
                          Tap to select file
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
                          PDF, PPT, PPTX, DOC, DOCX
                        </p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.ppt,.pptx,.doc,.docx"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div
                          className="h-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {editingFile && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 sm:p-4 flex items-center gap-3">
                  <span className="text-2xl">📄</span>
                  <div>
                    <p className="font-medium text-gray-800 text-sm">
                      {editingFile.fileName}
                    </p>
                    <p className="text-xs text-emerald-600">
                      Editing metadata only — file stays the same
                    </p>
                  </div>
                </div>
              )}

              {/* Title & Subject */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none text-sm"
                    placeholder="OOP Lecture 5 - Inheritance"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                    className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none text-sm"
                    placeholder="Object Oriented Programming"
                    required
                  />
                </div>
              </div>

              {/* Section, Lecture #, Professor, Date */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                    Section
                  </label>
                  <input
                    type="text"
                    value={form.section}
                    onChange={(e) => setForm((f) => ({ ...f, section: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none text-sm"
                    placeholder="BSCS-3A"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                    Lecture #
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.lectureNumber}
                    onChange={(e) => setForm((f) => ({ ...f, lectureNumber: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none text-sm"
                    placeholder="5"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                    Professor
                  </label>
                  <input
                    type="text"
                    value={form.professorName}
                    onChange={(e) => setForm((f) => ({ ...f, professorName: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none text-sm"
                    placeholder="Dr. Ahmed"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={form.lectureDate}
                    onChange={(e) => setForm((f) => ({ ...f, lectureDate: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none text-sm"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none resize-none text-sm"
                  placeholder="What this file covers..."
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Tags{" "}
                  <span className="text-gray-400 font-normal">(comma-separated)</span>
                </label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                  className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none text-sm"
                  placeholder="oop, inheritance, java"
                />
              </div>

              {/* Password Protection */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isPasswordProtected}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, isPasswordProtected: e.target.checked }))
                    }
                    className="w-4 h-4 accent-emerald-500"
                  />
                  <div>
                    <span className="font-semibold text-gray-800 text-sm">
                      🔒 Password Protected
                    </span>
                    <p className="text-xs text-gray-500">
                      Students need a password to access this file
                    </p>
                  </div>
                </label>
                {form.isPasswordProtected && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Access Password{" "}
                      {!editingFile && <span className="text-red-500">*</span>}
                      {editingFile && (
                        <span className="text-gray-400 font-normal ml-1 text-xs">
                          (leave blank to keep current)
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={form.accessPassword}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, accessPassword: e.target.value }))
                      }
                      className="w-full px-3 sm:px-4 py-2.5 border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none bg-white text-sm"
                      placeholder="e.g. oop2026"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Share this password with your class. It will be stored
                      securely (encrypted).
                    </p>
                  </div>
                )}
              </div>

              {/* Form Buttons */}
              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition disabled:opacity-60 flex items-center justify-center gap-2 text-sm shadow-lg shadow-emerald-500/20"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {uploadProgress > 0 && uploadProgress < 100
                        ? `Uploading ${uploadProgress}%...`
                        : "Saving..."}
                    </>
                  ) : editingFile ? (
                    "💾 Save Changes"
                  ) : (
                    "📤 Upload File"
                  )}
                </button>
                <button
                  type="button"
                  onClick={cancelForm}
                  className="px-5 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Files Table / Cards */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-emerald-50">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800 text-sm sm:text-base">
              {isSuperAdmin ? "All Files" : "My Uploaded Files"} (
              {files.length})
            </h2>
          </div>

          {files.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="text-5xl mb-4">📭</div>
              <p className="text-gray-500 text-base sm:text-lg">
                No files uploaded yet
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 text-emerald-600 hover:underline font-medium text-sm"
              >
                Upload your first file →
              </button>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                        File
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                        Subject
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                        Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                        Access
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {files.map((file) => (
                      <tr
                        key={file._id}
                        className={`hover:bg-gray-50 ${!file.isActive ? "opacity-50" : ""}`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">
                              {file.fileType === "pdf" ? "📄" : "📊"}
                            </span>
                            <div>
                              <p className="font-semibold text-gray-800 text-sm">
                                {file.title}
                              </p>
                              <p className="text-xs text-gray-400">
                                {file.fileName}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-gray-700">
                            {file.subject}
                          </p>
                          {file.section && (
                            <p className="text-xs text-gray-400">{file.section}</p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs text-gray-500 space-y-0.5">
                            {file.lectureNumber && (
                              <p>Lecture #{file.lectureNumber}</p>
                            )}
                            {file.professorName && (
                              <p>👨‍🏫 {file.professorName}</p>
                            )}
                            {file.lectureDate && (
                              <p>
                                📅{" "}
                                {new Date(file.lectureDate).toLocaleDateString()}
                              </p>
                            )}
                            <p>👁️ {file.accessCount || 0} accesses</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              file.isPasswordProtected
                                ? "bg-teal-100 text-teal-700"
                                : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            {file.isPasswordProtected ? "🔒 Password" : "🌐 Public"}
                          </span>
                          {!file.isActive && (
                            <span className="ml-2 px-2 py-1 rounded-full text-xs bg-red-100 text-red-600">
                              Disabled
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEdit(file)}
                              className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-xs font-medium"
                            >
                              Edit
                            </button>
                            {isSuperAdmin && (
                              <button
                                onClick={() => handleToggle(file)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                                  file.isActive
                                    ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                                    : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                }`}
                              >
                                {file.isActive ? "Disable" : "Enable"}
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(file)}
                              className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-xs font-medium"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="sm:hidden divide-y divide-gray-100">
                {files.map((file) => (
                  <div
                    key={file._id}
                    className={`p-4 ${!file.isActive ? "opacity-50" : ""}`}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <span className="text-2xl">
                        {file.fileType === "pdf" ? "📄" : "📊"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 text-sm line-clamp-2">
                          {file.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {file.subject}
                          {file.section && ` · ${file.section}`}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                          file.isPasswordProtected
                            ? "bg-teal-100 text-teal-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {file.isPasswordProtected ? "🔒" : "🌐"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-3 flex-wrap">
                      {file.lectureNumber && <span>Lecture #{file.lectureNumber}</span>}
                      {file.professorName && <span>· 👨‍🏫 {file.professorName}</span>}
                      <span>· 👁️ {file.accessCount || 0}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(file)}
                        className="flex-1 py-2 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium"
                      >
                        Edit
                      </button>
                      {isSuperAdmin && (
                        <button
                          onClick={() => handleToggle(file)}
                          className={`flex-1 py-2 rounded-lg text-xs font-medium ${
                            file.isActive
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {file.isActive ? "Disable" : "Enable"}
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(file)}
                        className="flex-1 py-2 bg-red-100 text-red-700 rounded-lg text-xs font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageFiles;
