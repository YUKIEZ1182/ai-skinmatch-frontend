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

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { th } from "date-fns/locale"; 

import { apiFetch } from './utils/api';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  
  // โหลดสถานะ Login
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("skinmatch_is_logged_in") === "true";
  });

  // ข้อมูล User ปัจจุบัน
  const [currentUser, setCurrentUser] = useState(null);

  // ข้อมูลตะกร้า (เอาไว้นับจำนวน Badge บน Navbar)
  const [cartItems, setCartItems] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();

  // ✅ 1. ฟังก์ชันดึงข้อมูลตะกร้า (เอาไว้นับจำนวนอย่างเดียว)
  const fetchCartData = async () => {
    if (!isLoggedIn) return;
    try {
      // ดึงข้อมูล User (ถ้ายังไม่มี)
      if (!currentUser) {
        const userRes = await apiFetch('/users/me');
        if (userRes.ok) {
          const userData = await userRes.json();
          setCurrentUser(userData.data);
        }
      }

      // ดึงข้อมูลตะกร้าเพื่อเอามานับจำนวน
      const cartRes = await apiFetch(`/items/cart_detail?fields=id,quantity&filter[owner][_eq]=$CURRENT_USER`);
      if (cartRes.ok) {
        const json = await cartRes.json();
        setCartItems(json.data || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // ✅ 2. useEffect สำหรับรับสัญญาณ (Signal Receiver)
  useEffect(() => {
    if (isLoggedIn) {
      fetchCartData(); // ดึงครั้งแรกตอน Login
    } else {
      setCartItems([]);
      setCurrentUser(null);
    }

    // สร้างฟังก์ชันรับสัญญาณ
    const handleCartUpdateSignal = () => {
      // พอได้ยินสัญญาณว่ามีคนเพิ่ม/ลบของ ให้ดึงข้อมูลใหม่ทันที
      fetchCartData();
    };

    // เริ่มดักฟัง
    window.addEventListener('cart-updated', handleCartUpdateSignal);

    // เลิกดักฟังเมื่อ Component ถูกทำลาย (Cleanup)
    return () => {
      window.removeEventListener('cart-updated', handleCartUpdateSignal);
    };
  }, [isLoggedIn]); // ทำงานใหม่เมื่อสถานะ Login เปลี่ยน

  // เปิดเว็บมาถ้ายังไม่ Login ให้เด้ง Modal (ปิดได้)
  useEffect(() => {
    if (!isLoggedIn) {
      setIsModalOpen(true);
    }
  }, []); 

  // ฟังก์ชันออกจากระบบ
  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("skinmatch_is_logged_in");
    setCurrentUser(null);
    setCartItems([]);
    setIsModalOpen(true); 
    navigate('/');
  };

  const [activeCategory, setActiveCategory] = useState('new');

  // คำนวณจำนวนชิ้นรวม (หรือจะเปลี่ยนเป็น .length ก็นับตามรายการ)
  // ถ้าอยากนับตามรายการให้ใช้: const totalItemsInCart = cartItems.length;
  const totalItemsInCart = cartItems.length; 

  const handleProductSelect = (product) => {
    navigate(`/product/${product.id}`);
    window.scrollTo(0, 0);
  };

  const handleGoBack = () => {
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
        
        {/* Modal Login/Register */}
        {isModalOpen && (
            <AuthModal 
                isOpen={true}
                onLoginSuccess={() => { setIsLoggedIn(true); setIsModalOpen(false); }}
                onClose={() => setIsModalOpen(false)} 
            />
        )}

        {/* Navbar */}
        <Navbar 
            isAuthenticated={isLoggedIn}
            user={currentUser} 
            onLoginClick={() => setIsModalOpen(true)}
            onLogout={handleLogout}
            cartItemCount={isLoggedIn ? totalItemsInCart : 0}
        />

        {/* Alert Banner */}
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
            activeCategory={activeCategory} 
            onCategorySelect={setActiveCategory} 
        />

        <Routes>
          <Route path="/" element={
            <main>
              <Home
                activeCategory={activeCategory} 
                handleProductSelect={handleProductSelect}
                isLoggedIn={isLoggedIn}
                currentUser={currentUser}
              />
            </main>
          } />
          
          <Route path="/product/:id" element={
            <main>
              {/* ✅ ไม่ต้องส่ง onAddToCart แล้ว เพราะ ProductDetail จัดการเอง */}
              <ProductDetail />
            </main>
          } />

          <Route path="/account" element={<main><AccountPage /></main>} />
          
          <Route path="/cart" element={
            <main>
               {/* ✅ ไม่ต้องส่ง props จัดการตะกร้า เพราะ CartPage จัดการเอง */}
               <CartPage />
            </main>
          } />
          <Route path="/checkout" element={<main><OrderConfirmation /></main>} />
        </Routes>

        <Footer />
      </div>
    </LocalizationProvider>
  );
}

export default App;