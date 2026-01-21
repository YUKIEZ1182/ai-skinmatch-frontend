import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types'; // 1. นำเข้า PropTypes
import '../styles/AlertBanner.css';

export default function AlertBanner({ message, type = 'success', onClose }) {
  const [isClosing, setIsClosing] = useState(false);
  const isObject = typeof message === 'object' && message !== null;
  const displayMessage = isObject ? message.text : message;
  const finalType = isObject ? (message.type || type) : (type || 'success');

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300);
  };

  const alertConfig = {
    success: {
      title: 'Success',
      iconPath: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
    },
    warning: {
      title: 'Warning',
      iconPath: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
    },
    error: {
      title: 'Error',
      iconPath: "M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"
    }
  };

  const currentConfig = alertConfig[finalType] || alertConfig.success;

  return (
    <div className={`alert-banner-card alert-${finalType} ${isClosing ? 'closing' : ''}`}>
      <div className="alert-icon-box">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d={currentConfig.iconPath} />
        </svg>
      </div>
      <div className="alert-content">
        <div className="alert-title">{currentConfig.title}</div>
        <div className="alert-message">{displayMessage}</div>
      </div>
      <button className="alert-close-btn" onClick={handleClose}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  );
}

AlertBanner.propTypes = {
  message: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      text: PropTypes.string,
      type: PropTypes.string,
    }),
  ]).isRequired,

  type: PropTypes.oneOf(['success', 'warning', 'error']),
  onClose: PropTypes.func,
};