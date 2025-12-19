import React, { useState, useMemo, useEffect } from 'react';
import '../styles/Home.css';
import '../styles/SearchPage.css';
import ProductCard from '../components/ProductCard';
import { mockProducts } from '../data/mockData';

const getCategoryTitle = (catId) => {
  const titles = {
    new: "สินค้าใหม่ที่น่าสนใจ",
    makeup: "เมคอัพ",
    skincare: "ผลิตภัณฑ์ดูแลผิวหน้า (Skincare)",
    haircare: "ผลิตภัณฑ์ดูแลเส้นผม",
    tools: "อุปกรณ์เสริมสวย",
    body: "ผลิตภัณฑ์ดูแลผิวกาย",
    perfume: "น้ำหอม",
    queen: "ควีนบิวตี้",
    gift: "ชุดของขวัญ",
    brand: "แบรนด์ชั้นนำ",
    sale: "สินค้าลดราคาพิเศษ"
  };
  return titles[catId] || "รายการสินค้า";
};

export default function Home({ handleProductSelect, activeCategory }) {
  const [inputValue, setInputValue] = useState(""); 
  const [searchTerm, setSearchTerm] = useState("");

  // เมื่อกดเปลี่ยนหมวดหมู่ ให้ล้างคำค้นหาทิ้ง
  useEffect(() => {
    setSearchTerm("");
    setInputValue("");
  }, [activeCategory]); 

  const handleSearch = () => {
    setSearchTerm(inputValue.trim());
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const filteredProducts = useMemo(() => {
    let products = mockProducts;

    if (searchTerm) {
      return products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.brand.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (activeCategory) {
      switch (activeCategory) {
        case 'new': return products;
        case 'skincare':
          return products.filter(p => 
            ['skincare', 'cleanser', 'moisturizer', 'suncare'].includes(p.type)
          );
        case 'tools': return products.filter(p => p.type === 'tool');
        case 'body': return products.filter(p => p.type === 'bodycare');
        case 'sale': return products.filter(p => p.type === 'discount');
        default: return products.filter(p => p.type === activeCategory);
      }
    }
    return products;
  }, [activeCategory, searchTerm]);

  // --- VIEW 1: หน้าหลัก (สินค้าใหม่ + แนะนำ) ---
  // แสดงเมื่อไม่มีคำค้นหา และอยู่ที่หมวด 'new'
  if (!searchTerm && activeCategory === 'new') {
    const newArrivals = mockProducts.filter(p => p.type === 'new' || p.id <= 4).slice(0, 4);
    const recommendItems = mockProducts.slice(4, 8);

    return (
      <div className="home-container">
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

          <section className="product-section">
            <h2 className="section-title">แนะนำสำหรับผิวของคุณ</h2>
            <div className="product-grid">
              {recommendItems.map(p => (
                <ProductCard key={p.id} product={p} onClick={() => handleProductSelect(p)} />
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  }

  // --- VIEW 2: หน้าแสดงผลการค้นหา หรือ หมวดหมู่สินค้าอื่นๆ ---
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
        
        {/* กรณีไม่พบสินค้า */}
        {filteredProducts.length === 0 ? (
           <div className="search-empty-state">
             <div className="empty-icon-wrapper">
               <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  <line x1="8" y1="11" x2="14" y2="11"></line>
               </svg>
             </div>
             
             <h3 className="empty-title">
               {searchTerm ? `ไม่พบสินค้า "${searchTerm}"` : "ยังไม่มีสินค้าในหมวดหมู่นี้"}
             </h3>
             <p className="empty-subtitle">
               ลองตรวจสอบคำสะกด หรือใช้คำค้นหาที่กว้างขึ้น <br/>
               เช่น "ลิปสติก", "ครีม", "Cerave"
             </p>
           </div>

        ) : (
           /* กรณีพบสินค้า */
           <div className="product-section">
             
             <div className="search-header-result">
                <h2 className="search-title">
                  {searchTerm ? (
                    <>ผลลัพธ์การค้นหา <span className="search-highlight">"{searchTerm}"</span></>
                  ) : (
                    getCategoryTitle(activeCategory)
                  )}
                </h2>
                <p className="search-count">
                  พบสินค้าทั้งหมด {filteredProducts.length} รายการ
                </p>
             </div>

             <div className="product-grid">
               {filteredProducts.map(p => (
                 <ProductCard key={p.id} product={p} onClick={() => handleProductSelect(p)} />
               ))}
             </div>
           </div>
        )}

      </div>
    </div>
  );
}