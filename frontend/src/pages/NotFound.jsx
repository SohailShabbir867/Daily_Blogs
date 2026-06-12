// 404 Not Found page — shown for all unmatched routes
import { Link } from "react-router-dom";
import SEO from "../components/SEO";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-teal-50/30 flex items-center justify-center px-4">
      <SEO
        title="404 — Page Not Found"
        description="The page you are looking for doesn't exist or has been moved."
        noindex={true}
      />

      <div className="max-w-lg w-full text-center">
        {/* Animated 404 */}
        <div className="relative mb-8">
          <div className="text-[10rem] font-extrabold leading-none bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent select-none animate-pulse">
            404
          </div>
          {/* Decorative ring */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-56 h-56 rounded-full border-4 border-emerald-200/40 animate-ping" />
          </div>
        </div>

        {/* Icon */}
        <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/25">
          <svg
            className="w-10 h-10 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
          Page Not Found
        </h1>
        <p className="text-gray-500 text-lg mb-10 max-w-sm mx-auto leading-relaxed">
          Oops! The page you're looking for doesn't exist or may have been
          moved.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/25 hover:scale-105"
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
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Go to Homepage
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 px-8 py-4 rounded-xl font-semibold border border-gray-200 hover:bg-gray-50 hover:border-emerald-300 hover:text-emerald-600 transition-all shadow-sm hover:scale-105"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Go Back
          </button>
        </div>

        {/* Quick Links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">Popular sections</p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { label: "Technology", href: "/?category=Technology" },
              { label: "Jobs & Career", href: "/?category=Jobs+%26+Career" },
              { label: "Study Material", href: "/?category=Study+Material" },
              { label: "Visa & Immigration", href: "/?category=Visa+%26+Immigration" },
              { label: "About Us", href: "/about" },
            ].map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="px-4 py-2 bg-white rounded-full text-sm font-medium text-gray-600 border border-gray-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
