import React, { useState } from "react";
import "../components/styles/Footer.css";
import logo from "../assets/logo.png";

function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (newsletterEmail) {
      console.log('Subscribe email:', newsletterEmail);
      setNewsletterEmail('');
      alert('ขอบคุณสำหรับการติดตาม!');
    } else {
      alert('กรุณากรอกอีเมล');
    }
  };

  return (
    <footer className="site-footer">
      <div className="footer-content">

        <div className="footer-logo-section">
          <div className="logo-container">
             <img src={logo} alt="ai_skinmatch Logo" className="logo-image" />
             <span className="logo-text">ai_skinmatch</span>
          </div>
          <a href="#" target="_blank" rel="noopener noreferrer" className="social-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
            </svg>
          </a>
        </div>

        <div className="footer-links-section">
          <div className="link-column">
            <h4>ข้อมูล</h4>
            <ul>
              <li><a href="/about">เกี่ยวกับเรา</a></li>
              <li><a href="/privacy">นโยบายความเป็นส่วนตัว</a></li>
              <li><a href="/contact">ติดต่อเรา</a></li>
            </ul>
          </div>
          <div className="link-column">
            <h4>ติดตามเรา</h4>
            <ul>
              <li><a href="#" target="_blank" rel="noopener noreferrer">Facebook</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-newsletter-section">
          <h4>ติดตามเรา</h4>
          <p>สมัครรับข่าวสาร</p>
          <form className="newsletter-form" onSubmit={handleSubscribe}>
            <input
              type="email"
              placeholder="Email address"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              required
            />
            <button type="submit">Subscribe</button>
          </form>
        </div>

      </div>
    </footer>
  );
}

export default Footer;
