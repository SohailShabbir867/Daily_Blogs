// Email verification page - handles verification link from email
import { useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import SEO from "../components/SEO";
import { verifyEmail } from "../services/authService";

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState("verifying"); // verifying, success, error, already-verified
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const verificationAttempted = useRef(false);

  useEffect(() => {
    const verify = async () => {
      if (verificationAttempted.current) {
        return;
      }
      verificationAttempted.current = true;

      if (!token) {
        setStatus("error");
        setMessage("Invalid verification link. No token provided.");
        return;
      }

      try {
        const response = await verifyEmail(token);

        if (response.success) {
          if (response.data?.alreadyVerified) {
            setStatus("already-verified");
          } else {
            setStatus("success");
          }
          setMessage(response.data?.message || "Email verified successfully!");
          setEmail(response.data?.email || "");
        } else {
          setStatus("error");
          setMessage(
            response.message || "Verification failed. Please try again.",
          );
        }
      } catch (err) {
        const errorMsg = err.message || "";
        const isAlreadyUsed =
          err.code === "ALREADY_VERIFIED" ||
          errorMsg.includes("already been used") ||
          errorMsg.includes("already verified");

        if (isAlreadyUsed) {
          setStatus("already-verified");
          setMessage(
            "This verification link has already been used. You can proceed to login.",
          );
        } else {
          setStatus("error");
          setMessage(
            err.message ||
              "Verification failed. The link may be invalid or expired.",
          );
        }
      }
    };

    verify();
  }, [token]);

  if (status === "verifying") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            {/* Loading Spinner */}
            <div className="w-20 h-20 mx-auto mb-6 relative">
              <div className="absolute inset-0 border-4 border-emerald-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-emerald-600 rounded-full border-t-transparent animate-spin"></div>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Verifying Your Email...
            </h1>

            <p className="text-gray-600">
              Please wait while we verify your email address.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "success" || status === "already-verified") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            {/* Success Icon */}
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {status === "already-verified"
                ? "Email Already Verified! ✓"
                : "Email Verified! ✓"}
            </h1>

            <p className="text-gray-600 mb-2">{message}</p>

            {email && (
              <p className="text-emerald-600 font-semibold mb-6">{email}</p>
            )}

            <p className="text-gray-500 text-sm mb-6">
              {status === "already-verified"
                ? "Your email was already verified. You can log in now!"
                : "Your account is now active. You can log in and start using Daily Blogs!"}
            </p>

            <Link
              to="/login"
              className="inline-block w-full bg-linear-to-r from-emerald-500 to-teal-500 text-white py-3 rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition shadow-lg shadow-emerald-500/20"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <SEO
        title="Verify Email"
        description="Verify your email address to activate your Daily Blogs account and start exploring tech articles."
        keywords="verify email, email verification, activate account"
        noindex={true}
      />
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Error Icon */}
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-red-500"
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
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Verification Failed
          </h1>

          <p className="text-gray-600 mb-6">{message}</p>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 text-sm">
              <strong>Link expired?</strong> Go to the login page and request a
              new verification email.
            </p>
          </div>

          <div className="space-y-3">
            <Link
              to="/login"
              className="inline-block w-full bg-linear-to-r from-emerald-500 to-teal-500 text-white py-3 rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition shadow-lg shadow-emerald-500/20"
            >
              Go to Login
            </Link>

            <Link
              to="/register"
              className="inline-block w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            >
              Create New Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
