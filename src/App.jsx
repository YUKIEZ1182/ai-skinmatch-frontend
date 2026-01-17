import React, { useState, useEffect } from "react";
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

import { apiFetch } from './utils/api';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("skinmatch_is_logged_in") === "true";
  });

  const [currentUser, setCurrentUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('home'); // State หมวดหมู่

  const navigate = useNavigate();
  const location = useLocation();

  const fetchCartData = async () => {
    if (!isLoggedIn) return;
    try {
      if (!currentUser) {
        const userRes = await apiFetch('/users/me');
        if (userRes.ok) {
          const userData = await userRes.json();
          setCurrentUser(userData.data);
        }
      }

      const cartRes = await apiFetch(`/items/cart_detail?fields=id,quantity&filter[owner][_eq]=$CURRENT_USER`);
      if (cartRes.ok) {
        const json = await cartRes.json();
        setCartItems(json.data || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchCartData();
    } else {
      setCartItems([]);
      setCurrentUser(null);
    }

    const handleCartUpdateSignal = () => {
      fetchCartData();
    };

    window.addEventListener('cart-updated', handleCartUpdateSignal);

    return () => {
      window.removeEventListener('cart-updated', handleCartUpdateSignal);
    };
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) {
      // ถ้ายังไม่ Login ไม่ต้องบังคับเปิด Modal ทันทีก็ได้ หรือจะเปิดก็ได้ตาม flow เดิม
      // setIsModalOpen(true); 
    }
  }, []);

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("skinmatch_is_logged_in");
    setCurrentUser(null);
    setCartItems([]);
    setIsModalOpen(true);
    setActiveCategory('home'); // รีเซ็ตหมวดหมู่ตอนออก
    navigate('/');
  };

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    if (location.pathname !== '/') {
      navigate('/');
      window.scrollTo(0, 0);
    }
  };

  const totalItemsInCart = cartItems.length;

  const handleProductSelect = (product) => {
    navigate(`/product/${product.id}`);
    window.scrollTo(0, 0);
  };

  const handleGoBack = () => {
    navigate('/');
    window.scrollTo(0, 0);
  };

  // 🔥 ฟังก์ชันจัดการเมื่อ Login สำเร็จ (รวมทุกอย่างที่นี่)
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setIsModalOpen(false);
    
    // 1. รีเซ็ตหมวดหมู่กลับมาเป็น Home (เพื่อให้ Dashboard ขึ้น)
    setActiveCategory('home'); 
    
    // 2. สั่งย้ายหน้าไปที่ '/' ทันที
    navigate('/'); 
    window.scrollTo(0, 0);
  };

  const getBreadcrumbItems = () => {
    const baseItem = { label: 'หน้าหลัก', onClick: handleGoBack, isLink: true };
    const path = location.pathname;
    if (path === '/cart') return [baseItem, { label: 'รายการสินค้า', isLink: false }];
    if (path === '/account') return [baseItem, { label: 'บัญชีของฉัน', isLink: false }];
    if (path.includes('/product/')) return [baseItem, { label: 'รายละเอียดสินค้า', isLink: false }];
    if (path === '/') return [];
    return [baseItem];
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={th}>
      <div className="app-container">

        {isModalOpen && (
          <AuthModal
            isOpen={true}
            // 🔥 เรียกใช้ฟังก์ชันใหม่ที่นี่
            onLoginSuccess={handleLoginSuccess}
            onClose={() => setIsModalOpen(false)}
          />
        )}

        <Navbar
          isAuthenticated={isLoggedIn}
          user={currentUser}
          onLoginClick={() => setIsModalOpen(true)}
          onLogout={handleLogout}
          cartItemCount={isLoggedIn ? totalItemsInCart : 0}
        />

        {alertMessage && (
          <div className="alert-banner-wrapper">
            <AlertBanner
              message={alertMessage}
              onClose={() => setAlertMessage(null)}
            />
          </div>
        )}

        {location.pathname !== '/' && (
          <Breadcrumb items={getBreadcrumbItems()} />
        )}

        <CategoryMenu
          activeCategory={location.pathname === '/' ? activeCategory : ''}
          onCategorySelect={handleCategoryChange}
        />

        <Routes>
          <Route path="/" element={
            <main>
              <Home
                activeCategory={activeCategory}
                handleProductSelect={handleProductSelect}
                isLoggedIn={isLoggedIn}
                currentUser={currentUser}
                // 🔥 เพิ่มบรรทัดนี้ครับ! ส่งฟังก์ชันเปิด Modal ไปให้ Home
                onLoginClick={() => setIsModalOpen(true)}
              />
            </main>
          } />

          <Route path="/product/:id" element={
            <main>
              <ProductDetail />
            </main>
          } />

          <Route path="/account" element={<main><AccountPage /></main>} />

          <Route path="/cart" element={
            <main>
              <CartPage />
            </main>
          } />
          <Route path="/checkout" element={<main><CheckoutPage /></main>} />
          <Route path="/order-confirmation" element={<main><OrderConfirmation /></main>} />
        </Routes>

        <Footer />
      </div>
    </LocalizationProvider>
  );
}

export default App;