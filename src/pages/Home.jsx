// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import '../styles/Home.css';
import '../styles/SearchPage.css';
import ProductCard from '../components/ProductCard';
import { apiFetch } from '../utils/api';

const API_URL = import.meta.env.VITE_DIRECTUS_PUBLIC_URL;

export default function Home({ handleProductSelect, activeCategory, isLoggedIn }) {
  const [newArrivals, setNewArrivals] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [userSkinType, setUserSkinType] = useState(null);
  
  const [products, setProducts] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [inputValue, setInputValue] = useState(""); 
  const [executedSearchTerm, setExecutedSearchTerm] = useState("");
  const [categoryTitle, setCategoryTitle] = useState("รายการสินค้า");

  const mapProductData = (item) => ({
    id: item.id,
    name: item.name,
    price: Number(item.price), 
    image: item.thumbnail ? `${API_URL}/assets/${item.thumbnail}` : 'https://placehold.co/400x400?text=No+Image', 
    brand: item.brand_name || item.categories?.[0]?.category_id?.name || 'General', 
    date_created: item.date_created,
    date_updated: item.date_updated
  });

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      const newRes = await fetch(`${API_URL}/items/product?sort=-date_updated&limit=4&fields=id,name,price,thumbnail,brand_name,status,categories.category_id.name,date_updated`);
      const newData = await newRes.json();
      if (newData.data) {
        setNewArrivals(newData.data.map(mapProductData));
      }

      const token = localStorage.getItem('access_token');
      if (token) {
        const recRes = await apiFetch(`/recommend/product-for-skin-type`);
        
        if (recRes.ok) {
          const recData = await recRes.json();
          if (recData.data) {
             setRecommended(recData.data.slice(0, 4).map(mapProductData));
             setUserSkinType(recData.user_skin_type);
          }
        }
      } else {
        setRecommended([]);
        setUserSkinType(null);
      }
    } catch (err) {
      console.error("Error fetching home data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async (searchTerm, categoryId) => {
    try {
        setLoading(true);
        const token = localStorage.getItem('access_token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
  
        const filterObj = { _and: [] };
  
        if (searchTerm) {
          filterObj._and.push({
            _or: [
              { name: { _icontains: searchTerm } },
              { brand_name: { _icontains: searchTerm } }
            ]
          });
        }
  
        if (categoryId && categoryId !== 'new') {
          filterObj._and.push({
            categories: { category_id: { id: { _eq: categoryId } } }
          });
        }
  
        if (filterObj._and.length === 0) delete filterObj._and;
  
        const filterParam = JSON.stringify(filterObj);
        const response = await fetch(
          `${API_URL}/items/product?fields=id,name,price,thumbnail,brand_name,categories.category_id.name,date_created,date_updated&sort=-date_updated&filter=${encodeURIComponent(filterParam)}`, 
          { method: 'GET', headers: headers }
        );
  
        const json = await response.json();
        if (json.data) {
          setProducts(json.data.map(mapProductData));
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    if(activeCategory !== 'new') { 
        setInputValue(""); 
        setExecutedSearchTerm(""); 
    }

    if (activeCategory === 'new' && !executedSearchTerm) {
        fetchHomeData();
    } else {
        fetchProducts(executedSearchTerm, activeCategory);
    }

    const updateTitle = async () => {
        if (!activeCategory || activeCategory === 'new') {
            setCategoryTitle("รายการสินค้า");
            return;
         }
         try {
           const res = await fetch(`${API_URL}/items/category/${activeCategory}?fields=name`);
           const json = await res.json();
           setCategoryTitle(json.data?.name || "รายการสินค้า");
         } catch (e) { setCategoryTitle("รายการสินค้า"); }
    };
    updateTitle();

  }, [activeCategory, executedSearchTerm, isLoggedIn]);

  const handleSearch = () => {
    const term = inputValue.trim();
    setExecutedSearchTerm(term);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '50px', color: '#666' }}>
         <h3>กำลังโหลดสินค้า...</h3>
      </div>
    );
  }

  if (!executedSearchTerm && activeCategory === 'new') {
    return (
      <div className="home-container search-page-container"> 
        <div className="search-section">
          <div className="search-pill">
            <input 
              type="text" placeholder="คุณกำลังมองหาอะไรอยู่?" className="search-input" 
              value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown}
            />
            <button className="search-circle-btn" onClick={handleSearch}>
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </button>
          </div>
        </div>
        
        <div className="home-content">
           <section className="product-section">
            <h2 className="section-title">สินค้าใหม่ที่น่าสนใจ</h2>
            <div className="horizontal-product-list">
              {newArrivals.length > 0 ? (
                newArrivals.map(p => (
                  <ProductCard key={p.id} product={p} onClick={() => handleProductSelect(p)} />
                ))
              ) : (
                <p style={{color: '#999'}}>ยังไม่มีสินค้าใหม่</p>
              )}
            </div>
          </section>
          
          {recommended.length > 0 && (
            <section className="product-section highlight-section">
                <h2 className="section-title">แนะนำสำหรับผิวของคุณ</h2>
                <div className="horizontal-product-list">
                {recommended.map(p => (
                    <ProductCard key={p.id} product={p} onClick={() => handleProductSelect(p)} />
                ))}
                </div>
            </section>
          )}

           {recommended.length === 0 && (
             <div style={{textAlign:'center', padding:'40px', color:'#ccc', marginTop:'20px'}}>
               {isLoggedIn ? (
                 <p>กำลังวิเคราะห์ผิว หรือไม่พบข้อมูลสินค้าที่ตรงกัน</p>
               ) : (
                 <p>เข้าสู่ระบบเพื่อรับคำแนะนำผลิตภัณฑ์ที่เหมาะกับผิวคุณ</p>
               )}
             </div>
           )}
        </div>
      </div>
    );
  }

  return (
    <div className="home-container search-page-container">
      <div className="search-section">
        <div className="search-pill">
          <input 
            type="text" placeholder="คุณกำลังมองหาอะไรอยู่?" className="search-input"
            value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown}
          />
          <button className="search-circle-btn" onClick={handleSearch}>
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </button>
        </div>
      </div>

      <div className="home-content">
        {products.length === 0 ? (
           <div className="search-empty-state">
             <div className="empty-icon-wrapper">
               <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  <line x1="8" y1="11" x2="14" y2="11"></line>
               </svg>
             </div>
             <h3 className="empty-title">
               {executedSearchTerm ? `ไม่พบสินค้า "${executedSearchTerm}"` : "ยังไม่มีสินค้าในหมวดหมู่นี้"}
             </h3>
             <p className="empty-subtitle">
               ลองตรวจสอบคำสะกด หรือใช้คำค้นหาที่กว้างขึ้น <br/>
               เช่น "ลิปสติก", "ครีม", "Cerave"
             </p>
           </div>
        ) : (
           <div className="product-section">
             <div className="search-header-result">
                <h2 className="search-title">
                  {executedSearchTerm ? <>ผลลัพธ์การค้นหา <span className="search-highlight">"{executedSearchTerm}"</span></> : categoryTitle}
                </h2>
                <p className="search-count">พบสินค้าทั้งหมด {products.length} รายการ</p>
             </div>
             <div className="product-grid">
               {products.map(p => (
                 <ProductCard key={p.id} product={p} onClick={() => handleProductSelect(p)} />
               ))}
             </div>
           </div>
        )}
      </div>
    </div>
  );
}