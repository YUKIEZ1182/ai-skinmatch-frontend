import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Cart.css';
import { mockProducts } from '../data/mockData'; 

export default function CartPage({ cartItems, onRemoveItem, onUpdateQuantity, onAddToCart }) {
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Logic สินค้าแนะนำ (ใส่ Fallback กันเหนียวไว้แล้ว)
  let recommendations = mockProducts.filter(p => p.id === 102 || p.id === 105);
  if (recommendations.length === 0) {
    recommendations = mockProducts.slice(0, 2);
  }

  useEffect(() => {
    const availableItems = cartItems.filter(item => item.status !== 'out_of_stock');
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
      const availableItems = cartItems.filter(item => item.status !== 'out_of_stock');
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

  // ✅ แก้ไข 1: คำนวณราคารวมแบบปลอดภัย (กัน NaN)
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
  
  const availableItemsCount = cartItems.filter(item => item.status !== 'out_of_stock').length;
  const isAllSelected = availableItemsCount > 0 && selectedIds.length === availableItemsCount;

  return (
    <div className="cart-page-container">
      <div className="cart-layout">
        
        {/* --- Left Column: List --- */}
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
            const isOutOfStock = item.status === 'out_of_stock';
            
            // ✅ แก้ไข 2: แปลงค่าให้ปลอดภัยก่อนแสดงผล
            const displayPrice = Number(item.price) || 0;
            const displayQty = Number(item.quantity) || 1; // ถ้าไม่มีจำนวน ให้โชว์เลข 1 ไว้ก่อน

            return (
              <div key={item.id} className={`cart-item-group ${isOutOfStock ? 'group-out-of-stock' : ''}`}>
                <div className="cart-item-row">
                  {/* Checkbox */}
                  <div className="col-checkbox">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(item.id)}
                      onChange={() => handleSelectOne(item.id)}
                      className="custom-checkbox"
                      disabled={isOutOfStock}
                    />
                  </div>
                  
                  {/* Image */}
                  <div className="col-img">
                    <div className="img-wrapper">
                      <img src={item.image} alt={item.name} onError={(e) => e.target.src='https://via.placeholder.com/80'} />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="col-info">
                    <span className="cart-item-brand">{item.brand || "Brand"}</span>
                    <span className="cart-item-name">{item.name}</span>
                  </div>

                  {/* Price */}
                  <div className="col-price">
                    <div className="price-group" style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
                       {/* ใช้ displayPrice ที่เราแปลงไว้ */}
                       <span className="item-price">{displayPrice.toLocaleString('en-US', {minimumFractionDigits: 2})} Baht</span>
                       {isOutOfStock && <span className="stock-warning">สินค้าหมดชั่วคราว</span>}
                    </div>
                  </div>

                  {/* Quantity Buttons */}
                  <div className="col-qty">
                    <div className={`qty-simple ${isOutOfStock ? 'hidden-qty' : ''}`}>
                      <button className="qty-btn" onClick={() => onUpdateQuantity(item.id, -1)}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                      </button>
                      <span>{displayQty}</span>
                      <button className="qty-btn" onClick={() => onUpdateQuantity(item.id, 1)}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                      </button>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <div className="col-action">
                    <button className="delete-btn" onClick={() => onRemoveItem(item.id)}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999"strokeWidth="2" strokeLinecap="round"  strokeLinejoin="round">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2V6"></path>
                        <path d="M8 6V4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                </div>
                {isOutOfStock && (
                  <div className="recommendation-section">
                    <h4 className="rec-header">สินค้าที่มีส่วนผสมคล้ายคลึงกัน</h4>
                    <div className="rec-grid">
                      {recommendations.map(rec => (
                        <div key={rec.id} className="rec-card">
                           <div className="rec-img-box">
                             <img src={rec.image} alt={rec.name} onError={(e) => e.target.src='https://via.placeholder.com/60'} />
                           </div>
                           <div className="rec-info-col">
                              <span className="rec-brand">{rec.brand}</span>
                              <span className="rec-name">{rec.name}</span>
                           </div>
                           <div className="rec-price-col">
                              <span className="rec-price">{Number(rec.price).toLocaleString('en-US', {minimumFractionDigits: 2})} Baht</span>
                           </div>
                           <button className="rec-add-btn-black" onClick={() => onAddToCart(rec, 1)}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                           </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* --- Right Column: Summary --- */}
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
                {/* ใช้ totalPrice ที่คำนวณแบบปลอดภัยแล้ว */}
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