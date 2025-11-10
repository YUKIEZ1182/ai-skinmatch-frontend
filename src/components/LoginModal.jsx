import React, { useState } from "react";
import "../components/styles/LoginModal.css";

import Login from "../utils/Login.jsx";
import Register from "../utils/Register.jsx";
import PersonalInfo from "../utils/PersonalInfo.jsx";

function LoginModal({ isOpen, onClose, showNotification, onLoginSuccess }) {
  const [view, setView] = useState('login');
  const switchToRegister = () => setView('register');
  const switchToLogin = () => setView('login');
  const switchToPersonalInfo = () => setView('personalInfo');


  if (!isOpen) {return null;}
  const handleModalContentClick = (e) => { e.stopPropagation(); };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={handleModalContentClick}>

        <button type="button" className="close-modal-btn" onClick={onClose}>
        </button>
        {view === 'login' && (
          <Login
            onSwitchToRegister={switchToRegister}
            onClose={onClose}
            onLoginSuccess={onLoginSuccess}
          />
        )}
        {view === 'register' && (
          <Register 
            onSwitchToLogin={switchToLogin} 
            onClose={onClose} 
            onSwitchToPersonalInfo={switchToPersonalInfo}
            showNotification={showNotification}
          />
        )}

        {view === 'personalInfo' && (
          <PersonalInfo
            onSwitchBackToRegister={switchToRegister}
            onClose={onClose}
            showNotification={showNotification}
          />
        )}
        
      </div>
    </div>
  );
}

export default LoginModal;
