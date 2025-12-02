import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';

export default function Navbar({ isAuthenticated, onLoginClick }) { 
  const navigate = useNavigate();

  const handleAccountClick = () => {
    if (isAuthenticated) {
      alert('พาไปหน้า "บัญชีของฉัน"');
    } else {
      onLoginClick();
    }
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo-area">
        <img src="/favicon.png" alt="Logo" className="logo-img" />
        <span className="brand-text">ai_skinmatch</span>
      </Link>
      
      <div className="nav-actions">
        <Link to="/cart" className="action-item">
          <div className="icon-wrapper">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
            <span className="cart-badge">2</span>
          </div>
          <span className="nav-label">ถุงช้อปปิ้ง</span>
        </Link>
        
        <div className="action-item" onClick={handleAccountClick}> 
          <div className="icon-wrapper">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </div>
          <span className="nav-label">บัญชีของฉัน</span>
        </div>
      </div>
    </nav>
  );
}