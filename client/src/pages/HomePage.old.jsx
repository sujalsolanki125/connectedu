import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const HomePage = () => {
  const { userInfo } = useSelector((state) => state.auth);

  return (
    <div className="home-page">
      <div className="hero-section">
        <h1>Welcome to Alumni Connect</h1>
        <p>Your comprehensive platform for career growth and placement preparation</p>
        {!userInfo && (
          <div className="cta-buttons">
            <Link to="/register" className="btn btn-primary">
              Get Started
            </Link>
            <Link to="/login" className="btn btn-secondary">
              Login
            </Link>
          </div>
        )}
      </div>
      
      <div className="features-section">
        <h2>Platform Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Interview Experiences</h3>
            <p>Read and share real interview questions, answers, and feedback from alumni placed in various companies</p>
            {userInfo && <Link to="/interviews" className="feature-link">Explore →</Link>}
          </div>

          <div className="feature-card">
            <div className="feature-icon">💼</div>
            <h3>Company Insights</h3>
            <p>Get detailed information about company expectations, recruitment patterns, and role-specific requirements</p>
            {userInfo && <Link to="/company-insights" className="feature-link">View Insights →</Link>}
          </div>

          <div className="feature-card">
            <div className="feature-icon">🎤</div>
            <h3>Mock Interview Sessions</h3>
            <p>Schedule live and recorded mock interviews with experienced alumni and mentors for skill improvement</p>
            {userInfo && <Link to="/mock-interviews" className="feature-link">Book Session →</Link>}
          </div>

          <div className="feature-card">
            <div className="feature-icon">🧠</div>
            <h3>Mentorship Guidance</h3>
            <p>Get personalized career guidance, preparation strategies, and tips from industry professionals</p>
            {userInfo && <Link to="/mentorship" className="feature-link">Find Mentor →</Link>}
          </div>

          <div className="feature-card">
            <div className="feature-icon">⭐</div>
            <h3>Q&A Community</h3>
            <p>Ask questions, get answers from alumni, rate helpful content, and engage with the community</p>
            {/* Q&A feature removed */}
          </div>

          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Placement Resources</h3>
            <p>Access resume templates, aptitude practice, soft skill videos, and preparation roadmaps</p>
            {userInfo && <Link to="/resources" className="feature-link">Browse Resources →</Link>}
          </div>

          <div className="feature-card">
            <div className="feature-icon">🏆</div>
            <h3>Leaderboard & Recognition</h3>
            <p>Track contributions, earn badges, compete on rankings, and celebrate community achievements</p>
            {userInfo && <Link to="/leaderboard" className="feature-link">View Rankings →</Link>}
          </div>
        </div>
      </div>

      <div className="stats-section">
        <h2>Platform Impact</h2>
        <div className="stats-grid">
          <div className="stat-item">
            <h3>1000+</h3>
            <p>Interview Experiences</p>
          </div>
          <div className="stat-item">
            <h3>500+</h3>
            <p>Alumni Mentors</p>
          </div>
          <div className="stat-item">
            <h3>2000+</h3>
            <p>Active Students</p>
          </div>
          <div className="stat-item">
            <h3>100+</h3>
            <p>Companies Covered</p>
          </div>
        </div>
      </div>

      <div className="cta-section">
        <h2>Ready to Start Your Journey?</h2>
        <p>Join thousands of students and alumni connecting for career success</p>
        {!userInfo && (
          <Link to="/register" className="btn btn-large btn-primary">
            Create Account
          </Link>
        )}
      </div>
    </div>
  );
};

export default HomePage;
