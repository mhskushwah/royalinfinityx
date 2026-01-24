import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaTachometerAlt, FaUsers, FaTree, FaInfoCircle, FaSignOutAlt } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const navRef = useRef(null);

  // ✅ Stable logout
  const handleLogout = useCallback(() => {
    localStorage.removeItem('userToken');
    sessionStorage.clear();
    setMenuOpen(false);
    navigate('/logout');
  }, [navigate]);

  // Logout on tab close / inactive
  useEffect(() => {
    const handleTabClose = () => handleLogout();
    const handleVisibilityChange = () => {
      if (document.hidden) handleLogout();
    };

    window.addEventListener('beforeunload', handleTabClose);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleTabClose);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleLogout]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  if (location.pathname === '/') return null;

  return (
    <nav ref={navRef} className="navbar">
      <div className="navbar-container">

        {/* Logo */}
        <div className="logo">
          <a href="https://royalinfinityx.vercel.app/" onClick={() => setMenuOpen(false)}>
            <img src="assets/RiseBNB_files/logo.png" className="h-14" alt="RiseBNB Logo" />
          </a>
        </div>

        {/* Menu Icon */}
        <div
          className="menu-icon"
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen(!menuOpen);
          }}
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </div>

        {/* Links */}
        <ul className={menuOpen ? 'nav-links active' : 'nav-links'}>
          <li><Link to="/dashboard" onClick={() => setMenuOpen(false)}><FaTachometerAlt /> Dashboard</Link></li>
          <li><Link to="/myteam" onClick={() => setMenuOpen(false)}><FaUsers /> My Team</Link></li>
          <li><Link to="/communitytree" onClick={() => setMenuOpen(false)}><FaTree /> Community Tree</Link></li>
          <li><Link to="/communityinfo" onClick={() => setMenuOpen(false)}><FaInfoCircle /> Community Info</Link></li>
          <li><Link to="/recentincome" onClick={() => setMenuOpen(false)}><FaTachometerAlt /> Recent Income</Link></li>
          <li><Link to="/royalty" onClick={() => setMenuOpen(false)}><FaTachometerAlt /> Royalty Income</Link></li>

          <li>
            <button className="nav-link logout-btn" onClick={handleLogout}>
              <FaSignOutAlt /> Logout
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
