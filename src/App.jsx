import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useParams } from "react-router-dom";

import "./theme.css";
import "./App.css";

// 🧩 Components
import Header from "./components/Header";
import Navbar from "./components/Navbar";
import Breadcrumb from "./components/Breadcrumb";
import Search from "./components/Search";
import ProductList, { mockProducts } from "./components/ProductList";
import Footer from "./components/Footer";
import LoginModal from "./components/LoginModal";
import AlertBanner from "./components/AlertBanner";

// 🛒 Pages
import ProductDetail from "./pages/ProductDetail";
import AccountPage from "./pages/AccountPage";
import CartPage from "./pages/CartPage";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { th } from "date-fns/locale";

function HomePage({ isLoggedIn, hasSearched, filteredProducts, recommendedProducts, handleProductSelect }) {
  return (
    <>
      <ProductList
        title={hasSearched ? "ผลการค้นหา" : "สินค้าใหม่ที่น่าสนใจ"}
        products={filteredProducts}
        onProductSelect={handleProductSelect} 
      />

      {isLoggedIn && !hasSearched && recommendedProducts.length > 0 && (
        <ProductList
          title="แนะนำสำหรับสภาพผิวของคุณ"
          products={recommendedProducts}
          onProductSelect={handleProductSelect}
          style={{ marginTop: '40px' }}
        />
      )}
    </>
  );
}
function ProductDetailPageWrapper({ onGoBack, onAddToCart, onProductSelect }) { // 👈‼️ 1. ต้องรับ onAddToCart
  const { productId } = useParams();
  const product = mockProducts.find(p => p.id.toString() === productId);

  return (
      <ProductDetail
        product={product}
        onGoBack={onGoBack}
        onAddToCart={onAddToCart}
        onProductSelect={onProductSelect}
      />
  );
}
function App() {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const closeModal = () => { setIsModalOpen(false); };
  const [cartItemCount, setCartItemCount] = useState(2);
  const [notification, setNotification] = useState(null);
  const showNotification = (message, type = 'success', duration = 3000) => { /* ... */ };
  const clearNotification = () => { /* ... */ };
  const handleAddToCartApp = (productName, quantityToAdd) => { /* ... */ };
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const handleLoginSuccess = () => { /* ... */ };
  const [hasSearched, setHasSearched] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState(mockProducts.slice(0, 4));
  const handleSearch = (term) => {
    console.log("--- APP: Searching for:", term);
    setHasSearched(true);
    if (!term.trim()) {
        setFilteredProducts(mockProducts.slice(0, 4));
        setHasSearched(false);
        return;
    }
    const lowerCaseTerm = term.toLowerCase();
    const results = mockProducts.filter(/* ... */);
    setFilteredProducts(results);
  };
  const recommendedProducts = isLoggedIn && !hasSearched ? mockProducts.filter(/* ... */).slice(0, 4) : [];
  const navigate = useNavigate();
  const handleProductSelect = (product) => {
    console.log('--- APP: Navigating to product:', product.id);
    navigate(`/product/${product.id}`);
    window.scrollTo(0, 0);
  };
  const handleGoBack = () => {
    console.log('--- APP: Navigating back to home ---');
    navigate('/');
    window.scrollTo(0, 0);
  };
  let breadcrumbItems = [{ label: 'หน้าหลัก', onClick: handleGoBack, isLink: true }];
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={th}>
      <div className="app-container">
        <AlertBanner  />
        <LoginModal />
        <Header cartItemCount={cartItemCount} />
        <Breadcrumb items={breadcrumbItems} />
        <Navbar />
        <Search onSearch={handleSearch} />
        <Routes>
          <Route path="/" element={
            <main>
              <HomePage
                isLoggedIn={isLoggedIn}
                hasSearched={hasSearched}
                filteredProducts={filteredProducts}
                recommendedProducts={recommendedProducts}
                handleProductSelect={handleProductSelect}
              />
            </main>
          } />
          <Route path="/product/:productId" element={
            <main>
              <ProductDetailPageWrapper
                onGoBack={handleGoBack}
                onAddToCart={handleAddToCartApp}
                onProductSelect={handleProductSelect}
              />
            </main>
          } />
          <Route path="/account" element={
            <main>
              <AccountPage />
            </main>
          } />
        </Routes>
        <Footer />
      </div>
    </LocalizationProvider>
  );
}

export default App;
