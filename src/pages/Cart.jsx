import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Cart.css';
import { mockProducts } from '../data/mockData'; 

// --- 🛠️ SVG ICONS (ชุดใหม่: ถังขยะ, บวก, ลบ) ---
const IconTrash = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);
const IconMinus = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);
const IconPlus = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

export default function CartPage({ cartItems, onRemoveItem, onUpdateQuantity, onAddToCart }) {
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Recommendation logic
  let recommendations = mockProducts.filter(p => p.id === 102 || p.id === 105);
  if (recommendations.length === 0) recommendations = mockProducts.slice(0, 2);

  useEffect(() => {
    const availableItems = cartItems.filter(item => item.stock > 0);
    const availableIds = availableItems.map(item => item.id);
    
    if (!isInitialized && availableIds.length > 0) {
      setSelectedIds(availableIds);
      setIsInitialized(true);
    } else {
      setSelectedIds(prev => prev.filter(id => availableIds.includes(id)));
    }
  }, [cartItems, isInitialized]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const availableItems = cartItems.filter(item => item.stock > 0);
      setSelectedIds(availableItems.map(item => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(itemId => itemId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const selectedItems = cartItems.filter(item => selectedIds.includes(item.id));

  const totalPrice = selectedItems.reduce((sum, item) => {
    const price = Number(item.price) || 0;
    const qty = Number(item.quantity) || 0;
    return sum + (price * qty);
  }, 0);

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      alert("กรุณาเลือกสินค้าอย่างน้อย 1 ชิ้น");
      return;
    }
    navigate('/checkout', { state: { selectedItems, totalPrice } });
  };

  const availableItemsCount = cartItems.filter(item => item.stock > 0).length;
  const isAllSelected = availableItemsCount > 0 && selectedIds.length === availableItemsCount;

  // สไตล์สำหรับปุ่ม Icon (แบบ Minimal ไม่มีขอบ)
  const iconButtonStyle = {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px',
    color: '#333',
    transition: 'color 0.2s, transform 0.1s'
  };

  return (
    <div className="cart-page-container">
      <div className="cart-layout">
        <div className="cart-list-container">
          <div className="cart-header-row">
            <div className="col-checkbox-header">
              <input type="checkbox" checked={isAllSelected} onChange={handleSelectAll} className="custom-checkbox"/>
              <span className="header-label">ทั้งหมด</span>
            </div>
            <div className="col-product">รายการสินค้า</div>
            <div className="col-price text-center">ราคา</div>
            <div className="col-qty text-center">จำนวน</div>
            <div className="col-action text-center">แก้ไข</div>
          </div>
          
          {cartItems.map((item) => {
            const isOutOfStock = item.stock <= 0;
            const displayPrice = Number(item.price) || 0;
            const displayQty = Number(item.quantity) || 1;
            
            return (
              <div key={item.id} className={`cart-item-group ${isOutOfStock ? 'group-out-of-stock' : ''}`}>
                <div className="cart-item-row">
                  <div className="col-checkbox">
                    <input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => handleSelectOne(item.id)} className="custom-checkbox" disabled={isOutOfStock}/>
                  </div>
                  <div className="col-img">
                    <div className="img-wrapper">
                      <img src={item.image} alt={item.name} onError={(e) => e.target.src='https://via.placeholder.com/80'} />
                    </div>
                  </div>
                  <div className="col-info">
                    <span className="cart-item-brand">{item.brand || "Brand"}</span>
                    <span className="cart-item-name">{item.name}</span>
                  </div>
                  <div className="col-price">
                    <div className="price-group" style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
                       <span className="item-price">{displayPrice.toLocaleString('en-US', {minimumFractionDigits: 2})} Baht</span>
                       {isOutOfStock && <span className="stock-warning">สินค้าหมดชั่วคราว</span>}
                    </div>
                  </div>
                  <div className="col-qty">
                    <div className={`qty-simple ${isOutOfStock ? 'hidden-qty' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
                      {/* 🔹 ปุ่มลบ (Icon Minus) */}
                      <button 
                        onClick={() => onUpdateQuantity(item.id, -1)} 
                        style={iconButtonStyle}
                        title="ลดจำนวน"
                      >
                        <IconMinus />
                      </button>
                      
                      <span style={{ fontSize: '16px', fontWeight: '500', minWidth: '20px', textAlign: 'center' }}>{displayQty}</span>
                      
                      {/* 🔹 ปุ่มบวก (Icon Plus) */}
                      <button 
                        onClick={() => onUpdateQuantity(item.id, 1)} 
                        style={iconButtonStyle}
                        title="เพิ่มจำนวน"
                      >
                        <IconPlus />
                      </button>
                    </div>
                  </div>
                  <div className="col-action">
                    {/* 🔹 ปุ่มถังขยะ (Icon Trash) */}
                    <button 
                      onClick={() => onRemoveItem(item.id)}
                      style={{ ...iconButtonStyle, color: '#999' }} // สีจางๆ หน่อย
                      onMouseEnter={(e) => e.currentTarget.style.color = '#ff4d4f'} // ชี้แล้วเป็นสีแดง
                      onMouseLeave={(e) => e.currentTarget.style.color = '#999'}
                      title="ลบรายการ"
                    >
                      <IconTrash />
                    </button>
                  </div>
                </div>
                
                {isOutOfStock && (
                  <div className="recommendation-section">
                    <h4 className="rec-header">สินค้าที่มีส่วนผสมคล้ายคลึงกัน</h4>
                    {/* ...Recommendation components... */}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Summary Box */}
        <div className="cart-summary-container">
          <div className="summary-box">
            <h3 className="summary-title">รายการสินค้า</h3>
            <div className="summary-row">
              <span>สินค้าที่เลือก</span>
              <span>{selectedIds.length} รายการ</span>
            </div>
            <div className="summary-row total-row">
              <span>ยอดรวม</span>
              <div className="total-group">
                <span className="total-price">{totalPrice.toLocaleString('en-US', {minimumFractionDigits: 2})} Baht</span>
                <span className="tax-note">(ไม่รวมค่าจัดส่ง)</span>
              </div>
            </div>
            <button className="checkout-btn" onClick={handleCheckout}>ตกลงสั่งซื้อ</button>
          </div>
        </div>
      </div>
    </div>
  );
}