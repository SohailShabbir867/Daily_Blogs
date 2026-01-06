import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  getRecipientCount,
  sendNotification,
  sendMaintenanceNotification,
  sendErrorAlert,
  getAllUsers,
} from "../../services/adminService";

const SendNotifications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(false);
  const [recipientCount, setRecipientCount] = useState(0);
  const [users, setUsers] = useState([]);
  const [result, setResult] = useState(null);

  // General notification form
  const [generalForm, setGeneralForm] = useState({
    subject: "",
    message: "",
    recipientType: "all",
    specificUserId: "",
  });

  // Maintenance notification form
  const [maintenanceForm, setMaintenanceForm] = useState({
    startTime: "",
    endTime: "",
    reason: "",
    affectedServices: "",
  });

  // Error alert form
  const [errorForm, setErrorForm] = useState({
    errorType: "",
    description: "",
    severity: "medium",
    affectedFeatures: "",
  });

  // Check if user is super admin
  useEffect(() => {
    if (!user?.isSuperAdmin) {
      navigate("/admin");
    }
  }, [user, navigate]);

  // Fetch recipient count when type changes
  useEffect(() => {
    const fetchCount = async () => {
      if (generalForm.recipientType === "single") {
        setRecipientCount(1);
        return;
      }
      try {
        const response = await getRecipientCount(generalForm.recipientType);
        if (response.success) {
          setRecipientCount(response.data.count);
        }
      } catch (err) {
        console.error("Error fetching recipient count:", err);
      }
    };
    fetchCount();
  }, [generalForm.recipientType]);

  // Fetch users for single user selection
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getAllUsers({ limit: 100 });
        if (response.success) {
          setUsers(response.data.users || []);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    fetchUsers();
  }, []);

  const handleSendGeneral = async (e) => {
    e.preventDefault();
    if (!generalForm.subject.trim() || !generalForm.message.trim()) {
      alert("Subject and message are required");
      return;
    }

    if (generalForm.recipientType === "single" && !generalForm.specificUserId) {
      alert("Please select a user");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await sendNotification(generalForm);
      if (response.success) {
        setResult({
          type: "success",
          message: `Notification sent to ${response.data.sent} recipient(s)`,
          details: response.data,
        });
        setGeneralForm({ ...generalForm, subject: "", message: "" });
      }
    } catch (err) {
      setResult({
        type: "error",
        message: err.message || "Failed to send notification",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendMaintenance = async (e) => {
    e.preventDefault();
    if (!maintenanceForm.startTime || !maintenanceForm.reason.trim()) {
      alert("Start time and reason are required");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await sendMaintenanceNotification(maintenanceForm);
      if (response.success) {
        setResult({
          type: "success",
          message: `Maintenance notification sent to ${response.data.sent} users`,
          details: response.data,
        });
        setMaintenanceForm({
          startTime: "",
          endTime: "",
          reason: "",
          affectedServices: "",
        });
      }
    } catch (err) {
      setResult({
        type: "error",
        message: err.message || "Failed to send maintenance notification",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendError = async (e) => {
    e.preventDefault();
    if (!errorForm.errorType.trim() || !errorForm.description.trim()) {
      alert("Error type and description are required");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await sendErrorAlert(errorForm);
      if (response.success) {
        setResult({
          type: "success",
          message: `Error alert sent to ${response.data.sent} admin(s)`,
          details: response.data,
        });
        setErrorForm({
          errorType: "",
          description: "",
          severity: "medium",
          affectedFeatures: "",
        });
      }
    } catch (err) {
      setResult({
        type: "error",
        message: err.message || "Failed to send error alert",
      });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "general", label: "General Notification", icon: "📢" },
    { id: "maintenance", label: "Maintenance Notice", icon: "⚠️" },
    { id: "error", label: "Error Alert", icon: "🚨" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/admin")}
            className="text-emerald-600 hover:text-emerald-800 mb-4 flex items-center gap-2"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Send Notifications
          </h1>
          <p className="text-gray-600 mt-2">
            Send email notifications to users, admins, or everyone
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setResult(null);
              }}
              className={`px-4 py-3 font-medium transition ${
                activeTab === tab.id
                  ? "text-emerald-600 border-b-2 border-emerald-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Result Message */}
        {result && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              result.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            <p className="font-medium">{result.message}</p>
            {result.details?.failed > 0 && (
              <p className="text-sm mt-1">
                Failed: {result.details.failed} recipient(s)
              </p>
            )}
          </div>
        )}

        {/* General Notification Form */}
        {activeTab === "general" && (
          <form
            onSubmit={handleSendGeneral}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <h2 className="text-xl font-semibold mb-6">
              📢 Send General Notification
            </h2>

            {/* Recipient Type */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Send To
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { value: "all", label: "All Users", desc: "Users + Admins" },
                  {
                    value: "users",
                    label: "Users Only",
                    desc: "Regular users",
                  },
                  { value: "admins", label: "Admins Only", desc: "Admin team" },
                  { value: "single", label: "Single User", desc: "One person" },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`p-4 border rounded-lg cursor-pointer transition ${
                      generalForm.recipientType === option.value
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="recipientType"
                      value={option.value}
                      checked={generalForm.recipientType === option.value}
                      onChange={(e) =>
                        setGeneralForm({
                          ...generalForm,
                          recipientType: e.target.value,
                        })
                      }
                      className="sr-only"
                    />
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-gray-500">{option.desc}</div>
                  </label>
                ))}
              </div>
              {generalForm.recipientType !== "single" && (
                <p className="text-sm text-gray-500 mt-2">
                  📧 {recipientCount} recipient(s) will receive this
                  notification
                </p>
              )}
            </div>

            {/* Single User Selection */}
            {generalForm.recipientType === "single" && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select User
                </label>
                <select
                  value={generalForm.specificUserId}
                  onChange={(e) =>
                    setGeneralForm({
                      ...generalForm,
                      specificUserId: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">Choose a user...</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.email}) - {u.role}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Subject */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject *
              </label>
              <input
                type="text"
                value={generalForm.subject}
                onChange={(e) =>
                  setGeneralForm({ ...generalForm, subject: e.target.value })
                }
                placeholder="Enter notification subject..."
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                required
              />
            </div>

            {/* Message */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message *
              </label>
              <textarea
                value={generalForm.message}
                onChange={(e) =>
                  setGeneralForm({ ...generalForm, message: e.target.value })
                }
                placeholder="Write your notification message..."
                rows={6}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-linear-to-r from-emerald-500 to-teal-500 text-white font-medium rounded-lg hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading
                ? "Sending..."
                : `Send to ${recipientCount} Recipient(s)`}
            </button>
          </form>
        )}

        {/* Maintenance Notification Form */}
        {activeTab === "maintenance" && (
          <form
            onSubmit={handleSendMaintenance}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <h2 className="text-xl font-semibold mb-6">
              ⚠️ Send Maintenance Notice
            </h2>
            <p className="text-gray-500 mb-6">
              This will notify all active users about scheduled maintenance.
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time *
                </label>
                <input
                  type="datetime-local"
                  value={maintenanceForm.startTime}
                  onChange={(e) =>
                    setMaintenanceForm({
                      ...maintenanceForm,
                      startTime: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={maintenanceForm.endTime}
                  onChange={(e) =>
                    setMaintenanceForm({
                      ...maintenanceForm,
                      endTime: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Maintenance *
              </label>
              <textarea
                value={maintenanceForm.reason}
                onChange={(e) =>
                  setMaintenanceForm({
                    ...maintenanceForm,
                    reason: e.target.value,
                  })
                }
                placeholder="Explain the reason for maintenance..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Affected Services (Optional)
              </label>
              <input
                type="text"
                value={maintenanceForm.affectedServices}
                onChange={(e) =>
                  setMaintenanceForm({
                    ...maintenanceForm,
                    affectedServices: e.target.value,
                  })
                }
                placeholder="e.g., Blog posting, Comments, User registration"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-yellow-500 text-white font-medium rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? "Sending..." : "Send Maintenance Notice to All Users"}
            </button>
          </form>
        )}

        {/* Error Alert Form */}
        {activeTab === "error" && (
          <form
            onSubmit={handleSendError}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <h2 className="text-xl font-semibold mb-6">
              🚨 Send Error Alert to Admins
            </h2>
            <p className="text-gray-500 mb-6">
              This will only notify admin users about system issues.
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Error Type *
                </label>
                <input
                  type="text"
                  value={errorForm.errorType}
                  onChange={(e) =>
                    setErrorForm({ ...errorForm, errorType: e.target.value })
                  }
                  placeholder="e.g., Database Error, API Failure"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Severity
                </label>
                <select
                  value={errorForm.severity}
                  onChange={(e) =>
                    setErrorForm({ ...errorForm, severity: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={errorForm.description}
                onChange={(e) =>
                  setErrorForm({ ...errorForm, description: e.target.value })
                }
                placeholder="Describe the error or issue in detail..."
                rows={5}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Affected Features (Optional)
              </label>
              <input
                type="text"
                value={errorForm.affectedFeatures}
                onChange={(e) =>
                  setErrorForm({
                    ...errorForm,
                    affectedFeatures: e.target.value,
                  })
                }
                placeholder="e.g., Login, Blog creation, Comments"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? "Sending..." : "Send Error Alert to Admins"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default SendNotifications;
