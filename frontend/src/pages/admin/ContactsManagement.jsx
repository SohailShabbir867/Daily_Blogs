// Super admin page for managing contact form submissions
import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

const ContactsManagement = () => {
  const { user, isSuperAdmin, loading: authLoading } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const navigate = useNavigate();

  // Check access on mount
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  // Fetch contacts
  const fetchContacts = useCallback(async () => {
    try {
      setError("");
      const data = await api.get("/contact");

      setContacts(data.data.contacts);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const data = await api.get("/contact/stats");
      setStats(data.data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user && isSuperAdmin) {
      const loadData = async () => {
        setIsLoading(true);
        await Promise.all([fetchContacts(), fetchStats()]);
        setIsLoading(false);
      };
      loadData();
    } else if (!authLoading && user && !isSuperAdmin) {
      setIsLoading(false);
    }
  }, [fetchContacts, fetchStats, authLoading, user, isSuperAdmin]);

  // Update contact status
  const updateStatus = async (contactId, status) => {
    setActionLoading(`${contactId}-status`);

    try {
      await api.patch(`/contact/${contactId}`, { status });

      await fetchContacts();
      await fetchStats();

      // Update selectedContact to reflect the new status
      if (selectedContact?._id === contactId) {
        setSelectedContact((prev) => (prev ? { ...prev, status } : null));
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // Delete contact
  const deleteContact = async (contactId) => {
    if (!window.confirm("Are you sure you want to delete this contact?"))
      return;

    setActionLoading(`${contactId}-delete`);

    try {
      await api.delete(`/contact/${contactId}`);

      await fetchContacts();
      await fetchStats();
      if (selectedContact?._id === contactId) {
        setSelectedContact(null);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // Filter contacts
  const filteredContacts = contacts.filter((contact) => {
    return filterStatus === "all" || contact.status === filterStatus;
  });

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      new: "bg-blue-100 text-blue-800",
      read: "bg-yellow-100 text-yellow-800",
      replied: "bg-green-100 text-green-800",
      archived: "bg-gray-100 text-gray-800",
    };
    return colors[status] || colors.new;
  };

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
            manage contacts.
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
            Contact Management
          </h1>
          <p className="text-gray-600">
            View and manage contact form submissions
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow p-6">
              <p className="text-sm text-gray-500 mb-1">Total Contacts</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.total || 0}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow p-6">
              <p className="text-sm text-gray-500 mb-1">New</p>
              <p className="text-3xl font-bold text-emerald-600">
                {stats.new || 0}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow p-6">
              <p className="text-sm text-gray-500 mb-1">Read</p>
              <p className="text-3xl font-bold text-yellow-600">
                {stats.read || 0}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow p-6">
              <p className="text-sm text-gray-500 mb-1">Replied</p>
              <p className="text-3xl font-bold text-green-600">
                {stats.replied || 0}
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contacts List */}
          <div className="lg:col-span-2">
            {/* Filter */}
            <div className="bg-white rounded-xl shadow p-4 mb-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="read">Read</option>
                <option value="replied">Replied</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Contacts Table */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <div className="divide-y divide-gray-200">
                {filteredContacts.map((contact) => (
                  <div
                    key={contact._id}
                    onClick={() => {
                      setSelectedContact(contact);
                      if (contact.status === "new") {
                        updateStatus(contact._id, "read");
                      }
                    }}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition ${
                      selectedContact?._id === contact._id
                        ? "bg-emerald-50"
                        : ""
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {contact.name}
                        </h3>
                        <p className="text-sm text-gray-500">{contact.email}</p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          contact.status,
                        )}`}
                      >
                        {contact.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 font-medium">
                      {contact.subject}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {contact.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(contact.createdAt).toLocaleDateString()} at{" "}
                      {new Date(contact.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                ))}
              </div>

              {filteredContacts.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No contacts found
                </div>
              )}
            </div>
          </div>

          {/* Contact Detail */}
          <div className="lg:col-span-1">
            {selectedContact ? (
              <div className="bg-white rounded-xl shadow p-6 sticky top-8">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-lg font-bold text-gray-900">
                    Contact Details
                  </h2>
                  <button
                    onClick={() => setSelectedContact(null)}
                    className="text-gray-400 hover:text-gray-600"
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
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Name
                    </p>
                    <p className="text-gray-900 font-medium">
                      {selectedContact.name}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Email
                    </p>
                    <a
                      href={`mailto:${selectedContact.email}`}
                      className="text-emerald-600 hover:underline"
                    >
                      {selectedContact.email}
                    </a>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Subject
                    </p>
                    <p className="text-gray-900">{selectedContact.subject}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Message
                    </p>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {selectedContact.message}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Received
                    </p>
                    <p className="text-gray-700">
                      {new Date(selectedContact.createdAt).toLocaleString()}
                    </p>
                  </div>

                  {/* Status Update */}
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                      Update Status
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {["new", "read", "replied", "archived"].map((status) => (
                        <button
                          key={status}
                          onClick={() =>
                            updateStatus(selectedContact._id, status)
                          }
                          disabled={
                            selectedContact.status === status ||
                            actionLoading === `${selectedContact._id}-status`
                          }
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                            selectedContact.status === status
                              ? getStatusColor(status)
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          } disabled:opacity-50`}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t flex gap-2">
                    <a
                      href={`mailto:${selectedContact.email}?subject=Re: ${selectedContact.subject}`}
                      className="flex-1 bg-linear-to-r from-emerald-500 to-teal-500 text-white py-2 rounded-lg font-medium hover:from-emerald-600 hover:to-teal-600 transition text-center"
                    >
                      Reply via Email
                    </a>
                    <button
                      onClick={() => deleteContact(selectedContact._id)}
                      disabled={
                        actionLoading === `${selectedContact._id}-delete`
                      }
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition disabled:opacity-50"
                    >
                      {actionLoading === `${selectedContact._id}-delete`
                        ? "..."
                        : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow p-6 text-center text-gray-500">
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <p>Select a contact to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactsManagement;
