// Terms of Service - Comprehensive legal page with SEO optimization
import { Link } from "react-router-dom";
import { useEffect } from "react";

const TermsOfService = () => {
  const lastUpdated = "January 17, 2026";
  const effectiveDate = "January 17, 2026";

  // SEO - Set page title and meta description
  useEffect(() => {
    document.title = "Terms of Service | Daily Blogs - Your Trusted Blogging Platform";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content',
        'Read the Terms of Service for Daily Blogs. Understand your rights and responsibilities when using our blogging platform, including user conduct, content policies, and legal disclaimers.'
      );
    }
  }, []);

  // Table of contents sections
  const sections = [
    { id: "agreement", title: "Agreement to Terms" },
    { id: "eligibility", title: "Eligibility Requirements" },
    { id: "accounts", title: "User Accounts" },
    { id: "content", title: "User Content & Rights" },
    { id: "prohibited", title: "Prohibited Activities" },
    { id: "intellectual", title: "Intellectual Property" },
    { id: "communications", title: "Communications" },
    { id: "third-party", title: "Third-Party Links" },
    { id: "disclaimer", title: "Disclaimer of Warranties" },
    { id: "liability", title: "Limitation of Liability" },
    { id: "indemnification", title: "Indemnification" },
    { id: "termination", title: "Termination" },
    { id: "governing", title: "Governing Law" },
    { id: "changes", title: "Changes to Terms" },
    { id: "contact", title: "Contact Information" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zM6 20V4h5v7h7v9H6z" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold">Terms of Service</h1>
              <p className="text-white/80 mt-2">Legal Agreement for Daily Blogs Users</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
              📅 Last Updated: {lastUpdated}
            </span>
            <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
              ✅ Effective: {effectiveDate}
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
                <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z" />
                </svg>
                Table of Contents
              </h2>
              <nav className="space-y-2">
                {sections.map((section, index) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="block text-sm text-gray-600 hover:text-emerald-600 hover:pl-2 transition-all py-1"
                  >
                    {index + 1}. {section.title}
                  </a>
                ))}
              </nav>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <Link to="/privacy" className="text-sm text-emerald-600 hover:underline flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 md:p-10 space-y-10">
              {/* Important Notice */}
              <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-amber-800">Important Legal Notice</p>
                    <p className="text-amber-700 text-sm mt-1">
                      Please read these Terms of Service carefully before using Daily Blogs. By creating an account or using our services, you agree to be legally bound by these terms.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 1: Agreement */}
              <section id="agreement">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  Agreement to Terms
                </h2>
                <div className="text-gray-600 leading-relaxed space-y-4">
                  <p>
                    By accessing or using Daily Blogs ("the Service"), you agree to be bound by these Terms of Service ("Terms"). These Terms constitute a legally binding agreement between you ("User," "you," or "your") and Daily Blogs ("we," "us," or "our").
                  </p>
                  <p>
                    If you do not agree to all the terms and conditions of this agreement, you must not access or use the Service. Your continued use of the Service following the posting of any changes constitutes acceptance of those changes.
                  </p>
                  <p>
                    We reserve the right to modify, update, or replace these Terms at any time. It is your responsibility to review these Terms periodically for changes.
                  </p>
                </div>
              </section>

              {/* Section 2: Eligibility */}
              <section id="eligibility">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  Eligibility Requirements
                </h2>
                <div className="text-gray-600 leading-relaxed space-y-4">
                  <p>To use Daily Blogs, you must:</p>
                  <ul className="list-none space-y-3">
                    <li className="flex items-start gap-3">
                      <span className="text-emerald-500 mt-1">✓</span>
                      <span>Be at least <strong>13 years of age</strong> (or the minimum age required in your jurisdiction)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-emerald-500 mt-1">✓</span>
                      <span>Have the legal capacity to enter into a binding agreement</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-emerald-500 mt-1">✓</span>
                      <span>Not be prohibited from receiving services under applicable laws</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-emerald-500 mt-1">✓</span>
                      <span>Provide accurate and complete registration information</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-emerald-500 mt-1">✓</span>
                      <span>Accept and comply with our <Link to="/privacy" className="text-emerald-600 hover:underline">Privacy Policy</Link></span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Section 3: User Accounts */}
              <section id="accounts">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                  User Accounts
                </h2>
                <div className="text-gray-600 leading-relaxed space-y-4">
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                    <h3 className="font-semibold text-gray-900 mb-3">3.1 Account Registration</h3>
                    <p>To access certain features, you must create an account by providing your name, email address, and a secure password. You must ensure all information is accurate and up-to-date.</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                    <h3 className="font-semibold text-gray-900 mb-3">3.2 Account Security</h3>
                    <p>You are solely responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. Notify us immediately of any unauthorized access.</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                    <h3 className="font-semibold text-gray-900 mb-3">3.3 Account Suspension & Termination</h3>
                    <p>We reserve the right to suspend, disable, or terminate accounts that violate these Terms, engage in fraudulent activity, or pose a security risk to other users or our platform.</p>
                  </div>
                </div>
              </section>

              {/* Section 4: User Content */}
              <section id="content">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm font-bold">4</span>
                  User Content & Rights
                </h2>
                <div className="text-gray-600 leading-relaxed space-y-4">
                  <p>
                    <strong>Your Content:</strong> You retain ownership of content you create and post (comments, messages, blog posts). By posting content, you grant Daily Blogs a worldwide, non-exclusive, royalty-free license to use, display, reproduce, and distribute your content on our platform.
                  </p>
                  <p><strong>Content Standards:</strong> You agree NOT to post content that is:</p>
                  <ul className="grid md:grid-cols-2 gap-3 mt-3">
                    <li className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm">
                      <span>❌</span> Illegal, harmful, or threatening
                    </li>
                    <li className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm">
                      <span>❌</span> Defamatory or libelous
                    </li>
                    <li className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm">
                      <span>❌</span> Infringing intellectual property
                    </li>
                    <li className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm">
                      <span>❌</span> Spam or malicious content
                    </li>
                    <li className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm">
                      <span>❌</span> Sexually explicit or violent
                    </li>
                    <li className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm">
                      <span>❌</span> Harassing or discriminatory
                    </li>
                  </ul>
                  <p className="text-sm bg-blue-50 text-blue-700 p-4 rounded-lg mt-4">
                    💡 <strong>Note:</strong> We reserve the right to remove any content that violates these standards without prior notice.
                  </p>
                </div>
              </section>

              {/* Section 5: Prohibited Activities */}
              <section id="prohibited">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm font-bold">5</span>
                  Prohibited Activities
                </h2>
                <div className="text-gray-600 leading-relaxed">
                  <p className="mb-4">You agree NOT to engage in any of the following prohibited activities:</p>
                  <div className="grid gap-3">
                    {[
                      "Attempt to gain unauthorized access to our systems, servers, or databases",
                      "Use automated scripts, bots, or tools to scrape or collect data",
                      "Interfere with or disrupt our services or server infrastructure",
                      "Impersonate other users, entities, or Daily Blogs staff",
                      "Circumvent security measures, rate limits, or access controls",
                      "Upload viruses, malware, or other malicious code",
                      "Engage in phishing, fraud, or deceptive practices",
                      "Use the service for any illegal or unauthorized purpose",
                      "Sell, transfer, or sublicense your account",
                      "Violate any applicable local, state, national, or international law",
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-lg border border-gray-100">
                        <span className="text-red-500 font-bold">⛔</span>
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Section 6: Intellectual Property */}
              <section id="intellectual">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm font-bold">6</span>
                  Intellectual Property
                </h2>
                <div className="text-gray-600 leading-relaxed space-y-4">
                  <p>
                    The Daily Blogs platform, including its design, logo, trademarks, and original content, is protected by copyright, trademark, and other intellectual property laws.
                  </p>
                  <p>You may NOT:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Copy, modify, or distribute any part of our platform without permission</li>
                    <li>Use our trademarks or branding without written authorization</li>
                    <li>Reverse engineer, decompile, or attempt to extract source code</li>
                    <li>Create derivative works based on our platform</li>
                  </ul>
                </div>
              </section>

              {/* Section 7: Communications */}
              <section id="communications">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm font-bold">7</span>
                  Communications
                </h2>
                <div className="text-gray-600 leading-relaxed space-y-4">
                  <p>By creating an account, you consent to receive:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Account-related emails (verification, password reset, security alerts)</li>
                    <li>Newsletter and blog notifications (if subscribed)</li>
                    <li>Important service announcements and updates</li>
                  </ul>
                  <p>You may unsubscribe from non-essential communications at any time through your account settings or by clicking the unsubscribe link in emails.</p>
                </div>
              </section>

              {/* Section 8: Third-Party Links */}
              <section id="third-party">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm font-bold">8</span>
                  Third-Party Links & Services
                </h2>
                <div className="text-gray-600 leading-relaxed">
                  <p>
                    Our platform may contain links to third-party websites or services. We are not responsible for the content, privacy policies, or practices of third-party sites. Your use of third-party services is at your own risk.
                  </p>
                </div>
              </section>

              {/* Section 9: Disclaimers */}
              <section id="disclaimer">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm font-bold">9</span>
                  Disclaimer of Warranties
                </h2>
                <div className="bg-gray-100 rounded-xl p-6 text-gray-700 text-sm uppercase tracking-wide leading-relaxed">
                  THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE. WE DISCLAIM ALL WARRANTIES, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                </div>
              </section>

              {/* Section 10: Limitation of Liability */}
              <section id="liability">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm font-bold">10</span>
                  Limitation of Liability
                </h2>
                <div className="bg-gray-100 rounded-xl p-6 text-gray-700 text-sm uppercase tracking-wide leading-relaxed">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, DAILY BLOGS AND ITS AFFILIATES SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, OR GOODWILL, ARISING FROM YOUR USE OF OR INABILITY TO USE THE SERVICE.
                </div>
              </section>

              {/* Section 11: Indemnification */}
              <section id="indemnification">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm font-bold">11</span>
                  Indemnification
                </h2>
                <div className="text-gray-600 leading-relaxed">
                  <p>
                    You agree to indemnify, defend, and hold harmless Daily Blogs, its officers, directors, employees, agents, and affiliates from any claims, damages, losses, liabilities, costs, or expenses (including legal fees) arising from:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 mt-4">
                    <li>Your use of the Service</li>
                    <li>Your violation of these Terms</li>
                    <li>Your violation of any third-party rights</li>
                    <li>Any content you post on the platform</li>
                  </ul>
                </div>
              </section>

              {/* Section 12: Termination */}
              <section id="termination">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm font-bold">12</span>
                  Termination
                </h2>
                <div className="text-gray-600 leading-relaxed space-y-4">
                  <p>
                    We may terminate or suspend your account and access to the Service immediately, without prior notice, for any reason, including but not limited to breach of these Terms.
                  </p>
                  <p>
                    Upon termination, your right to use the Service will cease immediately. You may also request to delete your account at any time through your account settings or by contacting us.
                  </p>
                </div>
              </section>

              {/* Section 13: Governing Law */}
              <section id="governing">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm font-bold">13</span>
                  Governing Law & Disputes
                </h2>
                <div className="text-gray-600 leading-relaxed">
                  <p>
                    These Terms shall be governed by and construed in accordance with applicable laws. Any disputes arising from these Terms or your use of the Service shall be resolved through appropriate legal channels.
                  </p>
                </div>
              </section>

              {/* Section 14: Changes */}
              <section id="changes">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm font-bold">14</span>
                  Changes to Terms
                </h2>
                <div className="text-gray-600 leading-relaxed">
                  <p>
                    We reserve the right to modify these Terms at any time. We will notify you of material changes by posting the updated Terms on this page and updating the "Last updated" date. Your continued use of the Service after changes constitutes acceptance of the modified Terms.
                  </p>
                </div>
              </section>

              {/* Section 15: Contact */}
              <section id="contact">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm font-bold">15</span>
                  Contact Information
                </h2>
                <div className="text-gray-600 leading-relaxed">
                  <p className="mb-4">For questions about these Terms of Service, please contact us:</p>
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-100">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <a href="mailto:legal@dailyblogs.com" className="text-emerald-600 font-medium hover:underline">
                            legal@dailyblogs.com
                          </a>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 16H4c-.55 0-1-.45-1-1V6c0-.55.45-1 1-1h16c.55 0 1 .45 1 1v12c0 .55-.45 1-1 1z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Contact Form</p>
                          <Link to="/contact" className="text-emerald-600 font-medium hover:underline">
                            Contact Page
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Footer Notice */}
              <div className="pt-8 mt-8 border-t border-gray-100">
                <p className="text-center text-gray-500 text-sm">
                  By using Daily Blogs, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
