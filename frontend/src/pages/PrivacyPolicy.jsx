// Privacy Policy - Comprehensive legal page with SEO optimization
import { Link } from "react-router-dom";
import SEO from "../components/SEO";

const PrivacyPolicy = () => {
  const lastUpdated = "January 17, 2026";
  const effectiveDate = "January 17, 2026";

  // Table of contents sections
  const sections = [
    { id: "introduction", title: "Introduction" },
    { id: "information", title: "Information We Collect" },
    { id: "usage", title: "How We Use Your Data" },
    { id: "sharing", title: "Information Sharing" },
    { id: "cookies", title: "Cookies & Tracking" },
    { id: "security", title: "Data Security" },
    { id: "retention", title: "Data Retention" },
    { id: "rights", title: "Your Privacy Rights" },
    { id: "children", title: "Children's Privacy" },
    { id: "international", title: "International Transfers" },
    { id: "third-party", title: "Third-Party Services" },
    { id: "changes", title: "Policy Changes" },
    { id: "contact", title: "Contact Us" },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-blue-50/30">
      <SEO
        title="Privacy Policy"
        description="Read Daily Blogs' privacy policy to understand how we collect, use, and protect your personal information. We are committed to data protection and transparency."
        keywords="privacy policy, data protection, user privacy, personal information, GDPR, cookie policy, daily blogs privacy"
        type="website"
        breadcrumbs={[{ name: "Home", url: "/" }, { name: "Privacy Policy" }]}
      />
      {/* Hero Header */}
      <div className="bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors"
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
            Back to Home
          </Link>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold">Privacy Policy</h1>
              <p className="text-white/80 mt-2">
                How We Protect Your Personal Information
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
              📅 Last Updated: {lastUpdated}
            </span>
            <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
              ✅ Effective: {effectiveDate}
            </span>
            <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
              🔒 GDPR Compliant
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Table of Contents - Sticky Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z" />
                </svg>
                Table of Contents
              </h2>
              <nav className="space-y-2">
                {sections.map((section, index) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="block text-sm text-gray-600 hover:text-blue-600 hover:pl-2 transition-all py-1"
                  >
                    {index + 1}. {section.title}
                  </a>
                ))}
              </nav>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <Link
                  to="/terms"
                  className="text-sm text-blue-600 hover:underline flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 md:p-10 space-y-10">
              {/* Privacy Highlights */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-green-50 rounded-xl p-4 text-center border border-green-100">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg
                      className="w-6 h-6 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-green-800">Secure Data</h3>
                  <p className="text-xs text-green-600 mt-1">
                    AES-256 Encryption
                  </p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg
                      className="w-6 h-6 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-blue-800">
                    No Ad Tracking
                  </h3>
                  <p className="text-xs text-blue-600 mt-1">
                    No third-party ads
                  </p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 text-center border border-purple-100">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg
                      className="w-6 h-6 text-purple-600"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-purple-800">Your Rights</h3>
                  <p className="text-xs text-purple-600 mt-1">Delete anytime</p>
                </div>
              </div>

              {/* Section 1: Introduction */}
              <section id="introduction">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </span>
                  Introduction
                </h2>
                <div className="text-gray-600 leading-relaxed space-y-4">
                  <p>
                    Welcome to Daily Blogs ("we," "our," or "us"). We are
                    committed to protecting your personal information and your
                    right to privacy. This Privacy Policy explains how we
                    collect, use, disclose, and safeguard your information when
                    you use our website and services.
                  </p>
                  <p>
                    By using Daily Blogs, you agree to the collection and use of
                    information in accordance with this policy. If you do not
                    agree with our policies, please do not use our services.
                  </p>
                </div>
              </section>

              {/* Section 2: Information We Collect */}
              <section id="information">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </span>
                  Information We Collect
                </h2>
                <div className="text-gray-600 leading-relaxed space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-blue-500"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                      Information You Provide
                    </h3>
                    <div className="grid gap-3">
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                        <p className="font-medium text-gray-800">
                          Account Registration
                        </p>
                        <p className="text-sm text-gray-600">
                          Name, email address, password (encrypted)
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                        <p className="font-medium text-gray-800">
                          Profile Information
                        </p>
                        <p className="text-sm text-gray-600">
                          Bio, avatar image (optional)
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                        <p className="font-medium text-gray-800">
                          User Content
                        </p>
                        <p className="text-sm text-gray-600">
                          Comments, messages, saved blogs
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                        <p className="font-medium text-gray-800">
                          Contact Information
                        </p>
                        <p className="text-sm text-gray-600">
                          Messages sent via contact form
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                        <p className="font-medium text-gray-800">
                          Newsletter Subscription
                        </p>
                        <p className="text-sm text-gray-600">
                          Email address for blog notifications
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-blue-500"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                      </svg>
                      Automatically Collected Information
                    </h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-lg">
                        <span className="text-blue-500">📍</span>
                        <span className="text-sm">IP address (anonymized)</span>
                      </div>
                      <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-lg">
                        <span className="text-blue-500">🌐</span>
                        <span className="text-sm">Browser type & version</span>
                      </div>
                      <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-lg">
                        <span className="text-blue-500">📱</span>
                        <span className="text-sm">Device information</span>
                      </div>
                      <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-lg">
                        <span className="text-blue-500">📄</span>
                        <span className="text-sm">
                          Pages visited & time spent
                        </span>
                      </div>
                      <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-lg">
                        <span className="text-blue-500">🔗</span>
                        <span className="text-sm">Referring URL</span>
                      </div>
                      <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-lg">
                        <span className="text-blue-500">🕐</span>
                        <span className="text-sm">Session timestamps</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 3: How We Use Your Data */}
              <section id="usage">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </span>
                  How We Use Your Data
                </h2>
                <div className="text-gray-600 leading-relaxed">
                  <p className="mb-4">
                    We use your personal information for the following purposes:
                  </p>
                  <div className="grid gap-3">
                    {[
                      { icon: "👤", text: "Create and manage your account" },
                      {
                        icon: "🔐",
                        text: "Authenticate and secure your sessions",
                      },
                      {
                        icon: "📧",
                        text: "Send account-related emails (verification, security alerts)",
                      },
                      {
                        icon: "📬",
                        text: "Deliver blog notifications (if subscribed)",
                      },
                      {
                        icon: "💬",
                        text: "Respond to inquiries and support requests",
                      },
                      { icon: "📊", text: "Improve our website and services" },
                      {
                        icon: "🛡️",
                        text: "Prevent fraud, abuse, and security threats",
                      },
                      { icon: "⚖️", text: "Comply with legal obligations" },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-lg border border-gray-100"
                      >
                        <span className="text-xl">{item.icon}</span>
                        <span>{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Section 4: Information Sharing */}
              <section id="sharing">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                    4
                  </span>
                  Information Sharing
                </h2>
                <div className="text-gray-600 leading-relaxed space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                    <div className="flex items-start gap-3">
                      <svg
                        className="w-6 h-6 text-green-600 shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                      <div>
                        <p className="font-semibold text-green-800">
                          We Do NOT Sell Your Data
                        </p>
                        <p className="text-green-700 text-sm mt-1">
                          We do not sell, rent, or trade your personal
                          information to third parties for marketing purposes.
                        </p>
                      </div>
                    </div>
                  </div>
                  <p>
                    We may share your information only in these limited
                    circumstances:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      <strong>Service Providers:</strong> With trusted third
                      parties who assist us (hosting, email delivery)
                    </li>
                    <li>
                      <strong>Legal Requirements:</strong> When required by law
                      or to protect our legal rights
                    </li>
                    <li>
                      <strong>Safety:</strong> To prevent harm to users or the
                      public
                    </li>
                    <li>
                      <strong>Business Transfers:</strong> In case of merger,
                      acquisition, or sale of assets
                    </li>
                  </ul>
                </div>
              </section>

              {/* Section 5: Cookies */}
              <section id="cookies">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                    5
                  </span>
                  Cookies & Tracking
                </h2>
                <div className="text-gray-600 leading-relaxed space-y-4">
                  <p>
                    We use cookies to enhance your experience on our platform.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                      <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <span className="text-green-500">✅</span> Essential
                        Cookies
                      </h3>
                      <p className="text-sm">
                        Required for authentication, session management, and
                        security. Cannot be disabled.
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                      <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <span className="text-red-500">❌</span> No Advertising
                        Cookies
                      </h3>
                      <p className="text-sm">
                        We do not use cookies for advertising or tracking across
                        other websites.
                      </p>
                    </div>
                  </div>
                  <p className="text-sm bg-blue-50 text-blue-700 p-4 rounded-lg">
                    💡 Session cookies are automatically deleted when you log
                    out or close your browser.
                  </p>
                </div>
              </section>

              {/* Section 6: Data Security */}
              <section id="security">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                    6
                  </span>
                  Data Security
                </h2>
                <div className="text-gray-600 leading-relaxed">
                  <p className="mb-4">
                    We implement industry-standard security measures to protect
                    your data:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      {
                        icon: "🔒",
                        title: "Password Encryption",
                        desc: "Bcrypt hashing with salt",
                      },
                      {
                        icon: "🔐",
                        title: "Chat Encryption",
                        desc: "AES-256-GCM for messages",
                      },
                      {
                        icon: "🌐",
                        title: "HTTPS/TLS",
                        desc: "All data encrypted in transit",
                      },
                      {
                        icon: "🛡️",
                        title: "Rate Limiting",
                        desc: "Protection against abuse",
                      },
                      {
                        icon: "🔑",
                        title: "Secure Sessions",
                        desc: "HttpOnly, Secure cookies",
                      },
                      {
                        icon: "🚫",
                        title: "XSS Protection",
                        desc: "Content sanitization",
                      },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-start gap-3"
                      >
                        <span className="text-2xl">{item.icon}</span>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {item.title}
                          </p>
                          <p className="text-sm text-gray-600">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Section 7: Data Retention */}
              <section id="retention">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                    7
                  </span>
                  Data Retention
                </h2>
                <div className="text-gray-600 leading-relaxed space-y-4">
                  <p>We retain your data only as long as necessary:</p>
                  <div className="grid gap-3">
                    <div className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg border border-gray-100">
                      <span>Account Data</span>
                      <span className="text-sm font-medium text-blue-600">
                        Until account deletion
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg border border-gray-100">
                      <span>Chat Messages</span>
                      <span className="text-sm font-medium text-blue-600">
                        Auto-deleted after 5 days
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg border border-gray-100">
                      <span>Session Data</span>
                      <span className="text-sm font-medium text-blue-600">
                        7 days or logout
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg border border-gray-100">
                      <span>Contact Messages</span>
                      <span className="text-sm font-medium text-blue-600">
                        Until resolved
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 8: Your Rights */}
              <section id="rights">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                    8
                  </span>
                  Your Privacy Rights
                </h2>
                <div className="text-gray-600 leading-relaxed space-y-4">
                  <p>
                    Depending on your location, you may have the following
                    rights:
                  </p>
                  <div className="grid gap-3">
                    {[
                      {
                        right: "Access",
                        desc: "Request a copy of your personal data",
                      },
                      {
                        right: "Rectification",
                        desc: "Request correction of inaccurate data",
                      },
                      {
                        right: "Erasure",
                        desc: "Request deletion of your data ('right to be forgotten')",
                      },
                      {
                        right: "Portability",
                        desc: "Request transfer of your data",
                      },
                      {
                        right: "Objection",
                        desc: "Object to processing of your data",
                      },
                      {
                        right: "Withdraw Consent",
                        desc: "Withdraw consent at any time",
                      },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-4 bg-linear-to-r from-blue-50 to-indigo-50 px-5 py-4 rounded-xl border border-blue-100"
                      >
                        <span className="text-blue-600 font-bold text-lg">
                          ✓
                        </span>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {item.right}
                          </p>
                          <p className="text-sm text-gray-600">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm mt-4">
                    To exercise these rights, contact us at{" "}
                    <a
                      href="mailto:privacy@dailyblogs.com"
                      className="text-blue-600 hover:underline"
                    >
                      privacy@dailyblogs.com
                    </a>
                    .
                  </p>
                </div>
              </section>

              {/* Section 9: Children */}
              <section id="children">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                    9
                  </span>
                  Children's Privacy
                </h2>
                <div className="bg-amber-50 border-l-4 border-amber-400 p-5 rounded-r-xl text-amber-800">
                  <p>
                    Our services are not intended for individuals under 13 years
                    of age. We do not knowingly collect personal information
                    from children under 13. If you believe we have collected
                    data from a child, please contact us immediately at{" "}
                    <a
                      href="mailto:privacy@dailyblogs.com"
                      className="font-medium underline"
                    >
                      privacy@dailyblogs.com
                    </a>
                    .
                  </p>
                </div>
              </section>

              {/* Section 10: International */}
              <section id="international">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                    10
                  </span>
                  International Data Transfers
                </h2>
                <div className="text-gray-600 leading-relaxed">
                  <p>
                    Your information may be transferred to and processed in
                    countries other than your own. We ensure adequate safeguards
                    are in place to protect your data in compliance with
                    applicable data protection laws.
                  </p>
                </div>
              </section>

              {/* Section 11: Third-Party */}
              <section id="third-party">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                    11
                  </span>
                  Third-Party Services
                </h2>
                <div className="text-gray-600 leading-relaxed">
                  <p>
                    We may use third-party services for hosting, email delivery,
                    and analytics. These providers are bound by their own
                    privacy policies and data protection agreements. We
                    carefully select partners who maintain high privacy
                    standards.
                  </p>
                </div>
              </section>

              {/* Section 12: Changes */}
              <section id="changes">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                    12
                  </span>
                  Changes to This Policy
                </h2>
                <div className="text-gray-600 leading-relaxed">
                  <p>
                    We may update this Privacy Policy from time to time. We will
                    notify you of material changes by posting the new policy on
                    this page and updating the "Last updated" date. We encourage
                    you to review this policy periodically.
                  </p>
                </div>
              </section>

              {/* Section 13: Contact */}
              <section id="contact">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                    13
                  </span>
                  Contact Us
                </h2>
                <div className="text-gray-600 leading-relaxed">
                  <p className="mb-4">
                    If you have questions about this Privacy Policy or wish to
                    exercise your rights, contact us:
                  </p>
                  <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-blue-600"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <a
                            href="mailto:privacy@dailyblogs.com"
                            className="text-blue-600 font-medium hover:underline"
                          >
                            privacy@dailyblogs.com
                          </a>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-blue-600"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 16H4c-.55 0-1-.45-1-1V6c0-.55.45-1 1-1h16c.55 0 1 .45 1 1v12c0 .55-.45 1-1 1z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Contact Form</p>
                          <Link
                            to="/contact"
                            className="text-blue-600 font-medium hover:underline"
                          >
                            Contact Page
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Footer */}
              <div className="pt-8 mt-8 border-t border-gray-100">
                <p className="text-center text-gray-500 text-sm">
                  Your privacy matters to us. Thank you for trusting Daily Blogs
                  with your personal information.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
