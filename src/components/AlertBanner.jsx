import React, { useState, useEffect } from "react";
import "../components/styles/AlertBanner.css";

function AlertBanner({ message, type = 'info', duration = 3000, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [message, duration]);

  const handleClose = () => {
    setVisible(false);
    if (onClose) {
      onClose();
    }
  };

  if (!visible) {
    return null;
  }

  const alertBannerClasses = `alert-banner ${type}`;

  return (
    <div className={alertBannerClasses}>
      <span>{message}</span>
      <button onClick={handleClose} className="close-btn">&times;</button>
    </div>
  );
}

export default AlertBanner;
