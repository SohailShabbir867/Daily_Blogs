// FilesLibrary.jsx — Public page to browse and access private study files
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getFiles, getSubjects, accessFile } from "../services/fileService";

const FileTypeIcon = ({ type }) => {
  const icons = { pdf: "📄", ppt: "📊", pptx: "📊", doc: "📝", docx: "📝" };
  return <span className="text-2xl">{icons[type] || "📎"}</span>;
};

const FilesLibrary = () => {
  const { user, isCR, hasFileAccess, loading: authLoading } = useAuth();

  const [files, setFiles] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeSubject, setActiveSubject] = useState("All");
  const [accessModal, setAccessModal] = useState(null);
  const [password, setPassword] = useState("");
  const [accessLoading, setAccessLoading] = useState(false);
  const [accessError, setAccessError] = useState("");
  const [grantedFile, setGrantedFile] = useState(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [filesRes, subjectsRes] = await Promise.all([
        getFiles({ limit: 100 }),
        getSubjects(),
      ]);
      setFiles(filesRes.data?.files || []);
      setSubjects(["All", ...(subjectsRes.data?.subjects || [])]);
    } catch (err) {
      console.error("Failed to load files:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Only fetch data if the user actually has access
  useEffect(() => {
    if (hasFileAccess) loadData();
  }, [loadData, hasFileAccess]);

  // Show spinner while checking auth — prevents false-positive private page flash
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500" />
      </div>
    );
  }

  if (!hasFileAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30 flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-12 max-w-md w-full text-center">
          {/* Lock icon */}
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <span className="text-4xl">🔒</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            This Page is Private
          </h1>
          <p className="text-gray-500 text-sm sm:text-base leading-relaxed mb-2">
            The <strong className="text-gray-700">Study Files Library</strong> is not publicly available.
          </p>
          <p className="text-gray-400 text-sm mb-8 leading-relaxed">
            Access must be granted by your{" "}
            <span className="text-emerald-600 font-semibold">Class Representative (CR)</span>
            {" "}or a{" "}
            <span className="text-emerald-600 font-semibold">Super Admin</span>.
          </p>

          {/* Divider */}
          <div className="border-t border-gray-100 mb-6" />

          {!user ? (
            <div className="space-y-3">
              <Link
                to="/login"
                className="block w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition shadow-lg shadow-emerald-500/20"
              >
                Login to Check Your Access
              </Link>
              <Link
                to="/"
                className="block w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-semibold hover:bg-gray-200 transition"
              >
                ← Back to Home
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 text-left">
                <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">Logged in as</p>
                  <p className="font-semibold text-gray-800 truncate">{user.name}</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 px-2">
                Contact your CR or super admin and ask them to grant you access from the User Management panel.
              </p>
              <Link
                to="/"
                className="block w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition shadow-lg shadow-emerald-500/20"
              >
                ← Go to Home
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  const filtered = files.filter((f) => {
    const matchSubject = activeSubject === "All" || f.subject === activeSubject;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      f.title?.toLowerCase().includes(q) ||
      f.subject?.toLowerCase().includes(q) ||
      f.professorName?.toLowerCase().includes(q) ||
      (f.tags || []).some((t) => t.toLowerCase().includes(q));
    return matchSubject && matchSearch;
  });

  const grouped = filtered.reduce((acc, file) => {
    const key = file.subject || "Other";
    if (!acc[key]) acc[key] = [];
    acc[key].push(file);
    return acc;
  }, {});

  const handleAccessClick = (file) => {
    if (!file.isPasswordProtected) {
      handleAccessSubmit(file._id, "");
      return;
    }
    setAccessModal({ file });
    setPassword("");
    setAccessError("");
    setGrantedFile(null);
  };

  const handleAccessSubmit = async (fileId, pwd) => {
    setAccessLoading(true);
    setAccessError("");
    try {
      const res = await accessFile(fileId, pwd);
      setGrantedFile({ fileUrl: res.data.fileUrl, fileName: res.data.fileName });
      setAccessModal(null);
    } catch (err) {
      setAccessError(err.message || "Incorrect password");
    } finally {
      setAccessLoading(false);
    }
  };

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-10 sm:py-14 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="text-4xl sm:text-5xl mb-3">📚</div>
          <h1 className="text-3xl sm:text-5xl font-bold mb-3">Study Files Library</h1>
          <p className="text-emerald-100 text-base sm:text-lg max-w-xl mx-auto">
            Access lecture notes, slides, and study materials shared by your
            class representatives.
          </p>
          {isCR && (
            <a
              href="/admin/files"
              className="inline-block mt-5 px-6 py-3 bg-white text-emerald-600 rounded-xl font-semibold hover:bg-emerald-50 transition shadow-lg text-sm sm:text-base"
            >
              📤 Manage My Files
            </a>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 sm:py-10">
        {/* Search + Subject Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-4 sm:p-5 mb-6 sm:mb-8">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search by title, subject, professor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none text-sm"
            />
          </div>

          {subjects.length > 1 && (
            <div className="flex gap-2 mt-4 flex-wrap">
              {subjects.map((s) => (
                <button
                  key={s}
                  onClick={() => setActiveSubject(s)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition ${
                    activeSubject === s
                      ? "bg-emerald-500 text-white shadow-md"
                      : "bg-gray-100 text-gray-600 hover:bg-emerald-100 hover:text-emerald-700"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Loading */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-gray-500 text-lg">No files found</p>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="mt-3 text-emerald-600 hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          Object.entries(grouped).map(([subject, subjectFiles]) => (
            <div key={subject} className="mb-8 sm:mb-10">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                  {subject}
                </h2>
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-full">
                  {subjectFiles.length} file{subjectFiles.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {subjectFiles.map((file) => (
                  <div
                    key={file._id}
                    className="bg-white rounded-2xl shadow-sm hover:shadow-md transition border border-gray-100 p-4 sm:p-5 flex flex-col gap-3"
                  >
                    {/* File header */}
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 sm:w-12 sm:h-12 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <FileTypeIcon type={file.fileType} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-800 leading-snug line-clamp-2 text-sm sm:text-base">
                          {file.title}
                        </h3>
                        {file.description && (
                          <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-2">
                            {file.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Metadata badges */}
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {file.lectureNumber && (
                        <span className="px-2 sm:px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
                          Lecture #{file.lectureNumber}
                        </span>
                      )}
                      {file.section && (
                        <span className="px-2 sm:px-2.5 py-1 bg-purple-50 text-purple-600 rounded-full text-xs font-medium">
                          {file.section}
                        </span>
                      )}
                      {file.professorName && (
                        <span className="px-2 sm:px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">
                          👨‍🏫 {file.professorName}
                        </span>
                      )}
                      {file.lectureDate && (
                        <span className="px-2 sm:px-2.5 py-1 bg-gray-100 text-gray-500 rounded-full text-xs">
                          📅 {formatDate(file.lectureDate)}
                        </span>
                      )}
                      <span
                        className={`px-2 sm:px-2.5 py-1 rounded-full text-xs font-medium ${
                          file.isPasswordProtected
                            ? "bg-teal-50 text-teal-700"
                            : "bg-green-50 text-green-700"
                        }`}
                      >
                        {file.isPasswordProtected ? "🔒 Password" : "🌐 Open"}
                      </span>
                    </div>

                    {/* Tags */}
                    {file.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {file.tags.map((t) => (
                          <span
                            key={t}
                            className="px-2 py-0.5 text-xs bg-gray-100 text-gray-500 rounded-full"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Uploader + Access button */}
                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100 gap-2">
                      <span className="text-xs text-gray-400 truncate">
                        {file.uploadedBy?.name && `By ${file.uploadedBy.name}`}
                      </span>
                      <button
                        onClick={() => handleAccessClick(file)}
                        className="px-3 sm:px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-xs sm:text-sm font-semibold hover:from-emerald-600 hover:to-teal-600 transition shadow-md shadow-emerald-500/20 active:scale-95 whitespace-nowrap"
                      >
                        {file.isPasswordProtected ? "🔑 Enter Password" : "📥 Access File"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Password Modal */}
      {accessModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md p-6">
            <div className="text-center mb-5">
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-3xl">🔒</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                {accessModal.file.title}
              </h3>
              <p className="text-gray-500 text-sm mt-1">
                Enter the password to access this file
              </p>
            </div>

            {accessError && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-4">
                ❌ {accessError}
              </div>
            )}

            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" &&
                handleAccessSubmit(accessModal.file._id, password)
              }
              placeholder="Enter file password..."
              autoFocus
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none mb-4 text-sm"
            />

            <div className="flex gap-3">
              <button
                onClick={() => handleAccessSubmit(accessModal.file._id, password)}
                disabled={accessLoading || !password.trim()}
                className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
              >
                {accessLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "🔓 Access File"
                )}
              </button>
              <button
                onClick={() => setAccessModal(null)}
                className="px-4 sm:px-5 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Access Success Modal */}
      {grantedFile && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md p-6 text-center">
            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✅</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              Access Granted!
            </h3>
            <p className="text-gray-500 text-sm mb-5 truncate px-4">
              {grantedFile.fileName}
            </p>
            <div className="flex gap-3">
              <a
                href={grantedFile.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition text-sm"
              >
                📂 Open File
              </a>
              <a
                href={grantedFile.fileUrl}
                download={grantedFile.fileName}
                className="flex-1 py-3 bg-teal-500 text-white rounded-xl font-semibold hover:bg-teal-600 transition text-sm"
              >
                📥 Download
              </a>
            </div>
            <button
              onClick={() => setGrantedFile(null)}
              className="mt-3 w-full py-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilesLibrary;
