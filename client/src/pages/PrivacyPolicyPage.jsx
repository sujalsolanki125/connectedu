import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🔒 Privacy Policy – ConnectEDu
          </h1>
          <p className="text-gray-600">
            <strong>Last updated:</strong> October 24, 2025
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-md p-8 space-y-8">
          {/* Introduction */}
          <div>
            <p className="text-gray-700 leading-relaxed">
              Welcome to ConnectEDu, an educational networking platform connecting students with verified alumni for mentorship, interview preparation, and career growth. This Privacy Policy explains how we collect, use, store, and protect your personal information when you use our services.
            </p>
          </div>

          {/* Section 1 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              1️⃣ Information We Collect
            </h2>
            <p className="text-gray-700 mb-3">
              We collect the following types of data when you register or interact with ConnectEDu:
            </p>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">a. Personal Information</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>Full name, email address, phone number (if provided)</li>
                  <li>College name, year of study, and branch</li>
                  <li>For alumni: graduation details, company name, and job role</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">b. Usage Data</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>Login times, pages visited, search activity, and interactions on the platform</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">c. Content Information</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>Interview experiences, resources, feedback, ratings, and mentorship activity shared by users</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">d. Device & Technical Data</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>Browser type, IP address, and device identifiers used for analytics and security</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              2️⃣ How We Use Your Information
            </h2>
            <p className="text-gray-700 mb-2">Your information is used to:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Create and manage your ConnectEDu account</li>
              <li>Match students with relevant alumni based on college or domain</li>
              <li>Facilitate mentorship sessions and communication</li>
              <li>Display alumni profiles and leaderboard rankings</li>
              <li>Analyze usage to improve platform features and user experience</li>
              <li>Ensure data security and prevent fraudulent or abusive activities</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              3️⃣ Data Sharing and Disclosure
            </h2>
            <p className="text-gray-700 mb-2">
              We do not sell, rent, or trade your data to any third parties. However, we may share limited information:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>With other users (e.g., alumni contact info only after mentorship acceptance)</li>
              <li>With trusted service providers (for hosting, analytics, and payment processing)</li>
              <li>When required by law, court order, or government request</li>
            </ul>
            <p className="text-gray-700 mt-3">
              All third-party partners comply with strict data protection standards.
            </p>
          </div>

          {/* Section 4 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              4️⃣ Data Security
            </h2>
            <p className="text-gray-700 mb-2">Your privacy is our priority. We use:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Encrypted databases (MongoDB) for secure data storage</li>
              <li>HTTPS and SSL protocols for data transfer</li>
              <li>Access control and authentication systems</li>
            </ul>
            <p className="text-gray-700 mt-3">
              While we follow industry best practices, no system is 100% secure. Users are encouraged to protect their credentials.
            </p>
          </div>

          {/* Section 5 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              5️⃣ Cookies and Tracking
            </h2>
            <p className="text-gray-700 mb-2">ConnectEDu uses cookies and analytics tools to:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Maintain login sessions</li>
              <li>Track user engagement</li>
              <li>Personalize content and recommendations</li>
            </ul>
            <p className="text-gray-700 mt-3">
              You can manage cookie preferences through your browser settings.
            </p>
          </div>

          {/* Section 6 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              6️⃣ User Rights and Control
            </h2>
            <p className="text-gray-700 mb-2">As a user, you have the right to:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Access, update, or delete your profile information</li>
              <li>Request data export or account deletion</li>
              <li>Control what information is shared with others</li>
            </ul>
            <p className="text-gray-700 mt-3">
              To exercise these rights, contact us at connected.platform1250@gmail.com
            </p>
          </div>

          {/* Section 7 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              7️⃣ Retention of Data
            </h2>
            <p className="text-gray-700 mb-2">We retain user data only as long as necessary for:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Account functionality and record keeping</li>
              <li>Legal or regulatory compliance</li>
            </ul>
            <p className="text-gray-700 mt-3">
              Once your account is deleted, associated personal data will be permanently removed from our active systems within a reasonable timeframe.
            </p>
          </div>

          {/* Section 8 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              8️⃣ Communication and Notifications
            </h2>
            <p className="text-gray-700 mb-2">We may send you:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Important service updates (mandatory)</li>
              <li>Mentorship notifications and reminders</li>
              <li>Occasional announcements or feature updates</li>
            </ul>
            <p className="text-gray-700 mt-3">
              You can opt out of non-essential emails anytime.
            </p>
          </div>

          {/* Section 9 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              9️⃣ Third-Party Links
            </h2>
            <p className="text-gray-700 leading-relaxed">
              ConnectEDu may include links to external websites (e.g., resources, company sites). We are not responsible for their privacy practices or content. Please review their respective privacy policies.
            </p>
          </div>

          {/* Section 10 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              🔟 Updates to This Policy
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy periodically. Changes will be posted on this page with the revised date. Continued use of ConnectEDu after updates implies acceptance of the new terms.
            </p>
          </div>

          {/* Section 11 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              11️⃣ Contact Us
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have any questions or concerns regarding this Privacy Policy, contact us at:
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact Support
            </Link>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition-colors duration-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default PrivacyPolicyPage;
