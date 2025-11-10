import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import cartIcon from "../assets/shopping-bag.png";
import userIcon from "../assets/user-icon.png";
import "../theme.css";

function Header({ cartItemCount = 0 }) {
  return (
    <header className="main-header">
      {/* โลโก้ฝั่งซ้าย */}
      <a href="/" className="header-logo" style={{ display: "flex", alignItems: "center", textDecoration: "none", color: "white" }}>
        <img src={logo} alt="ai_skinmatch Logo" className="logo-image" style={{ height: "40px", marginRight: "10px" }} />
        <span className="logo-text" style={{ fontSize: "1.4rem", fontWeight: "600" }}>ai_skinmatch</span>
      </a>

      {/* เมนูฝั่งขวา */}
      <nav className="header-nav">
        <ul style={{ display: "flex", listStyle: "none", gap: "1.8rem", margin: 0, padding: 0, alignItems: "center" }}>
          <li>
            <Link
              to="/cart"
              className="cart-link"
              style={{ display: "flex", alignItems: "center", gap: "8px", color: "white", textDecoration: "none", position: "relative" }}
            >
              <img src={cartIcon} alt="Shopping Bag" style={{ width: "22px" }} />
              <span className="nav-text">ถุงช้อปปิ้ง</span>
              {cartItemCount > 0 && (
                <span
                  className="cart-badge"
                  style={{
                    position: "absolute",
                    top: "-6px",
                    right: "-10px",
                    backgroundColor: "var(--color-highlight)",
                    borderRadius: "50%",
                    padding: "2px 6px",
                    fontSize: "12px",
                    color: "white",
                  }}
                >
                  {cartItemCount}
                </span>
              )}
            </Link>
          </li>

          <li>
            <Link
              to="/account"
              style={{ display: "flex", alignItems: "center", gap: "8px", color: "white", textDecoration: "none" }}
            >
              <img src={userIcon} alt="User Account" style={{ width: "22px" }} />
              <span className="nav-text">บัญชีของฉัน</span>
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
