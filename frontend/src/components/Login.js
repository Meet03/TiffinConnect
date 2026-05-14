import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faEnvelope, faLock, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import './Auth.css';

const Login = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('role', data.role);

      const routes = {
        customer: '/customer-dashboard',
        provider: '/provider-dashboard',
        driver:   '/driver-dashboard',
        admin:    '/admin-dashboard',
      };
      navigate(routes[data.role] || '/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      {/* Left panel */}
      <div className="auth-panel-left">
        <div className="auth-panel-left-content">
          <div className="auth-brand-tag">Tiffin Connect</div>
          <h1>Fresh meals,<br />delivered daily.</h1>
          <p>Join hundreds of happy customers enjoying home-cooked tiffins from trusted local providers.</p>
          <div className="auth-testimonial">
            <div className="auth-testimonial-text">"Best tiffin service in Mississauga — feels like home cooking every single day!"</div>
            <div className="auth-testimonial-author">— Priya S., Customer</div>
          </div>
        </div>
        <div className="auth-panel-deco d1" />
        <div className="auth-panel-deco d2" />
      </div>

      {/* Right panel */}
      <div className="auth-panel-right">
        <div className="auth-form-box">
          <h2 className="auth-title">Welcome back</h2>
          <p className="auth-subtitle">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit} className="auth-form">

            {/* Email */}
            <div className="auth-field">
              <label>Email address</label>
              <div className="auth-input-wrap">
                <FontAwesomeIcon icon={faEnvelope} className="auth-input-icon" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password — uses flex wrapper, no absolute positioning */}
            <div className="auth-field">
              <label>Password</label>
              <div className="auth-password-wrap">
                <FontAwesomeIcon icon={faLock} className="auth-input-icon" />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowPass(!showPass)}
                  tabIndex={-1}
                >
                  <FontAwesomeIcon icon={showPass ? faEyeSlash : faEye} />
                </button>
              </div>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? (
                <span className="auth-spinner" />
              ) : (
                <>Sign In <FontAwesomeIcon icon={faArrowRight} /></>
              )}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account?{' '}
            <Link to="/register">Create one for free</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;