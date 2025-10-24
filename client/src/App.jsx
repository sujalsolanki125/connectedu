import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './redux/store';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RegisterGoogle from './pages/RegisterGoogle';
import GoogleAuthCallback from './components/GoogleAuthCallback';
import EmailVerificationPage from './pages/EmailVerificationPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import StudentDashboard from './pages/student/StudentDashboard';
import AlumniDashboard from './pages/alumni/AlumniDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CompleteStudentProfile from './pages/CompleteStudentProfile';
import CompleteAlumniProfile from './pages/CompleteAlumniProfile';
import FindMentorPage from './pages/student/FindMentorPage';
import InterviewExperiencesPage from './pages/InterviewExperiencesPage';
import CompanyInsightsPage from './pages/CompanyInsightsPage';
import CreateCompanyInsight from './pages/CreateCompanyInsight';
import EditCompanyInsight from './pages/EditCompanyInsight';
import MentorshipPage from './pages/MentorshipPage';
import MentorshipDashboard from './pages/MentorshipDashboard';
import PlacementResourcesPage from './pages/PlacementResourcesPage';
import AdminResourcesPage from './pages/AdminResourcesPage';
import LeaderboardPage from './pages/LeaderboardPage';
import StudentProfilePage from './pages/StudentProfilePage';
import AlumniProfilePage from './pages/AlumniProfilePage';
import AlumniPublicProfilePage from './pages/AlumniPublicProfilePage';
import FAQPage from './pages/FAQPage';
import ContactPage from './pages/ContactPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/register-google" element={<RegisterGoogle />} />
            <Route path="/verify-email" element={<EmailVerificationPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/auth/google/success" element={<GoogleAuthCallback />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/terms" element={<TermsOfServicePage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            
            {/* Profile Completion Routes */}
            <Route
              path="/complete-profile"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <CompleteStudentProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/complete-alumni-profile"
              element={
                <ProtectedRoute allowedRoles={['alumni']}>
                  <CompleteAlumniProfile />
                </ProtectedRoute>
              }
            />
            
            {/* Protected Routes */}
            <Route
              path="/student-dashboard"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/find-mentor"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <FindMentorPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/alumni-dashboard"
              element={
                <ProtectedRoute allowedRoles={['alumni']}>
                  <AlumniDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Feature Pages - All Users */}
            {/* Interviews page - Not for alumni (they have it in their dashboard) */}
            <Route
              path="/interviews"
              element={
                <ProtectedRoute allowedRoles={['student', 'admin']}>
                  <InterviewExperiencesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/company-insights"
              element={
                <ProtectedRoute>
                  <CompanyInsightsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/company-insights/create"
              element={
                <ProtectedRoute allowedRoles={['alumni', 'admin']}>
                  <CreateCompanyInsight />
                </ProtectedRoute>
              }
            />
            <Route
              path="/company-insights/edit/:id"
              element={
                <ProtectedRoute allowedRoles={['alumni', 'admin']}>
                  <EditCompanyInsight />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mentorship"
              element={
                <ProtectedRoute>
                  <MentorshipPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mentorship-dashboard"
              element={
                <ProtectedRoute allowedRoles={['alumni', 'admin']}>
                  <MentorshipDashboard />
                </ProtectedRoute>
              }
            />
            <Route
                path="/qa"
                element={<Navigate to="/resources" replace />}
              />
              <Route
              path="/resources"
              element={
                <ProtectedRoute>
                  <PlacementResourcesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/resources"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminResourcesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leaderboard"
              element={
                <ProtectedRoute>
                  <LeaderboardPage />
                </ProtectedRoute>
              }
            />

            {/* Profile Pages */}
            <Route
              path="/student/profile"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/alumni/profile"
              element={
                <ProtectedRoute allowedRoles={['alumni']}>
                  <AlumniProfilePage />
                </ProtectedRoute>
              }
            />
            
            {/* Public Alumni Profile - View by ID */}
            <Route
              path="/alumni/:id"
              element={
                <ProtectedRoute>
                  <AlumniPublicProfilePage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </Provider>
  );
}

export default App;
