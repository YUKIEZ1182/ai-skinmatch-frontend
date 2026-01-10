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

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  
  // โหลดสถานะ Login
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("skinmatch_is_logged_in") === "true";
  });

  // บันทึกสถานะ Login
  useEffect(() => {
    localStorage.setItem("skinmatch_is_logged_in", isLoggedIn);
  }, [isLoggedIn]);

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
    setIsModalOpen(true); 
  };

  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("skinmatch_cart");
    if (savedCart) {
      try { return JSON.parse(savedCart); } catch (e) { console.error(e); }
    }
    return [];
  });

  const [activeCategory, setActiveCategory] = useState('new');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem("skinmatch_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const totalItemsInCart = cartItems.reduce((total, item) => total + (Number(item.quantity) || 0), 0);

  const handleProductSelect = (product) => {
    navigate(`/product/${product.id}`);
    window.scrollTo(0, 0);
  };

  const handleGoBack = () => {
    navigate('/');
    window.scrollTo(0, 0);
  };

  // ✅ เช็ค Login ก่อนเพิ่มสินค้า
  const handleAddToCartApp = (product, quantityToAdd) => {
    // 1. เช็คว่า Login หรือยัง?
    if (!isLoggedIn) {
      setIsModalOpen(true); // ถ้ายัง ให้เด้ง Modal Login ขึ้นมา
      return; 
    }

    // 2. ถ้า Login แล้ว ให้ทำงานต่อตามปกติ
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => String(item.id) === String(product.id));
      if (existingItem) {
        return prevItems.map(item => 
          String(item.id) === String(product.id)
            ? { ...item, quantity: (Number(item.quantity) || 0) + quantityToAdd } 
            : item
        );
      } else {
        return [...prevItems, { ...product, quantity: quantityToAdd }];
      }
    });

    // แสดงแจ้งเตือน
    setAlertMessage("เพิ่มสินค้าลงตะกร้าเรียบร้อยแล้ว");
  };

  const handleRemoveFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => String(item.id) !== String(productId)));
  };

  const handleUpdateQuantity = (productId, delta) => {
    setCartItems(prev => prev.map(item => {
      if (String(item.id) === String(productId)) {
        const currentQty = Number(item.quantity) || 1;
        const newQty = currentQty + delta;
        return { ...item, quantity: newQty > 0 ? newQty : 1 };
      }
      return item;
    }));
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
              />
            </main>
          } />
          
          <Route path="/product/:id" element={
            <main>
              <ProductDetail 
                onAddToCart={handleAddToCartApp}
              />
            </main>
          } />

          <Route path="/account" element={<main><AccountPage /></main>} />
          
          <Route path="/cart" element={
            <main>
               <CartPage 
                  cartItems={cartItems} 
                  onRemoveItem={handleRemoveFromCart}
                  onUpdateQuantity={handleUpdateQuantity}
                  onAddToCart={handleAddToCartApp} 
               />
            </main>
          } />
          <Route path="/checkout" element={<main><OrderConfirmation /></main>} />
        </Routes>

        <Footer />
      </div>
  );
}

export default App;