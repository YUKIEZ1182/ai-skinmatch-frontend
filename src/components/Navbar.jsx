import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';

const MOCK_CART_KEY = 'mock_cart';

/**
 * ✅ นับ "จำนวนรายการ" (unique items) ไม่ใช่ sum quantity
 */
const readMockCartUniqueCount = () => {
  try {
    const raw = localStorage.getItem(MOCK_CART_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(arr)) return 0;

    const uniq = new Set(
      arr
        .filter(Boolean)
        .map((x) => String(x?.productId ?? x?.id ?? ''))
        .filter(Boolean),
    );

    return uniq.size;
  } catch {
    return 0;
  }
};

export default function Navbar({
  isAuthenticated,
  user,
  onLoginClick,
  onLogout,

  // 🟡 เดิมชื่อ cartItemCount (App อาจส่งเป็น qty sum หรือ unique ก็ได้)
  cartItemCount,

  // ✅ แนะนำ: ถ้าเธอแก้ App ได้ ส่งค่านี้มาเลยจะตรงสุด
  cartUniqueCount,
}) {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // ✅ badge count สำหรับ mock (unique)
  const [mockUniqueCount, setMockUniqueCount] = useState(() => readMockCartUniqueCount());

  const openLogin = () => {
    if (typeof onLoginClick === 'function') onLoginClick();
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ✅ ฟัง event ที่เรายิงไว้ใน ProductDetail/Cart/etc.
  useEffect(() => {
    const onCartUpdated = () => setMockUniqueCount(readMockCartUniqueCount());
    window.addEventListener('cart-updated', onCartUpdated);
    window.addEventListener('storage', onCartUpdated);
    return () => {
      window.removeEventListener('cart-updated', onCartUpdated);
      window.removeEventListener('storage', onCartUpdated);
    };
  }, []);

  const handleAccountClick = (e) => {
    e?.preventDefault?.();
    if (isAuthenticated) setIsDropdownOpen((prev) => !prev);
    else openLogin();
  };

  const handleLogoutClick = () => {
    setIsDropdownOpen(false);
    if (typeof onLogout === 'function') onLogout();
  };

  const handleCartClick = (e) => {
    e.preventDefault();
    const hasMock = readMockCartUniqueCount() > 0;

    if (isAuthenticated || hasMock) navigate('/cart');
    else openLogin();
  };

  const handleLogoClick = () => {
    setIsDropdownOpen(false);
    window.scrollTo(0, 0);
  };

  /**
   * ✅ Count ที่โชว์บน badge (นับเป็น "รายการ")
   * 1) cartUniqueCount (จาก App) -> ชัวร์สุด
   * 2) login + cartItemCount -> ใช้ได้ ถ้า App ส่งมาเป็น "จำนวนรายการ"
   * 3) fallback -> mock unique
   */
  const displayCartCount = useMemo(() => {
    const fromAppUnique = Number(cartUniqueCount || 0);
    if (fromAppUnique > 0) return fromAppUnique;

    const fromApp = Number(cartItemCount || 0);
    if (isAuthenticated && fromApp > 0) return fromApp;

    return Number(mockUniqueCount || 0);
  }, [cartUniqueCount, cartItemCount, mockUniqueCount, isAuthenticated]);

  return (
    <nav className="navbar-container">
      <div className="navbar-content">
        <Link to="/" className="navbar-logo" onClick={handleLogoClick}>
          <div className="logo-circle">
            <img
              src="/logo.png"
              alt="WAY Logo"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                borderRadius: '50%',
              }}
            />
          </div>
          <span className="logo-text">WAY OFFICIAL</span>
        </Link>

        <div className="navbar-actions">
          {/* CART */}
          <div
            className="nav-action-item"
            onClick={handleCartClick}
            role="button"
            tabIndex={0}
            style={{ cursor: 'pointer' }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') handleCartClick(e);
            }}
          >
            <div className="cart-icon-wrapper">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>

              {displayCartCount > 0 && <span className="cart-badge">{displayCartCount}</span>}
            </div>
            <span className="nav-label">ถุงชอปปิง</span>
          </div>

          {/* ACCOUNT */}
          <div className="nav-action-item account-dropdown-container" ref={dropdownRef}>
            <div
              className="account-trigger"
              onClick={handleAccountClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleAccountClick(e);
                if (e.key === 'Escape') setIsDropdownOpen(false);
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>

              <span className="nav-label">
                {isAuthenticated && user?.first_name ? user.first_name : 'บัญชีของฉัน'}
              </span>
            </div>

            {isAuthenticated && isDropdownOpen && (
              <div className="nav-dropdown-menu">
                <div className="dropdown-arrow"></div>

                <Link to="/account" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ marginRight: 8 }}
                  >
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  บัญชีของฉัน
                </Link>

                <div className="dropdown-divider"></div>

                <button className="dropdown-item text-red" onClick={handleLogoutClick} type="button">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ marginRight: 8 }}
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
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
