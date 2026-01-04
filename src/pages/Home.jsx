import React, { useState, useEffect } from 'react';
import '../styles/Home.css';
import '../styles/SearchPage.css';
import ProductCard from '../components/ProductCard';

const API_URL = import.meta.env.VITE_DIRECTUS_PUBLIC_URL;

export default function Home({ handleProductSelect, activeCategory }) {
  const [products, setProducts] = useState([]); 
  const [loading, setLoading] = useState(true); 
  
  const [inputValue, setInputValue] = useState(""); 
  
  const [executedSearchTerm, setExecutedSearchTerm] = useState("");
  
  const [categoryTitle, setCategoryTitle] = useState("รายการสินค้า");

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

      // 1. เพิ่ม status ใน fields เพื่อเช็คสต็อก
      const response = await fetch(
        `${API_URL}/items/product?fields=id,name,price,thumbnail,brand_name,status,categories.category_id.name,categories.category_id.id,date_created,date_updated&sort=-date_updated&filter=${encodeURIComponent(filterParam)}`, 
        { method: 'GET', headers: headers }
      );

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.reload();
        return;
      }

      const json = await response.json();

      if (json.data) {
        const mappedProducts = json.data.map((item) => ({
          // Map ข้อมูลให้ตรงกับ Class Diagram
          id: item.id,
          name: item.name,
          price: Number(item.price), 
          image: item.thumbnail ? `${API_URL}/assets/${item.thumbnail}` : 'https://placehold.co/400x400?text=No+Image', 
          brand: item.brand_name || item.categories?.[0]?.category_id?.name || 'General', 
          category: item.categories?.[0]?.category_id?.name || 'General', // เพิ่ม category
          stock: item.status === 'published' ? 10 : 0, // เพิ่ม stock (จำลอง logic จาก status)
          date_created: item.date_created,
          date_updated: item.date_updated
        }));
        setProducts(mappedProducts);
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
    setInputValue("");
    setExecutedSearchTerm("");
    fetchProducts("", activeCategory);

    const updateTitle = async () => {
      if (!activeCategory || activeCategory === 'new') return;
      try {
        const token = localStorage.getItem('access_token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const res = await fetch(`${API_URL}/items/category/${activeCategory}?fields=name`, { headers });
        const json = await res.json();
        setCategoryTitle(json.data?.name || "รายการสินค้า");
      } catch (e) { 
        setCategoryTitle("รายการสินค้า"); 
      }
    };
    updateTitle();

  }, [activeCategory]);

  const handleSearch = () => {
    const term = inputValue.trim();
    setExecutedSearchTerm(term);
    fetchProducts(term, activeCategory);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '50px', color: '#666' }}>
         <h3>กำลังโหลดสินค้า...</h3>
      </div>
    );
  }

  if (!executedSearchTerm && activeCategory === 'new') {
    const newArrivals = products.slice(0, 4);
    const recommendItems = products.slice(4, 8);

    return (
      <div className="home-container search-page-container"> 
        <div className="search-section">
          <div className="search-pill">
            <input 
              type="text" 
              placeholder="คุณกำลังมองหาอะไรอยู่?" 
              className="search-input" 
              value={inputValue} 
              onChange={(e) => setInputValue(e.target.value)} 
              onKeyDown={handleKeyDown}
            />
            <button className="search-circle-btn" onClick={handleSearch}>
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </button>
          </div>
        </div>
        <div className="home-content">
           <section className="product-section">
            <h2 className="section-title">สินค้าใหม่ที่น่าสนใจ</h2>
            <div className="product-grid">
              {newArrivals.map(p => (
                <ProductCard key={p.id} product={p} onClick={() => handleProductSelect(p)} />
              ))}
            </div>
          </section>
          
          {recommendItems.length > 0 && (
            <section className="product-section">
                <h2 className="section-title">แนะนำสำหรับผิวของคุณ</h2>
                <div className="product-grid">
                {recommendItems.map(p => (
                    <ProductCard key={p.id} product={p} onClick={() => handleProductSelect(p)} />
                ))}
                </div>
            </section>
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
            type="text" 
            placeholder="คุณกำลังมองหาอะไรอยู่?" 
            className="search-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
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
               ไม่พบผลลัพธ์การค้นหา ลองใช้คำค้นหาที่กว้างขึ้น<br/>
               เช่น ชื่อแบรนด์ผลิตภัณฑ์ (CeraVe, Vichy) 
             </p>
           </div>
        ) : (
           <div className="product-section">
             <div className="search-header-result">
                <h2 className="search-title">
                  {executedSearchTerm ? (
                    <>ผลลัพธ์การค้นหา <span className="search-highlight">"{executedSearchTerm}"</span></>
                  ) : (
                    categoryTitle
                  )}
                </h2>
                <p className="search-count">
                  พบสินค้าทั้งหมด {products.length} รายการ
                </p>
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