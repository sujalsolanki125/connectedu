import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../redux/slices/authSlice';

const RegisterGoogle = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [role, setRole] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const tempUserId = searchParams.get('tempUserId');
    const name = searchParams.get('name');
    const email = searchParams.get('email');
    const googleId = searchParams.get('googleId');
    const avatar = searchParams.get('avatar');

    

    if (!tempUserId || !name || !email || !googleId) {
      setError('Invalid registration link. Please try signing up with Google again.');
      return;
    }
    
    setUserData({ tempUserId, name, email, googleId, avatar });
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!role) {
      setError('Please select a role to continue.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      
      
      const { data } = await axios.post('${process.env.BACKEND_URL}/api/auth/register-google', {
        tempUserId: userData.tempUserId,
        role,
      });
      
      
      
      dispatch(setCredentials(data));

      // Redirect to complete profile
      if (data.role === 'student') {
        navigate('/complete-profile');
      } else if (data.role === 'alumni') {
        navigate('/complete-alumni-profile');
      } else {
        navigate('/'); // Fallback
      }

    } catch (err) {
      // Error handled silently
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!userData && !error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-purple-50 to-secondary-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-2xl">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-secondary-500 rounded-full flex items-center justify-center">
              <span className="text-3xl">🎓</span>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Registration</h2>
          <p className="text-sm text-gray-600">Just one more step to get started!</p>
        </div>

        {userData && (
          <div className="text-center mb-6 p-4 bg-gray-50 rounded-lg">
            {userData.avatar && (
              <img 
                src={userData.avatar} 
                alt="Avatar" 
                className="w-16 h-16 rounded-full mx-auto mb-3 border-4 border-white shadow-lg" 
              />
            )}
            <p className="font-semibold text-lg text-gray-900">{userData.name}</p>
            <p className="text-sm text-gray-600">{userData.email}</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-gray-700 font-bold mb-3 text-center">
              Select Your Role
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  role === 'student' 
                    ? 'bg-primary-600 text-white border-primary-600 shadow-lg transform scale-105' 
                    : 'bg-white text-gray-700 border-gray-300 hover:border-primary-400'
                }`}
              >
                <div className="text-3xl mb-2">🎓</div>
                <div className="font-semibold">Student</div>
              </button>
              <button
                type="button"
                onClick={() => setRole('alumni')}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  role === 'alumni' 
                    ? 'bg-secondary-600 text-white border-secondary-600 shadow-lg transform scale-105' 
                    : 'bg-white text-gray-700 border-gray-300 hover:border-secondary-400'
                }`}
              >
                <div className="text-3xl mb-2">👔</div>
                <div className="font-semibold">Alumni</div>
              </button>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading || !role}
            className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-3 rounded-lg font-semibold hover:from-primary-700 hover:to-secondary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Registering...
              </span>
            ) : (
              'Complete Registration'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterGoogle;
