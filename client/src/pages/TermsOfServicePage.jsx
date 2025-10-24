import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

const TermsOfServicePage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📄 Terms and Conditions – ConnectEDu
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
              Welcome to ConnectEDu, a platform designed to connect college students with their verified alumni for mentorship, interview preparation, and career development. By accessing or using ConnectEDu, you agree to comply with and be bound by the following Terms and Conditions. Please read them carefully before using our services.
            </p>
          </div>

          {/* Section 1 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              1 Acceptance of Terms
            </h2>
            <p className="text-gray-700 leading-relaxed">
              By registering on ConnectEDu or using any part of our services, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions, along with our Privacy Policy.
            </p>
          </div>

          {/* Section 2 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              2 Eligibility
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li><strong>Students:</strong> Must be currently enrolled in a recognized college or university.</li>
              <li><strong>Alumni:</strong> Must have graduated from a verified institution and provide accurate professional details.</li>
              <li>You must be at least 18 years old to create an account or use mentorship services.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              3 Account Registration and Security
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Users must create an account by providing accurate personal and educational information.</li>
              <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
              <li>ConnectEDu is not liable for any unauthorized use of your account.</li>
              <li>Providing false information may lead to suspension or permanent termination of your account.</li>
            </ul>
          </div>

          {/* Section 4 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              4 Role and Responsibilities
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li><strong>Students:</strong> May explore alumni profiles, send mentorship requests, and participate in mock interviews or workshops.</li>
              <li><strong>Alumni:</strong> May share interview experiences, provide mentorship, conduct sessions (free or paid), and upload career resources.</li>
              <li>All users must communicate respectfully and maintain professional behavior at all times.</li>
            </ul>
          </div>

          {/* Section 5 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
             5 Mentorship and Payment Policy
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Alumni may choose to provide mentorship for free or charge a fee for specific sessions.</li>
              <li>Payment transactions (if enabled) are handled through secure third-party gateways.</li>
              <li>ConnectEDu does not guarantee any monetary, employment, or placement outcomes through mentorship sessions.</li>
            </ul>
          </div>

          {/* Section 6 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              6️ Content Sharing and Intellectual Property
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Users may share content such as interview experiences, resources, or career tips.</li>
              <li>By uploading content, you grant ConnectEDu a non-exclusive right to display and distribute it for educational purposes.</li>
              <li>Users are responsible for ensuring the authenticity and originality of the content they upload.</li>
              <li>Sharing confidential company information or violating NDAs is strictly prohibited.</li>
            </ul>
          </div>

          {/* Section 7 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              7️ Rating and Leaderboard System
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Students can rate alumni after mentorship sessions.</li>
              <li>Ratings, points, and leaderboard positions are calculated automatically based on activity and engagement.</li>
              <li>Manipulating the rating system or submitting false feedback may result in account suspension.</li>
            </ul>
          </div>

          {/* Section 8 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              8️ Data Privacy and Security
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>ConnectEDu values your privacy. All user data is stored securely in our database with encryption.</li>
              <li>Personal contact details (such as email or phone number) are shared only when a mentorship request is accepted.</li>
              <li>We do not sell or share user data with third parties for marketing purposes.</li>
              <li>Please refer to our Privacy Policy for full details.</li>
            </ul>
          </div>

          {/* Section 9 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              9️ Platform Usage Rules
            </h2>
            <p className="text-gray-700 mb-2">Users agree not to:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Misuse or exploit the platform for unauthorized purposes.</li>
              <li>Harass, abuse, or spam other users.</li>
              <li>Share misleading, offensive, or inappropriate content.</li>
              <li>Attempt to hack, reverse-engineer, or damage the website or database.</li>
            </ul>
            <p className="text-gray-700 mt-3">
              Violation of these rules can lead to temporary or permanent suspension of access.
            </p>
          </div>

          {/* Section 10 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              10 Limitation of Liability
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>ConnectEDu provides a platform for connection and mentorship but does not guarantee any job placement, internship, or outcome.</li>
              <li>The platform is not responsible for any direct, indirect, or consequential damages resulting from user interactions.</li>
              <li>Mentorship sessions are conducted at the discretion of the alumni and students involved.</li>
            </ul>
          </div>

          {/* Section 11 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              11 Modification of Terms
            </h2>
            <p className="text-gray-700 leading-relaxed">
              ConnectEDu reserves the right to modify or update these Terms and Conditions at any time. Changes will be effective immediately upon posting, and continued use of the platform implies acceptance of the revised terms.
            </p>
          </div>

          {/* Section 12 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              12️ Termination
            </h2>
            <p className="text-gray-700 leading-relaxed">
              ConnectEDu reserves the right to suspend or terminate any account found violating these Terms and Conditions or misusing the platform.
            </p>
          </div>

          {/* Section 13 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              13️ Contact Us
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              For any questions or concerns regarding these Terms, please contact us at:
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

export default TermsOfServicePage;
