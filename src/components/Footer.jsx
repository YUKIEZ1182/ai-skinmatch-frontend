import React from "react";
import "../styles/Footer.css"; // ✅ อย่าลืม import CSS

export default function Footer() {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        
        {/* คอลัมน์ 1: แบรนด์ */}
        <div className="footer-brand">
          <div className="brand-logo-group">
            {/* โลโก้วงกลม (ใช้ Placeholder หรือรูปจริงถ้ามี) */}
            <div className="footer-logo-circle">
               <img src="/favicon.png" alt="Logo" className="footer-logo-img" />
            </div>
            <span className="footer-brand-name">ai_skinmatch</span>
          </div>
          {/* ไอคอน Facebook */}
          <div className="social-icons">
             <a 
               href="http://web.facebook.com/wayofficial.th" 
               target="_blank" 
               rel="noopener noreferrer"
               style={{ display: 'inline-block' }}
             >
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#555" className="social-icon">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
               </svg>
             </a>
          </div>
        </div>

        {/* คอลัมน์ 2: ข้อมูล */}
        <div className="footer-links">
          <h3 className="footer-heading">ข้อมูล</h3>
          <ul className="footer-list">
            <li><a href="#">เกี่ยวกับเรา</a></li>
            <li><a href="#">นโยบายความเป็นส่วนตัว</a></li>
            <li><a href="#">ติดต่อเรา</a></li>
          </ul>
        </div>

        {/* คอลัมน์ 3: ติดตามเรา */}
        <div className="footer-links">
          <h3 className="footer-heading">ติดตามเรา</h3>
          <ul className="footer-list">
            <li><a href="#">Facebook</a></li>
          </ul>
        </div>

        {/* คอลัมน์ 4: สมัครข่าวสาร */}
        <div className="footer-newsletter">
          <h3 className="footer-heading">ติดตามเรา</h3>
          <p className="newsletter-text">สมัครรับข่าวสาร</p>
          <div className="newsletter-form">
            <input 
              type="email" 
              placeholder="Email address" 
              className="newsletter-input"
            />
            <button className="subscribe-btn">Subscribe</button>
          </div>
        </div>

      </div>
    </footer>
  );
}