import React, { useState, useEffect, useCallback, useRef } from 'react';
import '../styles/Home.css';
import '../styles/SearchPage.css';
import ProductCard from '../components/ProductCard';
import { apiFetch, getRecommendedProducts } from '../utils/api';
import { mockProducts } from '../data/mockData'; 

const API_URL = import.meta.env.VITE_DIRECTUS_PUBLIC_URL;

export default function Home({ activeCategory, handleProductSelect, isLoggedIn, currentUser }) {
  const [newArrivals, setNewArrivals] = useState([]);
  const [saleItems, setSaleItems] = useState([]); 
  const [recommended, setRecommended] = useState([]);
  const [products, setProducts] = useState([]); 
  const [currentSkinType, setCurrentSkinType] = useState("");
  
  const [isSkinDropdownOpen, setIsSkinDropdownOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingSkinType, setPendingSkinType] = useState(null);

  const dropdownRef = useRef(null);
  
  const [loading, setLoading] = useState(true); 
  const [inputValue, setInputValue] = useState(""); 
  const [executedSearchTerm, setExecutedSearchTerm] = useState("");
  const [categoryTitle, setCategoryTitle] = useState("สินค้าทั้งหมด");

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsSkinDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => { document.removeEventListener("mousedown", handleClickOutside); };
  }, [dropdownRef]);

  const mapProductData = (item) => ({
    id: item.id,
    name: item.name,
    price: Number(item.price), 
    image: item.thumbnail ? `${API_URL}/assets/${item.thumbnail}` : 'https://placehold.co/400x400?text=No+Image', 
    brand: item.brand_name || item.categories?.[0]?.category_id?.name || 'Brand', 
    suitable_skin_type: Array.isArray(item.suitable_skin_type) ? item.suitable_skin_type : (item.suitable_skin_type ? [item.suitable_skin_type] : []),
    date_created: item.date_created,
    date_updated: item.date_updated,
    status: item.status,
    quantity: item.quantity
  });

  const getThaiSkinType = (type) => {
    const map = { oily: 'ผิวมัน', dry: 'ผิวแห้ง', combination: 'ผิวผสม', sensitive: 'แพ้ง่าย' };
    return map[type] || type;
  };

  const lastFetchedRef = useRef({ skinType: null, categoryId: null });

  const fetchHeaderData = useCallback(async (manualSkinType = null) => {
    const skinToUse = manualSkinType || currentSkinType || currentUser?.skin_type;
    
    // Check if we are already fetching the same data
    if (lastFetchedRef.current.skinType === skinToUse && lastFetchedRef.current.categoryId === activeCategory) {
      return;
    }
    
    setLoading(true);
    lastFetchedRef.current = { skinType: skinToUse, categoryId: activeCategory };
    
    try {
      if (activeCategory === 'home') {
        // 1. สินค้าใหม่
        try {
            const newRes = await apiFetch('/items/product?sort=-date_created&limit=20&fields=id,name,price,thumbnail,brand_name,status,categories.category_id.name,suitable_skin_type,date_updated,quantity');
            const newData = await newRes.json();
            if (newData.data) setNewArrivals(newData.data.map(mapProductData));
        } catch (err) { console.warn(err); }
      }

      const discountedMock = mockProducts
        .filter(item => item.type === 'discount' || item.originalPrice)
        .map(item => ({
          ...item,
          // ตรวจสอบให้แน่ใจว่ามีฟิลด์ brand สำหรับ ProductCard
          brand: item.brand || 'Brand' 
        }));
      setSaleItems(discountedMock);

      // 3. สินค้าแนะนำ
      if (isLoggedIn && skinToUse) {
        try {
          const recData = await getRecommendedProducts(skinToUse, activeCategory);
          let items = Array.isArray(recData) ? recData : (recData.data || []);
          setRecommended(items.map(mapProductData));
        } catch (recErr) { console.warn(recErr); setRecommended([]); }
      } else {
        setRecommended([]);
      }
    } catch (mainErr) { console.error(mainErr); } finally { setLoading(false); }
  }, [isLoggedIn, currentUser, currentSkinType, activeCategory]);

  const handleSkinOptionClick = (skinValue) => {
    if (skinValue === currentSkinType) { setIsSkinDropdownOpen(false); return; }
    setPendingSkinType(skinValue);
    setIsSkinDropdownOpen(false);
    setShowConfirmModal(true);
  };

  const confirmChangeSkin = async () => {
    if (!pendingSkinType) return;
    setCurrentSkinType(pendingSkinType);
    setShowConfirmModal(false);
    try {
      if (isLoggedIn) await apiFetch('/users/me', { method: 'PATCH', body: JSON.stringify({ skin_type: pendingSkinType }) });
      // The useEffect will trigger fetchHeaderData when currentSkinType updates
    } catch (error) { console.error(error); }
  };

  const fetchProducts = useCallback(async (searchTerm, categoryId) => {
    setLoading(true);
    try {
        const filterObj = { _and: [] };
        if (searchTerm) filterObj._and.push({ _or: [{ name: { _icontains: searchTerm } }, { brand_name: { _icontains: searchTerm } }] });
        if (categoryId && categoryId !== 'home' && categoryId !== 'new') filterObj._and.push({ categories: { category_id: { id: { _eq: categoryId } } } });

        const filterParam = filterObj._and.length > 0 ? `&filter=${encodeURIComponent(JSON.stringify(filterObj))}` : '';
        const response = await apiFetch(`/items/product?limit=50&fields=id,name,price,thumbnail,brand_name,categories.category_id.name,suitable_skin_type,date_created,date_updated,status,quantity&sort=-date_created${filterParam}`);
        const json = await response.json();
        if (json.data) setProducts(json.data.map(mapProductData));
    } catch (err) { console.warn(err); setProducts([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { if (currentUser?.skin_type) setCurrentSkinType(currentUser.skin_type); }, [currentUser]);
  useEffect(() => { setInputValue(""); setExecutedSearchTerm(""); }, [activeCategory]); 
  
  useEffect(() => {
    if (!executedSearchTerm) fetchHeaderData(); 
    if (activeCategory === 'home' && !executedSearchTerm) { setProducts([]); } else { fetchProducts(executedSearchTerm, activeCategory); }
    const updateTitle = async () => {
        if (!activeCategory || activeCategory === 'home') { setCategoryTitle("สินค้าทั้งหมด"); return; }
        if (activeCategory === 'new') { setCategoryTitle("สินค้ามาใหม่"); return; }
        try { const res = await apiFetch(`/items/category/${activeCategory}?fields=name`); const json = await res.json(); setCategoryTitle(json.data?.name || "รายการสินค้า"); } catch { setCategoryTitle("รายการสินค้า"); }
    };
    updateTitle();
  }, [activeCategory, executedSearchTerm, fetchHeaderData, fetchProducts]); 

  const handleSearch = () => { setExecutedSearchTerm(inputValue.trim()); };
  const handleKeyDown = (e) => { if (e.key === 'Enter') handleSearch(); };

  if (loading && activeCategory !== 'home') return <div className="loading-spinner-home">กำลังโหลด...</div>;

  return (
    <div className="home-container search-page-container"> 
      <div className="search-section">
        <div className="search-pill">
          <input type="text" placeholder="คุณกำลังมองหาอะไรอยู่?" className="search-input" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown} />
          <button className="search-circle-btn" onClick={handleSearch}>
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </button>
        </div>
      </div>
      
      <div className="home-content">
        {!executedSearchTerm && (
           <>
              {isLoggedIn && currentUser && activeCategory === 'home' && (
                <div className="watsons-dashboard">
                    <div className="dashboard-header">
                        <span className="sub-greet">ยินดีต้อนรับกลับมา</span>
                        <h1>{currentUser.first_name || currentUser.email}</h1>
                    </div>
                    <div className="dashboard-icons-scroll">
                        <div className="dashboard-item skin-selector-wrapper" ref={dropdownRef} onClick={() => setIsSkinDropdownOpen(!isSkinDropdownOpen)}>
                            <div className="circle-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div>
                            <div className="item-label">
                                <span className="small-label">สภาพผิวของคุณ</span>
                                <div className="main-label-row">
                                    <span className="main-label">{currentSkinType ? getThaiSkinType(currentSkinType) : 'เลือกสภาพผิว'}</span>
                                    <svg style={{transform: isSkinDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.2s'}} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                </div>
                            </div>
                            {isSkinDropdownOpen && (
                            <div className="custom-dropdown-menu">
                                <div className={`dropdown-option ${currentSkinType === 'oily' ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); handleSkinOptionClick('oily'); }}>💧 ผิวมัน</div>
                                <div className={`dropdown-option ${currentSkinType === 'dry' ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); handleSkinOptionClick('dry'); }}>🌵 ผิวแห้ง</div>
                                <div className={`dropdown-option ${currentSkinType === 'combination' ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); handleSkinOptionClick('combination'); }}>🌓 ผิวผสม</div>
                                <div className={`dropdown-option ${currentSkinType === 'sensitive' ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); handleSkinOptionClick('sensitive'); }}>🛡️ ผิวแพ้ง่าย</div>
                            </div>
                            )}
                        </div>
                        <a href="https://choicechecker.com/quiz/testing?id=1" target="_blank" rel="noreferrer" className="dashboard-item">
                            <div className="circle-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg></div>
                            <div className="item-label"><span className="small-label">ยังไม่แน่ใจ?</span><span className="main-label">ทำแบบทดสอบ</span></div>
                        </a>
                    </div>
                </div>
              )}

              {isLoggedIn && currentUser && (
                <div className="recommend-outside-area">
                    <div className="section-header-flex">
                      <h2 className="section-title-custom">
                          AI Matching: สกินแคร์ที่ใช่...เพื่อผิวคุณ
                          <div className="ai-icon-wrapper">
                             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
                          </div>
                      </h2>
                      {currentSkinType && (<span className="skin-badge">{getThaiSkinType(currentSkinType)}</span>)}
                    </div>
                    <div className="product-list-container">
                      {recommended.length > 0 ? (
                        <div className="scroll-container-wrapper">
                            <div className="horizontal-scroll-list">
                                {recommended.map(p => (<ProductCard key={p.id} product={p} onClick={() => handleProductSelect(p)} />))}
                            </div>
                        </div>
                      ) : (
                        <div className="simple-empty-state"><p>เลือกสภาพผิวเพื่อรับคำแนะนำจาก AI</p></div>
                      )}
                    </div>
                </div>
              )}
           </>
        )}

        {!executedSearchTerm && activeCategory === 'home' && (
           <>
              <section className="product-section">
                  <div className="section-header-flex">
                       <h2 className="section-title-custom">สินค้ามาใหม่ <span className="badge-base badge-new">NEW!</span></h2>
                  </div>
                  <div className="scroll-container-wrapper">
                    <div className="horizontal-scroll-list">
                      {newArrivals.map(p => (<ProductCard key={p.id} product={p} onClick={() => handleProductSelect(p)} />))}
                    </div>
                  </div>
              </section>

              {saleItems.length > 0 && (
                <section className="product-section" style={{marginBottom: '60px'}}>
                    <div className="section-header-flex">
                        <h2 className="section-title-custom">สินค้าลดราคาพิเศษ <span className="badge-base badge-sale">SALE 🏷️</span></h2>
                    </div>
                    <div className="scroll-container-wrapper">
                      <div className="horizontal-scroll-list">
                        {saleItems.map(p => (<ProductCard key={p.id} product={p} onClick={() => handleProductSelect(p)} />))}
                      </div>
                    </div>
                </section>
              )}
           </>
        )}

        {(executedSearchTerm || activeCategory !== 'home') && (
           <div className="product-section">
             <h2 className="section-title-custom" style={{marginBottom:'30px'}}>{executedSearchTerm ? `ผลการค้นหา: "${executedSearchTerm}"` : categoryTitle}</h2>
             {products.length === 0 ? (
                <div className="search-empty-state"><h3>ไม่พบสินค้าที่คุณค้นหา</h3></div>
             ) : (
                <div className="product-grid">{products.map(p => (<ProductCard key={p.id} product={p} onClick={() => handleProductSelect(p)} />))}</div>
             )}
           </div>
        )}
      </div>

      {showConfirmModal && (
        <div className="skin-modal-overlay" onClick={() => setShowConfirmModal(false)}>
            <div className="skin-modal-box" onClick={(e) => e.stopPropagation()}>
                <div className="skin-modal-icon-container">
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
                </div>
                <h3 className="skin-modal-title">เปลี่ยนสภาพผิว?</h3>
                <p className="skin-modal-desc">ต้องการเปลี่ยนเป็น <strong>"{getThaiSkinType(pendingSkinType)}"</strong> ใช่หรือไม่?</p>
                <div className="skin-modal-actions">
                    <button className="btn-modal-cancel" onClick={() => setShowConfirmModal(false)}>ยกเลิก</button>
                    <button className="btn-modal-confirm" onClick={confirmChangeSkin}>ยืนยัน</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}