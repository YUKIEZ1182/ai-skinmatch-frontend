import React, { useState, useEffect, useCallback, useRef } from 'react';
import '../styles/Home.css';
import '../styles/SearchPage.css';
import ProductCard from '../components/ProductCard';
import { apiFetch } from '../utils/api'; 

const API_URL = import.meta.env.VITE_DIRECTUS_PUBLIC_URL;

export default function Home({ activeCategory, handleProductSelect, isLoggedIn, currentUser, onLoginClick }) {  const [newArrivals, setNewArrivals] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [products, setProducts] = useState([]); 
  const [currentSkinType, setCurrentSkinType] = useState("");
  
  const [isSkinDropdownOpen, setIsSkinDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [loading, setLoading] = useState(true); 
  const [inputValue, setInputValue] = useState(""); 
  const [executedSearchTerm, setExecutedSearchTerm] = useState("");
  const [categoryTitle, setCategoryTitle] = useState("รายการสินค้า");

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
    brand: item.brand_name || item.categories?.[0]?.category_id?.name || 'General', 
    
    // 🔥 เพิ่ม field นี้ (เช็คว่าเป็น array หรือ string แล้วแปลงให้เป็น array)
    suitable_skin_type: Array.isArray(item.suitable_skin_type) ? item.suitable_skin_type : (item.suitable_skin_type ? [item.suitable_skin_type] : []),

    date_created: item.date_created,
    date_updated: item.date_updated
  });

  const getThaiSkinType = (type) => {
    switch(type) {
      case 'oily': return 'ผิวมัน';
      case 'dry': return 'ผิวแห้ง';
      case 'combination': return 'ผิวผสม';
      case 'sensitive': return 'ผิวแพ้ง่าย';
      default: return type;
    }
  };

  // 🔥 1. ฟังก์ชันโหลด Header (แก้ fields ให้ดึง suitable_skin_type มาด้วย)
  const fetchHeaderData = useCallback(async (manualSkinType = null) => {
    try {
      setLoading(true);

      // 1.1 สินค้าใหม่ (หน้า Home)
      if (activeCategory === 'home') {
        // เพิ่ม field suitable_skin_type
        const newRes = await apiFetch('/items/product?sort=-date_updated&limit=8&fields=id,name,price,thumbnail,brand_name,status,categories.category_id.name,suitable_skin_type,date_updated&filter[status][_eq]=active');
        const newData = await newRes.json();
        if (newData.data) setNewArrivals(newData.data.map(mapProductData));
      }

      // 1.2 สินค้าแนะนำ
      const skinToUse = manualSkinType || currentSkinType || currentUser?.skin_type;
      
      if (isLoggedIn && skinToUse) {
        setCurrentSkinType(skinToUse);
        
        let filterString = `filter[status][_eq]=active&filter[_or][0][suitable_skin_type][_icontains]=${skinToUse}&filter[_or][1][suitable_skin_type][_icontains]=${getThaiSkinType(skinToUse)}`;

        if (activeCategory && activeCategory !== 'home' && activeCategory !== 'new') {
             filterString += `&filter[categories][category_id][id][_eq]=${activeCategory}`;
        }
        
        // เพิ่ม field suitable_skin_type
        const filterUrl = `/items/product?limit=4&fields=id,name,price,thumbnail,brand_name,status,suitable_skin_type&${filterString}`;
        
        const recRes = await apiFetch(filterUrl);
        if (recRes.ok) {
          const recData = await recRes.json();
          if (recData.data) setRecommended(recData.data.map(mapProductData));
          else setRecommended([]);
        }
      } else {
        setRecommended([]);
      }
    } catch { 
      console.error("Error fetching header data");
    } finally {
        setLoading(false);
    }
  }, [isLoggedIn, currentUser, currentSkinType, activeCategory]);

  const handleSkinChangeForRec = async (skinValue) => {
    setCurrentSkinType(skinValue);
    setIsSkinDropdownOpen(false); 
    try {
      if (isLoggedIn) {
        await apiFetch('/users/me', {
          method: 'PATCH',
          body: JSON.stringify({ skin_type: skinValue })
        });
      }
      fetchHeaderData(skinValue); 
    } catch { console.error("Update skin failed"); }
  };

  // 🔥 2. ฟังก์ชันโหลด Grid (แก้ fields เช่นกัน)
  const fetchProducts = useCallback(async (searchTerm, categoryId) => {
    try {
        setLoading(true);
        const filterObj = { _and: [{ status: { _eq: 'active' } }] };

        if (searchTerm) {
          filterObj._and.push({ _or: [{ name: { _icontains: searchTerm } }, { brand_name: { _icontains: searchTerm } }] });
        }

        if (categoryId && categoryId !== 'home') {
            if (categoryId === 'new') {
                // New category
            } else {
                filterObj._and.push({ categories: { category_id: { id: { _eq: categoryId } } } });
            }
        }

        const filterParam = JSON.stringify(filterObj);
        const sortParam = '-date_updated';

        // เพิ่ม field suitable_skin_type
        const response = await apiFetch(`/items/product?fields=id,name,price,thumbnail,brand_name,categories.category_id.name,suitable_skin_type,date_created,date_updated&sort=${sortParam}&filter=${encodeURIComponent(filterParam)}`);
        const json = await response.json();
        
        if (json.data) setProducts(json.data.map(mapProductData));
        else setProducts([]);

    } catch {
        console.error("Error fetching products");
        setProducts([]);
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser?.skin_type) setCurrentSkinType(currentUser.skin_type);
  }, [currentUser]);

  useEffect(() => {
    if(activeCategory !== 'home') { setInputValue(""); setExecutedSearchTerm(""); }
    
    if (!executedSearchTerm) {
        fetchHeaderData(); 
    }

    if (activeCategory === 'home' && !executedSearchTerm) {
        setLoading(false); 
    } else {
        fetchProducts(executedSearchTerm, activeCategory);
    }

    const updateTitle = async () => {
        if (!activeCategory || activeCategory === 'home') { setCategoryTitle("รายการสินค้า"); return; }
        if (activeCategory === 'new') { setCategoryTitle("สินค้ามาใหม่"); return; }
        try {
           const res = await apiFetch(`/items/category/${activeCategory}?fields=name`);
           const json = await res.json();
           setCategoryTitle(json.data?.name || "รายการสินค้า");
        } catch { setCategoryTitle("รายการสินค้า"); }
    };
    updateTitle();
  }, [activeCategory, executedSearchTerm, fetchHeaderData, fetchProducts]); 

  const handleSearch = () => { const term = inputValue.trim(); setExecutedSearchTerm(term); };
  const handleKeyDown = (e) => { if (e.key === 'Enter') handleSearch(); };

  if (loading && activeCategory !== 'home') return <div style={{ display: 'flex', justifyContent: 'center', padding: '50px', color: '#666' }}><h3>กำลังโหลดสินค้า...</h3></div>;

  return (
    <div className="home-container search-page-container"> 
      <div className="search-section">
        <div className="search-pill">
          <input type="text" placeholder="คุณกำลังมองหาอะไรอยู่?" className="search-input" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown} />
          <button className="search-circle-btn" onClick={handleSearch}>
             <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </button>
        </div>
      </div>
      
      <div className="home-content">
        
        {/* Header Section */}
        {!executedSearchTerm && (
           <>
              {isLoggedIn && currentUser ? (
                <>
                  {activeCategory === 'home' && (
                    <div className="watsons-dashboard">
                        <div className="dashboard-header">
                        <span className="sub-greet">สวัสดีชาว SkinMatch!</span>
                        <h1>
                            ยินดีต้อนรับ, {currentUser.first_name || currentUser.email} 
                            <span className="icon-3d-small wave-effect" style={{display:'inline-block'}}>👋</span>
                        </h1>
                        </div>

                        <div className="dashboard-icons-scroll">
                        <div 
                            className="dashboard-item skin-selector-wrapper"
                            ref={dropdownRef} 
                            onClick={() => setIsSkinDropdownOpen(!isSkinDropdownOpen)}
                        >
                            <div className="circle-icon">
                            <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#F1978C', whiteSpace: 'nowrap' }}>
                                {currentSkinType === 'oily' ? 'ผิวมัน' : currentSkinType === 'dry' ? 'ผิวแห้ง' : currentSkinType === 'combination' ? 'ผิวผสม' : currentSkinType === 'sensitive' ? 'แพ้ง่าย' : 'ระบุ'}
                            </span>
                            </div>
                            <div className="item-label">
                            <span className="small-label">สภาพผิวของคุณ</span>
                            <div className="main-label-row">
                                <span className="main-label">
                                {currentSkinType === 'oily' ? 'ผิวมัน' : currentSkinType === 'dry' ? 'ผิวแห้ง' : currentSkinType === 'combination' ? 'ผิวผสม' : currentSkinType === 'sensitive' ? 'ผิวแพ้ง่าย' : 'เลือกที่นี่'}
                                </span>
                                <svg className={`dropdown-icon ${isSkinDropdownOpen ? 'rotate-arrow' : ''}`} width="12" height="12" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z" /></svg>
                            </div>
                            </div>
                            {isSkinDropdownOpen && (
                            <div className="custom-dropdown-menu">
                                <div className={`dropdown-option ${currentSkinType === 'oily' ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); handleSkinChangeForRec('oily'); }}>🌸 ผิวมัน</div>
                                <div className={`dropdown-option ${currentSkinType === 'dry' ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); handleSkinChangeForRec('dry'); }}>🌵 ผิวแห้ง</div>
                                <div className={`dropdown-option ${currentSkinType === 'combination' ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); handleSkinChangeForRec('combination'); }}>🌓 ผิวผสม</div>
                                <div className={`dropdown-option ${currentSkinType === 'sensitive' ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); handleSkinChangeForRec('sensitive'); }}>🛡️ ผิวแพ้ง่าย</div>
                            </div>
                            )}
                        </div>

                        <a href="https://choicechecker.com/quiz/testing?id=1" target="_blank" rel="noreferrer" className="dashboard-item" style={{ textDecoration: 'none' }}>
                            <div className="circle-icon"><span style={{ fontSize: '1.2rem' }}>📋</span></div>
                            <div className="item-label"><span className="small-label" style={{ color: '#ff9800', fontWeight: 'bold' }}>ไม่แน่ใจ?</span><span className="main-label">ทำแบบทดสอบ ↗</span></div>
                        </a>
                        </div>
                    </div>
                  )}

                  <div className="recommend-outside-area" style={{ marginTop: '20px' }}>
                    <div className="section-header-flex">
                      <h2 className="section-title-custom" style={{fontSize: '1.5rem', fontWeight: '800', display: 'flex', alignItems: 'center'}}>
                          {activeCategory === 'home' ? `แนะนำพิเศษเพื่อคุณ` : `แนะนำในหมวดนี้`} 
                          <span className="icon-3d-small" style={{marginLeft:8}}>💖</span>
                      </h2>
                      {currentSkinType && (<span className="skin-badge">สำหรับ: {getThaiSkinType(currentSkinType)}</span>)}
                    </div>
                    
                    <div className="product-list-container">
                      {recommended.length > 0 ? (
                        <div className="horizontal-scroll-list">
                          {recommended.map(p => (<ProductCard key={p.id} product={p} onClick={() => handleProductSelect(p)} />))}
                        </div>
                      ) : (
                        <div className="simple-empty-state">
                           <div className="empty-state-content">
                              <p style={{fontSize: '1rem', margin: 0}}>
                                {currentSkinType 
                                    ? (activeCategory === 'home' ? "ยังไม่มีสินค้าแนะนำสำหรับผิวนี้" : "ไม่พบสินค้าแนะนำในหมวดหมู่นี้") 
                                    : "เลือกสภาพผิวเพื่อดูสินค้าแนะนำ"
                                }
                              </p>
                           </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                /* Banner Guest (Home Only) */
                activeCategory === 'home' && (
                    <div style={{ background: 'linear-gradient(135deg, #FFF5F4 0%, #ffffff 100%)', borderRadius: '16px', padding: '30px 20px', marginBottom: '40px', textAlign: 'center', border: '1px solid #FFEBE9', boxShadow: '0 4px 15px rgba(241, 151, 140, 0.1)' }}>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#333', marginBottom: '8px' }}>ค้นหาสกินแคร์ที่ใช่สำหรับผิวคุณ ✨</h2>
                    <p style={{ color: '#666', marginBottom: '20px', fontSize: '0.95rem' }}>เข้าสู่ระบบเพื่อรับคำแนะนำสินค้าที่เหมาะกับคุณโดยเฉพาะ</p>
                      <button 
                          onClick={onLoginClick} 
                          style={{ 
                              background: '#281D1B', 
                              color: 'white', 
                              border: 'none', 
                              padding: '10px 24px', 
                              borderRadius: '50px', 
                              fontSize: '0.9rem', 
                              fontWeight: '600', 
                              cursor: 'pointer' 
                          }}
                      >
                          เข้าสู่ระบบ
                      </button>                    
                    </div>
                )
              )}
           </>
        )}

        {/* Product Grid */}
        {!executedSearchTerm && activeCategory === 'home' ? (
           <section className="product-section" style={{ textAlign: 'left', marginTop: '10px' }}>
                <h2 className="section-title-custom" style={{fontSize: '1.5rem', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center'}}>
                    สินค้าใหม่ล่าสุด <span className="icon-3d-small">🆕</span>
                </h2>
                <div className="product-grid">
                  {newArrivals.length > 0 ? (
                    newArrivals.map(p => (<ProductCard key={p.id} product={p} onClick={() => handleProductSelect(p)} />))
                  ) : (
                    <p style={{color: '#999'}}>ยังไม่มีสินค้าใหม่</p>
                  )}
                </div>
           </section>
        ) : (
           products.length === 0 ? (
             <div className="search-empty-state"><h3 className="empty-title">ไม่พบสินค้าในหมวดหมู่นี้</h3></div>
           ) : (
             <div className="product-section">
               <h2 className="search-title">{executedSearchTerm ? `ผลลัพธ์สำหรับ "${executedSearchTerm}"` : categoryTitle}</h2>
               <div className="product-grid">{products.map(p => (<ProductCard key={p.id} product={p} onClick={() => handleProductSelect(p)} />))}</div>
             </div>
           )
        )}
      </div>
    </div>
  );
}