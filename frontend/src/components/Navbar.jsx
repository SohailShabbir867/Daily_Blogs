// Navbar - Main navigation with responsive mobile menu and user authentication
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect, useRef } from "react";

const Navbar = () => {
  const { user, logout, isAdmin, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsProfileOpen(false);
    setIsMenuOpen(false);
  };

  const getLinkClasses = ({ isActive }) =>
    `font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-lg px-2 py-1 ${
      isActive ? "text-emerald-600" : "text-gray-700 hover:text-emerald-600"
    }`;

  return (
    <nav
      className="bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-lg"
          aria-label="Daily Blogs - Home"
        >
          <div className="w-10 h-10 bg-linear-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <span className="text-white font-bold text-lg" aria-hidden="true">
              D
            </span>
          </div>
          <span className="text-xl font-bold text-gray-900">Daily Blogs</span>
        </Link>

        <div className="hidden md:flex items-center space-x-6">
          <NavLink to="/" className={getLinkClasses} end>
            Home
          </NavLink>

          <NavLink to="/about" className={getLinkClasses}>
            About
          </NavLink>

          <NavLink to="/contact" className={getLinkClasses}>
            Contact
          </NavLink>

          {user && (
            <NavLink to="/saved" className={getLinkClasses}>
              Saved
            </NavLink>
          )}

          {isAdmin && (
            <NavLink to="/admin" className={getLinkClasses}>
              Admin
            </NavLink>
          )}

          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition focus:outline-none focus:ring-2 focus:ring-emerald-500"
                aria-expanded={isProfileOpen}
                aria-haspopup="true"
                aria-label="User menu"
              >
                <div className="w-8 h-8 bg-linear-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-white font-medium text-sm">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
                <span className="text-gray-700 font-medium truncate max-w-[100px] sm:max-w-[140px]">
                  {user.name}
                </span>

                <svg
                  className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                    isProfileOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {isProfileOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-fadeIn"
                  role="menu"
                  aria-orientation="vertical"
                >
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user.email}
                    </p>
                    {isSuperAdmin ? (
                      <span className="inline-block mt-2 px-2 py-0.5 bg-linear-to-r from-purple-100 to-pink-100 text-purple-700 text-xs font-medium rounded-full">
                        Super Admin
                      </span>
                    ) : (
                      isAdmin && (
                        <span className="inline-block mt-2 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                          Admin
                        </span>
                      )
                    )}
                  </div>

                  <Link
                    to="/saved"
                    className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition"
                    onClick={() => setIsProfileOpen(false)}
                    role="menuitem"
                  >
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                      />
                    </svg>
                    Saved Articles
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition"
                      onClick={() => setIsProfileOpen(false)}
                      role="menuitem"
                    >
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      Admin Dashboard
                    </Link>
                  )}

                  {isSuperAdmin && (
                    <>
                      <Link
                        to="/admin/users"
                        className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition"
                        onClick={() => setIsProfileOpen(false)}
                        role="menuitem"
                      >
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                          />
                        </svg>
                        Manage Users
                      </Link>
                      <Link
                        to="/admin/contacts"
                        className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition"
                        onClick={() => setIsProfileOpen(false)}
                        role="menuitem"
                      >
                        <svg
                          className="w-5 h-5 text-gray-400"
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
                        Manage Contacts
                      </Link>
                    </>
                  )}

                  <div className="border-t border-gray-100 mt-2 pt-2">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-red-600 hover:bg-red-50 transition"
                      role="menuitem"
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
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <NavLink to="/login" className={getLinkClasses}>
                Login
              </NavLink>
              <Link
                to="/register"
                className="bg-linear-to-r from-emerald-500 to-teal-500 text-white px-5 py-2.5 rounded-xl font-medium hover:from-emerald-600 hover:to-teal-600 transition shadow-lg shadow-emerald-500/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden py-4 px-6 border-t bg-white/95 backdrop-blur-sm animate-slideDown"
          role="menu"
        >
          <div className="flex flex-col gap-1">
            <Link
              to="/"
              className="px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition font-medium"
              onClick={() => setIsMenuOpen(false)}
              role="menuitem"
            >
              Home
            </Link>

            <Link
              to="/about"
              className="px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition font-medium"
              onClick={() => setIsMenuOpen(false)}
              role="menuitem"
            >
              About
            </Link>

            <Link
              to="/contact"
              className="px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition font-medium"
              onClick={() => setIsMenuOpen(false)}
              role="menuitem"
            >
              Contact
            </Link>

            {user && (
              <Link
                to="/saved"
                className="px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition font-medium"
                onClick={() => setIsMenuOpen(false)}
                role="menuitem"
              >
                Saved Articles
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                className="px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition font-medium"
                onClick={() => setIsMenuOpen(false)}
                role="menuitem"
              >
                Admin Dashboard
              </Link>
            )}

            {isSuperAdmin && (
              <>
                <Link
                  to="/admin/users"
                  className="px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition font-medium"
                  onClick={() => setIsMenuOpen(false)}
                  role="menuitem"
                >
                  Manage Users
                </Link>
                <Link
                  to="/admin/contacts"
                  className="px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition font-medium"
                  onClick={() => setIsMenuOpen(false)}
                  role="menuitem"
                >
                  Manage Contacts
                </Link>
              </>
            )}

            <div className="border-t border-gray-100 mt-2 pt-2">
              {user ? (
                <>
                  <div className="px-4 py-3 flex items-center gap-3">
                    <div className="w-10 h-10 bg-linear-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-white font-medium">
                        {user.name?.charAt(0).toUpperCase() || "U"}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {user.name}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-xl transition font-medium"
                    role="menuitem"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 pt-2">
                  <Link
                    to="/login"
                    className="px-4 py-3 text-center text-gray-700 hover:bg-gray-50 rounded-xl transition font-medium"
                    onClick={() => setIsMenuOpen(false)}
                    role="menuitem"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="mx-2 text-center bg-linear-to-r from-emerald-500 to-teal-500 text-white px-4 py-3 rounded-xl font-semibold shadow-lg shadow-emerald-500/20"
                    onClick={() => setIsMenuOpen(false)}
                    role="menuitem"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
