// NewsletterSubscription - Allows authenticated users to subscribe to blog notifications
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const NewsletterSubscription = ({ variant = "default" }) => {
  const { user } = useAuth();
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setStatus("idle");
    setMessage("");
    setAcceptedTerms(false);
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setStatus("error");
      setMessage("Please login to subscribe");
      return;
    }

    if (!acceptedTerms) {
      setStatus("error");
      setMessage("Please accept the Terms of Service to subscribe");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const response = await api.post("/subscribe", {
        email: user.email,
        name: user.name,
        acceptedTerms: true,
      });

      setStatus("success");
      setMessage(response.message || "Successfully subscribed!");
    } catch (err) {
      setStatus("error");
      setMessage(
        err.response?.data?.message ||
          err.message ||
          "Failed to subscribe. Please try again."
      );
    }
  };

  // Compact variant for footer
  if (variant === "compact") {
    return (
      <div className="w-full">
        <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
          Newsletter
        </h4>
        <p className="text-gray-600 text-sm mb-4">
          Get notified when we publish new articles.
        </p>

        {!user ? (
          <div className="text-sm text-gray-600">
            <Link
              to="/login"
              className="text-emerald-600 hover:underline font-medium"
            >
              Login
            </Link>{" "}
            to subscribe for notifications.
          </div>
        ) : status === "success" ? (
          <div className="flex items-center gap-2 text-green-600 text-sm">
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
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span>{message}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-700">
              {user.email}
            </div>

            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                disabled={status === "loading"}
              />
              <span className="text-xs text-gray-600">
                I accept the{" "}
                <Link to="/terms" className="text-emerald-600 hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  to="/privacy"
                  className="text-emerald-600 hover:underline"
                >
                  Privacy Policy
                </Link>
              </span>
            </label>

            <button
              type="submit"
              disabled={status === "loading" || !acceptedTerms}
              className="w-full px-4 py-2 bg-linear-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-medium text-sm hover:from-emerald-600 hover:to-teal-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === "loading" ? "Subscribing..." : "Subscribe"}
            </button>
            {status === "error" && (
              <p className="text-red-500 text-xs">{message}</p>
            )}
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="bg-linear-to-br from-emerald-800 via-teal-700 to-cyan-800 rounded-2xl p-6 sm:p-8 md:p-12 text-white relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-400 rounded-full blur-3xl opacity-20 transform translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-cyan-400 rounded-full blur-3xl opacity-20 transform -translate-x-1/2 translate-y-1/2" />
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-teal-300 rounded-full blur-3xl opacity-15 transform -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="relative z-10 max-w-xl mx-auto text-center">
        <div className="w-16 h-16 bg-linear-to-br from-lime-400 to-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/30">
          <svg
            className="w-8 h-8 text-emerald-900"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        </div>

        <h3 className="text-2xl md:text-3xl font-bold mb-3">
          Never Miss a <span className="text-lime-300">New Article</span>
        </h3>
        <p className="text-emerald-100/80 mb-8">
          Subscribe to our newsletter and get notified instantly when we publish
          fresh content. Join our growing community!
        </p>

        {!user ? (
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h4 className="text-xl font-semibold mb-2">Login Required</h4>
            <p className="text-white/80 mb-4">
              Please login with your registered account to subscribe for
              notifications.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-lime-400 to-emerald-400 text-emerald-900 rounded-xl font-semibold hover:from-lime-300 hover:to-emerald-300 transition shadow-lg shadow-emerald-500/30"
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
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                />
              </svg>
              Login to Subscribe
            </Link>
          </div>
        ) : status === "success" ? (
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h4 className="text-xl font-semibold mb-2">You're Subscribed!</h4>
            <p className="text-white/80">{message}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-left">
              <p className="text-white/60 text-sm mb-1">Subscribing as:</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">
                    {user.name?.charAt(0).toUpperCase() ||
                      user.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-white/70 text-sm">{user.email}</p>
                </div>
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer text-left bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 w-5 h-5 text-emerald-600 border-white/30 rounded focus:ring-emerald-500 focus:ring-offset-0 bg-white/20"
                disabled={status === "loading"}
              />
              <span className="text-sm text-white/90">
                I agree to receive email notifications and accept the{" "}
                <Link to="/terms" className="underline hover:text-white">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="underline hover:text-white">
                  Privacy Policy
                </Link>
              </span>
            </label>

            <button
              type="submit"
              disabled={status === "loading" || !acceptedTerms}
              className="w-full sm:w-auto px-8 py-3 bg-linear-to-r from-lime-400 to-emerald-400 text-emerald-900 rounded-xl font-semibold hover:from-lime-300 hover:to-emerald-300 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto shadow-lg shadow-emerald-500/30"
            >
              {status === "loading" ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Subscribing...
                </>
              ) : (
                <>
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
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  Subscribe Now
                </>
              )}
            </button>

            {status === "error" && (
              <p className="text-red-200 text-sm bg-red-500/20 rounded-lg py-2 px-4">
                {message}
              </p>
            )}

            <p className="text-emerald-200/70 text-sm">
              🌿 No spam, ever. Unsubscribe anytime with one click.
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default NewsletterSubscription;
