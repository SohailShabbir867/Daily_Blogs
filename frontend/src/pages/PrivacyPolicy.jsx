// Privacy policy page
import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
  const lastUpdated = "January 4, 2026";

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="mb-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-6"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-gray-500">Last updated: {lastUpdated}</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-sm p-8 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-600 leading-relaxed">
              Welcome to Daily Blogs ("we," "our," or "us"). We are committed to protecting your 
              personal information and your right to privacy. This Privacy Policy explains how we 
              collect, use, disclose, and safeguard your information when you visit our website.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p><strong>Personal Information You Provide:</strong></p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Account Data:</strong> Name, email address, and password when you register</li>
                <li><strong>Contact Information:</strong> Name, email, and message content when you contact us</li>
                <li><strong>Newsletter Subscription:</strong> Email address if you subscribe to notifications</li>
                <li><strong>Comments:</strong> Comment content and associated user information</li>
              </ul>
              
              <p className="mt-4"><strong>Automatically Collected Information:</strong></p>
              <ul className="list-disc pl-6 space-y-2">
                <li>IP address (anonymized for privacy)</li>
                <li>Browser type and version</li>
                <li>Pages visited and time spent</li>
                <li>Session cookies for authentication</li>
              </ul>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>To create and manage your account</li>
              <li>To authenticate and secure your sessions</li>
              <li>To send you blog post notifications (if subscribed)</li>
              <li>To respond to your inquiries and support requests</li>
              <li>To improve our website and services</li>
              <li>To prevent fraud and ensure security</li>
            </ul>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Retention</h2>
            <p className="text-gray-600 leading-relaxed">
              We retain your personal information only for as long as necessary to fulfill the 
              purposes outlined in this policy. Account data is retained while your account is 
              active. You may request deletion of your data at any time by contacting us.
            </p>
          </section>

          {/* Your Rights (GDPR) */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Your Privacy Rights</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Depending on your location, you may have the following rights:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Rectification:</strong> Request correction of inaccurate data</li>
              <li><strong>Erasure:</strong> Request deletion of your data ("right to be forgotten")</li>
              <li><strong>Portability:</strong> Request transfer of your data</li>
              <li><strong>Objection:</strong> Object to processing of your data</li>
              <li><strong>Withdraw Consent:</strong> Withdraw consent at any time</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              To exercise these rights, please contact us at the email provided below.
            </p>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Cookies and Tracking</h2>
            <p className="text-gray-600 leading-relaxed">
              We use essential cookies for authentication and session management. These cookies 
              are necessary for the website to function properly. We do not use tracking cookies 
              for advertising purposes. Session cookies are automatically deleted when you log out 
              or close your browser.
            </p>
          </section>

          {/* Security */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Data Security</h2>
            <p className="text-gray-600 leading-relaxed">
              We implement appropriate technical and organizational security measures to protect 
              your personal information, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600 mt-4">
              <li>Secure password hashing with bcrypt</li>
              <li>HTTPS encryption for all data transmission</li>
              <li>Rate limiting to prevent abuse</li>
              <li>Regular security audits</li>
            </ul>
          </section>

          {/* Third Party Services */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Third-Party Services</h2>
            <p className="text-gray-600 leading-relaxed">
              We may use third-party services for hosting, email delivery, and analytics. 
              These providers are bound by their own privacy policies and data protection agreements.
            </p>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Children's Privacy</h2>
            <p className="text-gray-600 leading-relaxed">
              Our services are not intended for individuals under 13 years of age. We do not 
              knowingly collect personal information from children. If you believe we have 
              collected data from a child, please contact us immediately.
            </p>
          </section>

          {/* Changes */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Changes to This Policy</h2>
            <p className="text-gray-600 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any 
              changes by posting the new policy on this page and updating the "Last updated" date.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contact Us</h2>
            <p className="text-gray-600 leading-relaxed">
              If you have questions about this Privacy Policy or wish to exercise your rights, 
              please contact us:
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600">
                <strong>Email:</strong>{" "}
                <a href="mailto:privacy@dailyblogs.com" className="text-emerald-600 hover:underline">
                  privacy@dailyblogs.com
                </a>
              </p>
              <p className="text-gray-600 mt-2">
                <strong>Contact Form:</strong>{" "}
                <Link to="/contact" className="text-emerald-600 hover:underline">
                  Contact Page
                </Link>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
