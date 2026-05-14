import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';
import logoImage from '../Images/Logo.png';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);

  // Re-check auth state whenever the route changes
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const role  = sessionStorage.getItem('role');
    setIsLoggedIn(!!token);
    setUserRole(role);
  }, [location]);

  const handleLogout = () => {
    sessionStorage.clear();
    setIsLoggedIn(false);
    setUserRole(null);
    setMenuOpen(false);
    navigate('/');
  };

  const getDashboardPath = () => {
    switch (userRole) {
      case 'customer': return '/customer-dashboard';
      case 'provider': return '/provider-dashboard';
      case 'driver':   return '/driver-dashboard';
      case 'admin':    return '/admin-dashboard';
      default:         return '/';
    }
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      {/* Logo */}
      <Link to="/" className="navbar-logo" onClick={closeMenu}>
        <img src={logoImage} alt="Tiffin Connect" />
      </Link>

      {/* Desktop links */}
      <div className="nav-links">
        {isLoggedIn ? (
          <>
            <Link to={getDashboardPath()} className="nav-link">
              Dashboard
            </Link>
            <span className="nav-role-badge">{userRole}</span>
            <button onClick={handleLogout} className="nav-btn-logout">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login"    className="nav-link">Login</Link>
            <Link to="/register" className="nav-btn-register">Get Started</Link>
          </>
        )}
      </div>

      {/* Mobile hamburger */}
      <button
        className={`hamburger ${menuOpen ? 'open' : ''}`}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        <span /><span /><span />
      </button>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="mobile-menu">
          {isLoggedIn ? (
            <>
              <Link to={getDashboardPath()} className="mobile-link" onClick={closeMenu}>
                Dashboard
              </Link>
              <button onClick={handleLogout} className="mobile-link logout">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login"    className="mobile-link" onClick={closeMenu}>Login</Link>
              <Link to="/register" className="mobile-link register" onClick={closeMenu}>Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;