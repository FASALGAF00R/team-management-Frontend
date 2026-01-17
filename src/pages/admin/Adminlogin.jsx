import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (error) setError('');
  };

  // Direct API call function
  const loginAdmin = async (email, password) => {
    try {
      // Your API endpoint
      const API_URL = 'http://localhost:5000/api/auth/login'; 
      
      const response = await axios.post(API_URL, {
        email,
        password
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      });

      console.log(response.data.token,"ioioioio");
      
      return response.data;
      
    } catch (error) {
      throw error;
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      // Call the login API directly
      const result = await loginAdmin(formData.email, formData.password);
      
      // Store the authentication data
      if (result.success) {
        // Store token and user data in localStorage
        localStorage.setItem('token', result.token);  // For consistency across all pages
        localStorage.setItem('adminToken', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        localStorage.setItem('adminUser', JSON.stringify(result.user));
        
        // Store remember me preference
        if (formData.rememberMe) {
          localStorage.setItem('rememberAdmin', 'true');
          localStorage.setItem('adminEmail', formData.email);
        } else {
          localStorage.removeItem('rememberAdmin');
          localStorage.removeItem('adminEmail');
        }
        
        // Store token timestamp for expiration check
        localStorage.setItem('tokenTimestamp', Date.now().toString());
        
        // Redirect to admin dashboard
        navigate('/admin/dashboard', { replace: true });
        
      } else {
        setError(result.message || 'Login failed');
      }
      
    } catch (err) {
      // Handle different types of errors
      if (err.response) {
        // Server responded with error status
        switch (err.response.status) {
          case 400:
            setError('Invalid email or password format');
            break;
          case 401:
            setError('Invalid credentials. Please try again.');
            break;
          case 403:
            setError('Access denied. You do not have admin privileges.');
            break;
          case 404:
            setError('Admin account not found');
            break;
          case 429:
            setError('Too many login attempts. Please try again later.');
            break;
          case 500:
            setError('Server error. Please try again later.');
            break;
          default:
            setError(err.response.data?.message || 
                    err.response.data?.error || 
                    'Login failed. Please check your credentials.');
        }
      } else if (err.request) {
        // Request was made but no response received
        if (err.code === 'ECONNABORTED') {
          setError('Request timeout. Please check your connection and try again.');
        } else {
          setError('Network error. Please check your internet connection.');
        }
      } else {
        // Other errors
        setError('An error occurred. Please try again.');
      }
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Demo login with mock API call (for testing)
  const handleDemoLogin = async () => {
    setFormData({
      email: 'admin@example.com',
      password: 'admin123',
      rememberMe: true
    });
    
    // Optional: Auto-login with demo credentials
    // setTimeout(() => {
    //   handleSubmit(new Event('submit'));
    // }, 500);
  };

  // Forgot password handler
  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        {/* Left side - Illustration/Info */}
        <div className="login-left">
          <div className="login-brand">
            <div className="brand-logo">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <rect width="40" height="40" rx="8" fill="#3b82f6"/>
                <path d="M20 12L26 18L20 24L14 18L20 12Z" fill="white"/>
                <circle cx="20" cy="20" r="4" fill="#1d4ed8"/>
              </svg>
            </div>
            <h1 className="brand-title">Admin Portal</h1>
            <p className="brand-subtitle">Secure Access to System Administration</p>
          </div>

          <div className="login-features">
            <div className="feature-item">
              <div className="feature-icon">🔐</div>
              <div>
                <h3>Secure Authentication</h3>
                <p>Enterprise-grade security with encrypted sessions</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">📊</div>
              <div>
                <h3>System Dashboard</h3>
                <p>Complete overview of your platform metrics</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">⚙️</div>
              <div>
                <h3>Full Control</h3>
                <p>Manage users, roles, teams, and system settings</p>
              </div>
            </div>
          </div>

          <div className="login-footer">
            <p>© 2024 Admin System. All rights reserved.</p>
            <div className="footer-links">
              <a href="/privacy">Privacy Policy</a>
              <a href="/terms">Terms of Service</a>
              <a href="/support">Support</a>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="login-right">
          <div className="login-form-wrapper">
            <div className="form-header">
              <h2>Welcome Back</h2>
              <p>Sign in to your admin account</p>
            </div>

            {error && (
              <div className="error-alert">
                <span className="error-icon">⚠️</span>
                <span>{error}</span>
                <button 
                  onClick={() => setError('')}
                  className="error-close"
                >
                  ✕
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="email">
                  <span className="label-icon">📧</span>
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="admin@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  disabled={loading}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">
                  <span className="label-icon">🔒</span>
                  Password
                </label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    className="form-input"
                    disabled={loading}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <div className="form-options">
                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <label htmlFor="rememberMe">Remember me</label>
                </div>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="forgot-link"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                className="login-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>

              {/* Demo login button (remove in production) */}
              <button
                type="button"
                className="demo-button"
                onClick={handleDemoLogin}
                disabled={loading}
              >
                Use Demo Credentials
              </button>

              <div className="form-divider">
                <span>OR</span>
              </div>

              <div className="alternative-login">
                <p>
                  Need help? <Link to="/support">Contact Support</Link>
                </p>
                <p>
                  Not an admin? <Link to="/user-login">User Login</Link>
                </p>
              </div>
            </form>

            <div className="security-info">
              <p className="security-text">
                🔒 Your login is secured with 256-bit SSL encryption
              </p>
              <p className="security-note">
                All credentials are encrypted during transmission
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;