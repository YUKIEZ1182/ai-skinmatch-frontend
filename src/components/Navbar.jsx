import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';

// ✅ เพิ่ม 'user' ใน props
export default function Navbar({ isAuthenticated, user, onLoginClick, onLogout, cartItemCount }) {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const handleAccountClick = () => {
    if (isAuthenticated) {
      setIsDropdownOpen(!isDropdownOpen);
    } else {
      onLoginClick();
    }
  };

  const handleLogoutClick = () => { setIsDropdownOpen(false); onLogout();};

  const handleCartClick = (e) => {
    e.preventDefault();
    if (isAuthenticated) {
      navigate('/cart');
    } else {
      onLoginClick();
    }
  };

  return (
    <nav className="navbar-container">
      <div className="navbar-content">
        <Link to="/" className="navbar-logo">
          <div className="logo-circle">
            <img src="/favicon.png" alt="WAY Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }} />
          </div>
          <span className="logo-text">ai_skinmatch</span>
        </Link>
        <div className="navbar-actions">
          <div className="nav-action-item" onClick={handleCartClick} style={{ cursor: 'pointer' }}>
            <div className="cart-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
              {cartItemCount > 0 && <span className="cart-badge">{cartItemCount}</span>}
            </div>
            <span className="nav-label">ถุงช้อปปิ้ง</span>
          </div>
          <div className="nav-action-item account-dropdown-container" ref={dropdownRef}>
            <div className="account-trigger" onClick={handleAccountClick}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              
              {/* ✅ แก้ไขตรงนี้: โชว์ชื่อ User ถ้ามี */}
              <span className="nav-label">
                {isAuthenticated && user?.first_name ? user.first_name : "บัญชีของฉัน"}
              </span>

            </div>
            {isAuthenticated && isDropdownOpen && (
              <div className="nav-dropdown-menu">
                <div className="dropdown-arrow"></div>
                <Link to="/account" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:8}}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  ตั้งค่าบัญชี
                </Link>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item text-red" onClick={handleLogoutClick}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:8}}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                  ออกจากระบบ
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}