// SupportAdminList - Filtered list (excludes current user)
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

const SupportAdminList = ({ onSelectAdmin, onClose, onBack }) => {
  const { user } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isAdminOrSuper = user?.role === "admin" || user?.isSuperAdmin;

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/chat/support-admins");

      if (response.success) {
        // Filter out current user - prevent chatting with yourself
        const filteredAdmins = response.data.filter(
          (admin) => admin._id !== user?._id,
        );
        setAdmins(filteredAdmins);
      } else {
        setError("Could not load support team");
      }
    } catch (error) {
      console.error("[CHAT] Error fetching support admins:", error);
      setError(error.response?.data?.message || "Failed to load support team");
    } finally {
      setLoading(false);
    }
  };

  // Get role badge
  const getRoleBadge = (admin) => {
    if (admin.isSuperAdmin) {
      return (
        <span className="text-[9px] px-1.5 py-0.5 bg-purple-500 text-white rounded-full font-bold">
          👑 SUPER
        </span>
      );
    } else if (admin.role === "admin") {
      return (
        <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500 text-white rounded-full font-bold">
          🛡️ ADMIN
        </span>
      );
    }
    return (
      <span className="text-[9px] px-1.5 py-0.5 bg-blue-500 text-white rounded-full font-bold">
        👤 USER
      </span>
    );
  };

  return (
    <div className="fixed bottom-16 sm:bottom-20 right-2 sm:right-4 w-[95vw] sm:w-80 bg-white rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200 z-50 animate-in slide-in-from-bottom-5">
      {/* Header */}
      <div className="p-3 sm:p-4 bg-linear-to-r from-emerald-500 to-emerald-600 text-white flex justify-between items-center">
        <div className="flex items-center gap-2">
          {/* Back button if onBack is provided */}
          {onBack && (
            <button
              onClick={onBack}
              className="p-1 hover:bg-emerald-600 rounded-lg transition-colors mr-1"
              title="Back to messages"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h3 className="font-semibold text-sm sm:text-base">
            {isAdminOrSuper ? "New Chat" : "Chat with Admin"}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-emerald-600 rounded-lg transition-colors"
          aria-label="Close"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Admin List */}
      <div className="max-h-[50vh] sm:max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-8 flex flex-col items-center justify-center text-gray-500">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500 mb-3" />
            <p className="text-sm">Loading support team...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <svg
              className="w-12 h-12 mx-auto text-red-500 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-red-600 text-sm mb-3">{error}</p>
            <button
              onClick={fetchAdmins}
              className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
            >
              Try Again
            </button>
          </div>
        ) : admins.length === 0 ? (
          <div className="p-8 text-center">
            <svg
              className="w-16 h-16 mx-auto text-gray-300 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
              />
            </svg>
            <p className="text-gray-500 text-sm">No other admins available.</p>
            <p className="text-gray-400 text-xs mt-2">
              {user?.isSuperAdmin || user?.role === "admin"
                ? "Add more admins to enable team chat."
                : "Please check back later."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {admins.map((admin) => (
              <button
                key={admin._id}
                onClick={() => onSelectAdmin(admin)}
                className="w-full p-3 sm:p-4 flex items-center gap-3 hover:bg-emerald-50 active:bg-emerald-100 transition-colors text-left group"
              >
                <div className="relative shrink-0">
                  <img
                    src={
                      admin.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(admin.name)}&background=${admin.isSuperAdmin ? "9333ea" : "10b981"}&color=fff`
                    }
                    alt={admin.name}
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-full group-hover:ring-2 ring-emerald-500 transition-all object-cover"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(admin.name)}&background=10b981&color=fff`;
                    }}
                  />
                  {admin.isActive && (
                    <span
                      className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"
                      title="Online"
                    />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="font-medium text-gray-800 truncate group-hover:text-emerald-700 transition-colors">
                      {admin.name}
                    </h4>
                    {getRoleBadge(admin)}
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {admin.bio ||
                      (admin.isSuperAdmin ? "Senior Support" : "Here to help!")}
                  </p>
                </div>

                <svg
                  className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {!loading && !error && admins.length > 0 && (
        <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500">
            💡 Chats auto-delete after 5 days
          </p>
        </div>
      )}
    </div>
  );
};

export default SupportAdminList;
