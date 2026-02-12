import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import "./styles/App.css";

import Navbar from "./components/Navbar";
import Breadcrumb from "./components/Breadcrumb";
import AuthModal from "./components/AuthModal";
import CategoryMenu from "./components/CategoryMenu";
import Footer from "./components/Footer";
import AlertBanner from "./components/AlertBanner";

import AccountPage from "./pages/AccountPage";
import CartPage from "./pages/Cart";
import ProductDetail from "./pages/ProductDetail";
import Home from "./pages/Home";
import OrderConfirmation from "./pages/OrderConfirmation";
import CheckoutPage from "./pages/CheckoutPage";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { th } from "date-fns/locale";

import { apiFetch } from "./utils/api";

// -----------------------------
// MOCK CART STORAGE
// -----------------------------
const MOCK_KEY = "mock_cart";

/** ✅ นับเป็น “จำนวนรายการ” (unique items) */
const readMockCartUniqueCount = () => {
  try {
    const raw = localStorage.getItem(MOCK_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(arr)) return 0;

    const uniq = new Set(
      arr
        .filter(Boolean)
        .map((x) => String(x?.productId ?? x?.id ?? ""))
        .filter(Boolean)
    );

    return uniq.size;
  } catch {
    return 0;
  }
};

function App() {
  const hasToken = !!localStorage.getItem("access_token");

  const [isLoggedIn, setIsLoggedIn] = useState(hasToken);
  const [isModalOpen, setIsModalOpen] = useState(!hasToken);

  const [alertMessage, setAlertMessage] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // ✅ เก็บ API cart_detail
  const [cartItems, setCartItems] = useState([]);

  // ✅ เก็บจำนวน “รายการ” ของ mock
  const [mockCartUniqueCount, setMockCartUniqueCount] = useState(readMockCartUniqueCount());

  const [activeCategory, setActiveCategory] = useState("home");
  const [resetSearchKey, setResetSearchKey] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();

  // 🔥 FIX: ดีดหน้าจอขึ้นบนสุดทุกกรณี
  const forceScrollTop = () => {
    window.scrollTo(0, 0);
    document.body.scrollTop = 0; // Safari
    document.documentElement.scrollTop = 0; // Chrome/Firefox
  };

  useEffect(() => {
    forceScrollTop();
    setTimeout(forceScrollTop, 10);
  }, [location.pathname]);

  // -----------------------------
  // fetch user + API cart
  // -----------------------------
  const fetchCartData = useCallback(async () => {
    if (!isLoggedIn) return;

    try {
      if (!currentUser) {
        const userRes = await apiFetch("/users/me");
        if (userRes.ok) {
          const userData = await userRes.json();
          setCurrentUser(userData.data);
        }
      }

      // ✅ สำคัญ: ขอ product.id มาด้วย เพื่อเอาไปนับ “จำนวนรายการ”
      const cartRes = await apiFetch(
        `/items/cart_detail?fields=id,quantity,product.id&filter[owner][_eq]=$CURRENT_USER`
      );

      if (cartRes.ok) {
        const json = await cartRes.json();
        setCartItems(json.data || []);
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setCartItems([]);
    }
  }, [isLoggedIn, currentUser]);

  // ✅ refresh badge (API + MOCK)
  const refreshCartBadge = useCallback(async () => {
    // mock (unique)
    setMockCartUniqueCount(readMockCartUniqueCount());

    // api
    if (isLoggedIn) {
      await fetchCartData();
    }
  }, [isLoggedIn, fetchCartData]);

  // -----------------------------
  // init + subscribe cart signals
  // -----------------------------
  useEffect(() => {
    if (isLoggedIn) {
      fetchCartData();
    } else {
      setCartItems([]);
      setCurrentUser(null);
    }

    const handleCartUpdateSignal = () => {
      refreshCartBadge();
    };

    window.addEventListener("cart-updated", handleCartUpdateSignal);
    window.addEventListener("storage", handleCartUpdateSignal);

    return () => {
      window.removeEventListener("cart-updated", handleCartUpdateSignal);
      window.removeEventListener("storage", handleCartUpdateSignal);
    };
  }, [isLoggedIn, fetchCartData, refreshCartBadge]);

  // -----------------------------
  // guard token หาย
  // -----------------------------
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token && isLoggedIn) {
      setIsLoggedIn(false);
      setIsModalOpen(true);
    }
  }, [location.pathname, isLoggedIn]);

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("skinmatch_is_logged_in");

    setCurrentUser(null);
    setCartItems([]);
    setIsModalOpen(true);
    setActiveCategory("home");
    navigate("/");
  };

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    setResetSearchKey((prev) => prev + 1);

    forceScrollTop();

    if (location.pathname !== "/") {
      navigate("/");
    }
  };

  /** ✅ นับ API เป็น “จำนวนรายการ” (unique product) */
  const apiCartUniqueCount = useMemo(() => {
    const uniq = new Set(
      (cartItems || [])
        .map((row) => String(row?.product?.id ?? ""))
        .filter(Boolean)
    );
    return uniq.size;
  }, [cartItems]);

  /** ✅ รวม “จำนวนรายการ” ทั้งหมด */
  const totalUniqueItemsInCart = apiCartUniqueCount + mockCartUniqueCount;

  const handleProductSelect = (product) => {
    navigate(`/product/${product.id}`);
    forceScrollTop();
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setIsModalOpen(false);
    setActiveCategory("home");
    navigate("/");
    forceScrollTop();

    // ✅ ให้ badge รีเฟรชทันทีหลัง login
    setTimeout(() => {
      window.dispatchEvent(new Event("cart-updated"));
    }, 0);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={th}>
      <div className="app-container">
        {isModalOpen && (
          <AuthModal
            isOpen={true}
            onLoginSuccess={handleLoginSuccess}
            onClose={() => {
              if (isLoggedIn) setIsModalOpen(false);
            }}
          />
        )}

        <Navbar
          isAuthenticated={isLoggedIn}
          user={currentUser}
          onLoginClick={() => setIsModalOpen(true)}
          onLogout={handleLogout}
          // ✅ ส่งเป็น “จำนวนรายการ” (ไม่ใช่จำนวนชิ้น)
          cartUniqueCount={totalUniqueItemsInCart}
        />

        {alertMessage && (
          <div className="alert-banner-wrapper">
            <AlertBanner message={alertMessage} onClose={() => setAlertMessage(null)} />
          </div>
        )}

        <CategoryMenu
          activeCategory={location.pathname === "/" ? activeCategory : ""}
          onCategorySelect={handleCategoryChange}
        />

        <Routes>
          <Route
            path="/"
            element={
              <main>
                <Home
                  activeCategory={activeCategory}
                  handleProductSelect={handleProductSelect}
                  isLoggedIn={isLoggedIn}
                  currentUser={currentUser}
                  onLoginClick={() => setIsModalOpen(true)}
                  resetSearchKey={resetSearchKey}
                />
              </main>
            }
          />

          <Route path="/product/:id" element={<main><ProductDetail /></main>} />
          <Route path="/account" element={<main><AccountPage /></main>} />
          <Route path="/cart" element={<main><CartPage /></main>} />
          <Route path="/checkout" element={<main><CheckoutPage /></main>} />
          <Route path="/order-confirmation" element={<main><OrderConfirmation /></main>} />
        </Routes>

        <Footer />
      </div>
    </LocalizationProvider>
  );
}

export default App;
