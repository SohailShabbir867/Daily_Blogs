// Terms of service page
import { Link } from "react-router-dom";

const TermsOfService = () => {
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-gray-500">Last updated: {lastUpdated}</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-sm p-8 space-y-8">
          {/* Agreement */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Agreement to Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              By accessing or using Daily Blogs, you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use our services. We reserve the 
              right to modify these terms at any time, and your continued use constitutes acceptance 
              of any changes.
            </p>
          </section>

          {/* Use of Services */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Use of Our Services</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              You may use our services only as permitted by these terms and applicable laws. You agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Use the services only for lawful purposes</li>
              <li>Respect other users and their content</li>
            </ul>
          </section>

          {/* User Accounts */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts</h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                <strong>Registration:</strong> To access certain features, you must create an account. 
                You must be at least 13 years old to register.
              </p>
              <p>
                <strong>Account Security:</strong> You are responsible for maintaining the 
                confidentiality of your password and all activities under your account.
              </p>
              <p>
                <strong>Account Termination:</strong> We may suspend or terminate accounts that 
                violate these terms or engage in harmful behavior.
              </p>
            </div>
          </section>

          {/* User Content */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. User Content</h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                <strong>Your Content:</strong> You retain ownership of content you submit (comments, 
                messages). By posting, you grant us a non-exclusive license to display and distribute 
                your content on our platform.
              </p>
              <p>
                <strong>Content Standards:</strong> You agree not to post content that is:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Illegal, harmful, threatening, or harassing</li>
                <li>Defamatory, libelous, or invades privacy</li>
                <li>Infringing on intellectual property rights</li>
                <li>Spam, malware, or deceptive content</li>
                <li>Sexually explicit or violent</li>
              </ul>
              <p>
                <strong>Content Removal:</strong> We reserve the right to remove any content that 
                violates these terms without notice.
              </p>
            </div>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Intellectual Property</h2>
            <p className="text-gray-600 leading-relaxed">
              The Daily Blogs website, including its design, logo, and original content, is protected 
              by copyright, trademark, and other intellectual property laws. You may not copy, modify, 
              distribute, or reverse engineer any part of our services without written permission.
            </p>
          </section>

          {/* Prohibited Activities */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Prohibited Activities</h2>
            <p className="text-gray-600 leading-relaxed mb-4">You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Use automated tools to scrape or collect data</li>
              <li>Interfere with or disrupt our services</li>
              <li>Impersonate other users or entities</li>
              <li>Circumvent security measures or rate limits</li>
              <li>Use the service for any illegal purpose</li>
            </ul>
          </section>

          {/* Disclaimer */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Disclaimer of Warranties</h2>
            <p className="text-gray-600 leading-relaxed">
              OUR SERVICES ARE PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR 
              IMPLIED. WE DO NOT WARRANT THAT THE SERVICES WILL BE UNINTERRUPTED, ERROR-FREE, OR 
              SECURE. WE DISCLAIM ALL WARRANTIES, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS 
              FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Limitation of Liability</h2>
            <p className="text-gray-600 leading-relaxed">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, DAILY BLOGS SHALL NOT BE LIABLE FOR ANY 
              INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS 
              OF PROFITS, DATA, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR USE OF OR INABILITY 
              TO USE THE SERVICE.
            </p>
          </section>

          {/* Indemnification */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Indemnification</h2>
            <p className="text-gray-600 leading-relaxed">
              You agree to indemnify and hold harmless Daily Blogs, its officers, directors, employees, 
              and agents from any claims, damages, losses, or expenses arising from your use of the 
              services or violation of these terms.
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Governing Law</h2>
            <p className="text-gray-600 leading-relaxed">
              These terms shall be governed by and construed in accordance with applicable laws. 
              Any disputes shall be resolved through appropriate legal channels in the jurisdiction 
              where Daily Blogs operates.
            </p>
          </section>

          {/* Changes */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Changes to Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              We may revise these Terms of Service at any time. Material changes will be communicated 
              through the website or via email. Your continued use after changes constitutes acceptance 
              of the updated terms.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contact Information</h2>
            <p className="text-gray-600 leading-relaxed">
              For questions about these Terms of Service, please contact us:
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600">
                <strong>Email:</strong>{" "}
                <a href="mailto:legal@dailyblogs.com" className="text-emerald-600 hover:underline">
                  legal@dailyblogs.com
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

export default TermsOfService;
