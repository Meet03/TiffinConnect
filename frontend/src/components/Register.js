import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEye, faEyeSlash, faEnvelope, faLock, faUser,
  faArrowRight, faUtensils, faTruck, faShoppingBag, faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import './Register.css';

const ROLES = [
  { value: 'customer', label: 'Customer', icon: faShoppingBag, desc: 'Order daily tiffins' },
  { value: 'provider', label: 'Provider', icon: faUtensils,    desc: 'Sell your meals'    },
  { value: 'driver',   label: 'Driver',   icon: faTruck,       desc: 'Deliver orders'     },
];

const Register = () => {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole]         = useState('customer');
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }
      setSuccess('Account created! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reg-page">
      <div className="reg-card">

        <div className="reg-header">
          <div className="reg-logo-dot" />
          <h2>Create your account</h2>
          <p>Join the Tiffin Connect community today</p>
        </div>

        <form onSubmit={handleSubmit} className="reg-form">

          {/* Name + Email */}
          <div className="reg-row">
            <div className="reg-field">
              <label>Full Name</label>
              <div className="reg-input-box">
                <FontAwesomeIcon icon={faUser} className="reg-input-icon" />
                <input
                  type="text"
                  placeholder="Meet Amin"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="reg-field">
              <label>Email Address</label>
              <div className="reg-input-box">
                <FontAwesomeIcon icon={faEnvelope} className="reg-input-icon" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Password — separate structure with inline eye button */}
          <div className="reg-field">
            <label>Password</label>
            <div className="reg-password-box">
              <FontAwesomeIcon icon={faLock} className="reg-input-icon" />
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="reg-eye"
                onClick={() => setShowPass(!showPass)}
                tabIndex={-1}
              >
                <FontAwesomeIcon icon={showPass ? faEyeSlash : faEye} />
              </button>
            </div>
          </div>

          {/* Role */}
          <div className="reg-field">
            <label>I want to join as</label>
            <div className="reg-roles">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  className={`reg-role ${role === r.value ? 'active' : ''}`}
                  onClick={() => setRole(r.value)}
                >
                  <div className="reg-role-icon">
                    <FontAwesomeIcon icon={r.icon} />
                  </div>
                  <div className="reg-role-text">
                    <span className="reg-role-name">{r.label}</span>
                    <span className="reg-role-desc">{r.desc}</span>
                  </div>
                  {role === r.value && (
                    <FontAwesomeIcon icon={faCheckCircle} className="reg-role-check" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {error   && <div className="reg-error">{error}</div>}
          {success && <div className="reg-success">{success}</div>}

          <button type="submit" className="reg-submit" disabled={loading}>
            {loading
              ? <span className="reg-spinner" />
              : <> Create Account <FontAwesomeIcon icon={faArrowRight} /> </>
            }
          </button>
        </form>

        <p className="reg-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;