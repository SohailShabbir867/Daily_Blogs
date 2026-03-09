// Super admin page for managing users, roles, and permissions
import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

const UserManagement = () => {
  const { user, isSuperAdmin, loading: authLoading } = useAuth();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const navigate = useNavigate();

  // Check access on mount
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    try {
      setError("");
      const data = await api.get("/admin/manage/users");

      setUsers(data.data.users);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const data = await api.get("/admin/stats");
      setStats(data.data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user && isSuperAdmin) {
      const loadData = async () => {
        setIsLoading(true);
        await Promise.all([fetchUsers(), fetchStats()]);
        setIsLoading(false);
      };
      loadData();
    } else if (!authLoading && user && !isSuperAdmin) {
      setIsLoading(false);
    }
  }, [fetchUsers, fetchStats, authLoading, user, isSuperAdmin]);

  // Handle user actions
  const handleAction = async (userId, action, userName) => {
    const confirmMessages = {
      delete: `Are you sure you want to delete ${userName}? This action cannot be undone.`,
      promote: `Promote ${userName} to admin? They will be able to manage blogs.`,
      demote: `Demote ${userName} to regular user? They will lose admin privileges.`,
      toggleStatus: `Toggle active status for ${userName}?`,
      toggleChat: `Toggle chat support for ${userName}?`,
    };

    if (!window.confirm(confirmMessages[action])) return;

    setActionLoading(`${userId}-${action}`);

    try {
      if (action === "delete") {
        await api.delete(`/admin/manage/users/${userId}`);
      } else if (action === "promote") {
        await api.patch(`/admin/manage/users/${userId}/promote`);
      } else if (action === "demote") {
        await api.patch(`/admin/manage/users/${userId}/demote`);
      } else if (action === "toggleStatus") {
        await api.patch(`/admin/manage/users/${userId}/toggle-status`);
      } else if (action === "toggleChat") {
        const targetUser = users.find((u) => u._id === userId);
        if (!targetUser) throw new Error("User not found");
        await api.patch(`/chat/admin-status/${userId}`, {
          enabled: !targetUser.isChatSupport,
        });
      }

      // Refresh users list
      await fetchUsers();
      await fetchStats();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // Filter users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole =
      filterRole === "all" ||
      (filterRole === "admin" && u.role === "admin") ||
      (filterRole === "user" && u.role === "user") ||
      (filterRole === "superAdmin" && u.isSuperAdmin);
    return matchesSearch && matchesRole;
  });

  // Show loading during auth check
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  // Access denied for non-super admins
  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h1>
          <p className="text-gray-500 mb-6">
            You don't have permission to access this page. Only Super Admins can
            manage users.
          </p>
          <Link
            to="/admin"
            className="text-emerald-600 font-medium hover:underline"
          >
            ← Back to Admin Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            User Management
          </h1>
          <p className="text-gray-600">
            Manage registered users, roles, and permissions
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow p-6">
              <p className="text-sm text-gray-500 mb-1">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.totalUsers || users.length}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow p-6">
              <p className="text-sm text-gray-500 mb-1">Admins</p>
              <p className="text-3xl font-bold text-emerald-600">
                {users.filter((u) => u.role === "admin").length}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow p-6">
              <p className="text-sm text-gray-500 mb-1">Regular Users</p>
              <p className="text-3xl font-bold text-green-600">
                {users.filter((u) => u.role === "user").length}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow p-6">
              <p className="text-sm text-gray-500 mb-1">Active Users</p>
              <p className="text-3xl font-bold text-teal-600">
                {users.filter((u) => u.isActive !== false).length}
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="all">All Roles</option>
              <option value="superAdmin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-linear-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">
                            {user.name}
                          </p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.isSuperAdmin ? (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Super Admin
                        </span>
                      ) : user.role === "admin" ? (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Admin
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          User
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.isActive !== false
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.isActive !== false ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      {!user.isSuperAdmin && (
                        <div className="flex justify-end gap-2">
                          {user.role === "user" ? (
                            <button
                              onClick={() =>
                                handleAction(user._id, "promote", user.name)
                              }
                              disabled={actionLoading === `${user._id}-promote`}
                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition disabled:opacity-50"
                            >
                              {actionLoading === `${user._id}-promote`
                                ? "..."
                                : "Promote"}
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                handleAction(user._id, "demote", user.name)
                              }
                              disabled={actionLoading === `${user._id}-demote`}
                              className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition disabled:opacity-50"
                            >
                              {actionLoading === `${user._id}-demote`
                                ? "..."
                                : "Demote"}
                            </button>
                          )}
                          {user.role === "admin" && (
                            <button
                              onClick={() =>
                                handleAction(user._id, "toggleChat", user.name)
                              }
                              disabled={
                                actionLoading === `${user._id}-toggleChat`
                              }
                              className={`px-3 py-1 rounded-lg transition disabled:opacity-50 ${
                                user.isChatSupport
                                  ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                              }`}
                            >
                              {actionLoading === `${user._id}-toggleChat`
                                ? "..."
                                : user.isChatSupport
                                  ? "Disable Chat"
                                  : "Enable Chat"}
                            </button>
                          )}
                          <button
                            onClick={() =>
                              handleAction(user._id, "toggleStatus", user.name)
                            }
                            disabled={
                              actionLoading === `${user._id}-toggleStatus`
                            }
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
                          >
                            {actionLoading === `${user._id}-toggleStatus`
                              ? "..."
                              : user.isActive !== false
                                ? "Deactivate"
                                : "Activate"}
                          </button>
                          <button
                            onClick={() =>
                              handleAction(user._id, "delete", user.name)
                            }
                            disabled={actionLoading === `${user._id}-delete`}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition disabled:opacity-50"
                          >
                            {actionLoading === `${user._id}-delete`
                              ? "..."
                              : "Delete"}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No users found matching your criteria
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
