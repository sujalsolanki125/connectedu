import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../redux/slices/authSlice';

const GoogleAuthCallback = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (token) {
      // Store token and get user info
      localStorage.setItem('token', token);

      // Decode the token to get user info (JWT contains user data)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        
        // Fetch full user profile
        fetch(`${process.env.REACT_APP_API_URL || '${process.env.BACKEND_URL}'}/api/auth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then(res => res.json())
          .then(user => {
            dispatch(setCredentials({ ...user, token }));
            
            
            
            
            // Check if profile is complete first
            if (user.isProfileComplete === false) {
              // Redirect to profile completion page
              const profilePath = user.role === 'student' 
                ? '/complete-profile' 
                : user.role === 'alumni'
                ? '/complete-alumni-profile'
                : '/';
              
              
              navigate(profilePath);
            } else {
              // Navigate to dashboard if profile is complete
              const redirectPath = user.role === 'student' 
                ? '/student-dashboard' 
                : user.role === 'alumni'
                ? '/alumni-dashboard'
                : '/admin-dashboard';
              
              
              navigate(redirectPath);
            }
          })
          .catch(err => {
            // Error handled silently
            navigate('/login?error=profile_fetch_failed');
          });
      } catch (err) {
        // Error handled silently
        navigate('/login?error=invalid_token');
      }
    } else if (error) {
      navigate(`/login?error=${error}`);
    } else {
      navigate('/login');
    }
  }, [searchParams, navigate, dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700">Completing Google Sign In...</h2>
        <p className="text-gray-500 mt-2">Please wait while we set up your account.</p>
      </div>
    </div>
  );
};

export default GoogleAuthCallback;
