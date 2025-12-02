import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import '../styles/App.css';
import '../styles/global.css';
import { mockProducts } from '../data/mockData';

function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredList, setFilteredList] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeCategory, setActiveCategory] = useState('home');

  const handleSearch = () => {
    const term = searchTerm.toLowerCase().trim();
    if (term === "") { setIsSearching(false); return; }
    
    const result = mockProducts.filter(item => 
      item.name.toLowerCase().includes(term) || item.brand.toLowerCase().includes(term)
    );
    setFilteredList(result);
    setIsSearching(true);
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleSearch(); };

  const handleCategoryClick = (category) => {
    setActiveCategory(category);
    setSearchTerm("");
    setIsSearching(false);
  };

  const getCategoryContent = () => {
    if (activeCategory === 'home') {
      const newProducts = mockProducts.filter(p => p.type === 'new');
      const recProducts = mockProducts.filter(p => p.type === 'recommend');
      return (
        <>
          <h2 className="section-header">สินค้าใหม่ที่น่าสนใจ</h2>
          <div className="product-grid">
            {newProducts.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
          <h2 className="section-header">แนะนำสำหรับผิวของคุณ</h2>
          <div className="product-grid">
            {recProducts.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </>
      );
    } else {
      const categoryProducts = mockProducts.filter(p => p.type === activeCategory);
      return (
        <>
          <h2 className="section-header">หมวดหมู่: {categoryNameMap[activeCategory]}</h2>
          {categoryProducts.length > 0 ? (
            <div className="product-grid">
              {categoryProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div style={{textAlign: 'center', padding: '50px', color: '#888'}}><h3>ยังไม่มีสินค้าในหมวดหมู่นี้</h3></div>
          )}
        </>
      );
    }
  };

  const categoryNameMap = {
    new: "สินค้าใหม่", makeup: "เมคอัพ", skincare: "สกินแคร์", haircare: "ดูแลเส้นผม",
    tool: "อุปกรณ์เสริมสวย", bodycare: "ดูแลผิวกาย", perfume: "น้ำหอม",
    queen: "ควีนบิวตี้", gift: "ของขวัญ", brand: "แบรนด์", discount: "สินค้าลดราคา"
  };

  return (
    <div>
      <div className="breadcrumb" onClick={() => handleCategoryClick('home')} style={{cursor: 'pointer'}}>
        หน้าแรก {activeCategory !== 'home' && ` > ${categoryNameMap[activeCategory]}`}
      </div>

      <main className="container">
        <div className="category-nav">
          <div className={`nav-link red-badge-button ${activeCategory === 'new' ? 'active' : ''}`} onClick={() => handleCategoryClick('new')}>ใหม่!</div>
          {[
            { id: 'makeup', label: 'เมคอัพ' },
            { id: 'skincare', label: 'สกินแคร์' },
            { id: 'haircare', label: 'ดูแลเส้นผม' },
            { id: 'tool', label: 'อุปกรณ์เสริมสวย' },
            { id: 'bodycare', label: 'ดูแลผิวกาย' },
            { id: 'perfume', label: 'น้ำหอม' },
            { id: 'queen', label: 'ควีนบิวตี้' },
            { id: 'gift', label: 'ของขวัญ' },
            { id: 'brand', label: 'แบรนด์' },
            { id: 'discount', label: 'สินค้าลดราคา' },
          ].map((menu) => (
            <div key={menu.id} className={`nav-link ${activeCategory === menu.id ? 'active' : ''}`} onClick={() => handleCategoryClick(menu.id)}>
              {menu.label}
            </div>
          ))}
        </div>

        <div className="search-section">
          <div className="search-bar">
            <input type="text" placeholder="คุณกำลังมองหาอะไรอยู่?" className="search-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={handleKeyDown} />
            <button className="search-btn" onClick={handleSearch}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </button>
          </div>
        </div>

        {isSearching ? (
          <div className="search-results-container">
            <h2 className="section-header">ผลลัพธ์การค้นหา "{searchTerm}" <span style={{fontSize: '16px', color: '#888', marginLeft: '10px'}}>(พบ {filteredList.length} รายการ)</span></h2>
            <div className="product-grid">
              {filteredList.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        ) : getCategoryContent()}
      </main>
      
      <footer className="footer" style={{textAlign: 'center', padding: '40px', background: '#fff0e8'}}>Footer Content</footer>
    </div>
  );
}

export default Home;