import React, { useState, useEffect, useCallback } from 'react';
import '../styles/Home.css';
import '../styles/SearchPage.css';
import ProductCard from '../components/ProductCard';
import { apiFetch } from '../utils/api'; 

const API_URL = import.meta.env.VITE_DIRECTUS_PUBLIC_URL;

export default function Home({ handleProductSelect, activeCategory, isLoggedIn, currentUser }) {
  const [newArrivals, setNewArrivals] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [products, setProducts] = useState([]); 
  const [currentSkinType, setCurrentSkinType] = useState("");
  
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

  const fetchHomeData = useCallback(async (manualSkinType = null) => {
    try {
      setLoading(true);
      const newRes = await apiFetch('/items/product?sort=-date_updated&limit=4&fields=id,name,price,thumbnail,brand_name,status,categories.category_id.name,date_updated&filter[status][_eq]=active');
      const newData = await newRes.json();
      if (newData.data) setNewArrivals(newData.data.map(mapProductData));

      const skinToUse = manualSkinType || currentSkinType || currentUser?.skin_type;
      if (skinToUse) setCurrentSkinType(skinToUse);

      if (isLoggedIn && skinToUse) {
        const recRes = await apiFetch(`/items/product?limit=4&fields=id,name,price,thumbnail,brand_name,status&filter[status][_eq]=active&filter[suitable_skin_type][_contains]=${skinToUse}`);
        if (recRes.ok) {
          const recData = await recRes.json();
          if (recData.data) setRecommended(recData.data.map(mapProductData));
        }
      } else {
        setRecommended([]);
      }
    } catch { 
      console.error("Error fetching home data");
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, currentUser, currentSkinType]);

  const handleSkinChange = async (e) => {
    const newSkinType = e.target.value;
    setCurrentSkinType(newSkinType);
    try {
      await apiFetch('/users/me', {
        method: 'PATCH',
        body: JSON.stringify({ skin_type: newSkinType })
      });
      fetchHomeData(newSkinType); 
    } catch { 
      console.error("Update skin failed");
    }
  };

  const fetchProducts = useCallback(async (searchTerm, categoryId) => {
    try {
        setLoading(true);
        const filterObj = { _and: [{ status: { _eq: 'active' } }] };
        if (searchTerm) {
          filterObj._and.push({ _or: [{ name: { _icontains: searchTerm } }, { brand_name: { _icontains: searchTerm } }] });
        }
        if (categoryId && categoryId !== 'new') {
          filterObj._and.push({ categories: { category_id: { id: { _eq: categoryId } } } });
        }
        const filterParam = JSON.stringify(filterObj);
        const response = await apiFetch(`/items/product?fields=id,name,price,thumbnail,brand_name,categories.category_id.name,date_created,date_updated&sort=-date_updated&filter=${encodeURIComponent(filterParam)}`);
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
    if(activeCategory !== 'new') { setInputValue(""); setExecutedSearchTerm(""); }
    if (activeCategory === 'new' && !executedSearchTerm) fetchHomeData(); 
    else fetchProducts(executedSearchTerm, activeCategory);

    const updateTitle = async () => {
        if (!activeCategory || activeCategory === 'new') { setCategoryTitle("รายการสินค้า"); return; }
        try {
           const res = await apiFetch(`/items/category/${activeCategory}?fields=name`);
           const json = await res.json();
           setCategoryTitle(json.data?.name || "รายการสินค้า");
        } catch { setCategoryTitle("รายการสินค้า"); }
    };
    updateTitle();
  }, [activeCategory, executedSearchTerm, fetchHomeData, fetchProducts]); 

  const handleSearch = () => { const term = inputValue.trim(); setExecutedSearchTerm(term); };
  const handleKeyDown = (e) => { if (e.key === 'Enter') handleSearch(); };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '50px', color: '#666' }}><h3>กำลังโหลดสินค้า...</h3></div>;

  if (!executedSearchTerm && activeCategory === 'new') {
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
           {isLoggedIn && currentUser && (
             <>
               <div className="welcome-banner">
                  <div className="banner-content">
                    <h1>ยินดีต้อนรับ, {currentUser.first_name || currentUser.email} 👋</h1>
                    
                    <div className="skin-selection-group">
                      <span className="skin-label">สภาพผิวของคุณ:</span>
                      <select className="skin-dropdown-premium" value={currentSkinType} onChange={handleSkinChange}>
                        <option value="" disabled>-- เลือกสภาพผิว --</option>
                        <option value="oily">🌸 ผิวมัน</option>
                        <option value="dry">🌵 ผิวแห้ง</option>
                        <option value="combination">🌓 ผิวผสม</option>
                        <option value="sensitive">🛡️ ผิวแพ้ง่าย</option>
                      </select>
                      
                      <a href="https://choicechecker.com/quiz/testing?id=1" target="_blank" rel="noreferrer" className="quiz-action-btn">
                        เริ่มวิเคราะห์สภาพผิว 📝
                      </a>
                    </div>

                    <p className="banner-subtitle-text">
                      ✨ Based on your skin: นี่คือผลิตภัณฑ์ที่ตอบโจทย์ปัญหาผิวของคุณที่สุด
                    </p>
                  </div>
               </div>

               <div className="recommend-outside-area">
                  <h2 className="section-title-custom" style={{fontSize: '1.8rem', fontWeight: '800', marginBottom: '30px', textAlign: 'center'}}>แนะนำพิเศษเพื่อคุณ ✨</h2>
                  
                  <div className="product-list-container">
                  {recommended.length > 0 ? (
                    <div className="horizontal-scroll-list">
                      {recommended.map(p => (
                        <ProductCard key={p.id} product={p} onClick={() => handleProductSelect(p)} />
                      ))}
                    </div>
                  ) : (
                    /* 🔥 แบบใหม่: เรียบ สั้น มินิมอล 🔥 */
                    <div className="simple-empty-state">
                      <p>✨ กำลังคัดสรรสินค้าที่เหมาะกับผิวคุณมาเติมเร็วๆ นี้...</p>
                    </div>
                  )}
                </div>
               </div>
             </>
           )}

           <section className="product-section" style={{ textAlign: 'center', marginTop: '50px' }}>
            <h2 className="section-title-custom" style={{fontSize: '1.8rem', fontWeight: '800', marginBottom: '30px'}}>สินค้าใหม่ล่าสุด 🧴</h2>
            <div className="horizontal-scroll-list">
              {newArrivals.length > 0 ? (newArrivals.map(p => (<ProductCard key={p.id} product={p} onClick={() => handleProductSelect(p)} />))) : (<p style={{color: '#999'}}>ยังไม่มีสินค้าใหม่</p>)}
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container search-page-container">
      {/* Search Result View */}
      <div className="search-section">
        <div className="search-pill">
          <input type="text" placeholder="คุณกำลังมองหาอะไรอยู่?" className="search-input" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown} />
          <button className="search-circle-btn" onClick={handleSearch}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg></button>
        </div>
      </div>
      <div className="home-content">
        {products.length === 0 ? (
           <div className="search-empty-state">
             <h3 className="empty-title">ไม่พบสินค้าที่คุณต้องการ</h3>
           </div>
        ) : (
           <div className="product-section">
             <h2 className="search-title">{executedSearchTerm ? `ผลลัพธ์สำหรับ "${executedSearchTerm}"` : categoryTitle}</h2>
             <div className="product-grid">{products.map(p => (<ProductCard key={p.id} product={p} onClick={() => handleProductSelect(p)} />))}</div>
           </div>
        )}
      </div>
    </div>
  );
}