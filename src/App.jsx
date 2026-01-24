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
  const hasToken = !!localStorage.getItem('access_token');

  const [isLoggedIn, setIsLoggedIn] = useState(hasToken);
  const [isModalOpen, setIsModalOpen] = useState(!hasToken);
  
  const [alertMessage, setAlertMessage] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('home'); 
  
  const [resetSearchKey, setResetSearchKey] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();

  // 🔥 FIX: สูตรยาแรง ดีดหน้าจอขึ้นบนสุดทุกกรณี
  const forceScrollTop = () => {
    window.scrollTo(0, 0);
    document.body.scrollTop = 0; // สำหรับ Safari
    document.documentElement.scrollTop = 0; // สำหรับ Chrome, Firefox, IE
  };

  // ทำงานเมื่อเปลี่ยนหน้า (Path เปลี่ยน)
  useEffect(() => {
    forceScrollTop();
    // สั่งซ้ำอีกทีเผื่อ Browser โหลดช้า
    setTimeout(forceScrollTop, 10);
  }, [location.pathname]); 

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
    const token = localStorage.getItem('access_token');
    if (!token && isLoggedIn) {
       setIsLoggedIn(false);
       setIsModalOpen(true);
    }
  }, [location.pathname]); 

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("skinmatch_is_logged_in");
    
    setCurrentUser(null);
    setCartItems([]);
    setIsModalOpen(true);
    setActiveCategory('home'); 
    navigate('/');
  };

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    setResetSearchKey(prev => prev + 1);
    
    // ดีดขึ้นทันทีที่กดเมนู
    forceScrollTop();

    if (location.pathname !== '/') {
      navigate('/');
    }
  };

  const totalItemsInCart = cartItems.length;

  const handleProductSelect = (product) => {
    navigate(`/product/${product.id}`);
    forceScrollTop();
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setIsModalOpen(false);
    setActiveCategory('home'); 
    navigate('/'); 
    forceScrollTop();
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
                resetSearchKey={resetSearchKey}
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