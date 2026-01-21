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
  // 🔥 FIX: เช็คจาก Token จริงๆ (access_token)
  // ถ้ามี Token -> ถือว่า Login แล้ว (ค่าเริ่มต้นเป็น true) -> Modal ปิด (false)
  // ถ้าไม่มี Token -> Login เป็น false -> Modal เปิด (true)
  const hasToken = !!localStorage.getItem('access_token');

  const [isLoggedIn, setIsLoggedIn] = useState(hasToken);
  const [isModalOpen, setIsModalOpen] = useState(!hasToken); // เปิด Modal ทันทีถ้าไม่มี Token
  
  const [alertMessage, setAlertMessage] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('home'); 

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

  // ✅ เช็ค Token ตลอด ถ้าอยู่ๆ Token หาย (Logout หรือหมดอายุ) ให้เด้ง Modal
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token && isLoggedIn) {
       setIsLoggedIn(false);
       setIsModalOpen(true);
    }
  }, [location.pathname]); 

  const handleLogout = () => {
    setIsLoggedIn(false);
    // ลบ Token ทั้งหมด
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("skinmatch_is_logged_in");
    
    setCurrentUser(null);
    setCartItems([]);
    
    // สั่งเปิด Modal ทันทีที่ Logout
    setIsModalOpen(true);
    
    setActiveCategory('home'); 
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

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setIsModalOpen(false);
    setActiveCategory('home'); 
    navigate('/'); 
    window.scrollTo(0, 0);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={th}>
      <div className="app-container">

        {/* Modal ควบคุมที่นี่จุดเดียว */}
        {isModalOpen && (
          <AuthModal
            isOpen={true}
            onLoginSuccess={handleLoginSuccess}
            // ปิด Modal ได้เฉพาะตอนที่ล็อกอินแล้วเท่านั้น (ป้องกันกดปิดหนี)
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
                onLoginClick={() => setIsModalOpen(true)}
              />
            </main>
          } />

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