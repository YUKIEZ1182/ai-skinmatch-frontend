import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Cart.css';
import '../styles/App.css';
import '../styles/ProductDetail.css';

export default function Cart() {
  const cartItems = [
    { id: 1, brand: 'The Ordinary', name: 'Hyaluronic Acid 2% + B5', price: 350.00, image: 'https://via.placeholder.com/100', qty: 1 },
    { id: 2, brand: 'L\'Oreal', name: 'Revitalift Hyaluronic Acid Serum', price: 899.00, image: 'https://via.placeholder.com/100', qty: 1 },
  ];
  
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0);

  return (
    <div>
      <div className="breadcrumb"><Link to="/" className="breadcrumb-link">หน้าแรก</Link> <span className="breadcrumb-separator"> &gt; </span> <span>ตะกร้าสินค้า</span></div>
      <main className="cart-container">
        <h1 className="cart-title">รายการสินค้า ({cartItems.length})</h1>
        <div className="cart-layout">
          <div className="cart-items-list">
            <div className="cart-item-header"><div>รายการสินค้า</div><div>ราคา</div><div>จำนวน</div><div>แก้ไข</div></div>
            {cartItems.map(item => (
              <div key={item.id} className="cart-item">
                <div className="product-info-cell">
                  <input type="checkbox" defaultChecked style={{marginRight: '10px', transform: 'scale(1.2)'}} />
                  <img src={item.image} alt={item.name} />
                  <div className="product-details"><div className="brand">{item.brand}</div><div className="name">{item.name}</div></div>
                </div>
                <div className="cart-item-price">{item.price.toLocaleString()}</div>
                <div className="qty-selector" style={{height: '40px'}}>
                  <button className="qty-btn" style={{fontSize: '18px'}}>−</button>
                  <span className="qty-number" style={{fontSize: '16px'}}>{item.qty}</span>
                  <button className="qty-btn" style={{fontSize: '18px'}}>+</button>
                </div>
                <div className="cart-item-delete">🗑️</div>
              </div>
            ))}
          </div>
          <div className="summary-box">
            <h2 className="summary-title">รายการสินค้า</h2>
            <div className="summary-row"><span>สินค้าทั้งหมด</span><span>{cartItems.length}</span></div>
            <div className="summary-row"><span>ยอดรวม</span><span>{subtotal.toLocaleString()} Baht</span></div>
            <div className="summary-row summary-total"><span>ยอดรวม</span><span className="price">{subtotal.toLocaleString()} Baht</span></div>
            <div className="summary-note">(ไม่รวมค่าจัดส่ง)</div>
            <button className="checkout-btn">ตกลงสั่งซื้อ</button>
          </div>
        </div>
      </main>
    </div>
  );
}