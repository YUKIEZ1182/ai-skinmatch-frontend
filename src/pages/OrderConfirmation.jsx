import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/OrderConfirmation.css';

export default function OrderConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();

  const { selectedItems = [], totalPrice = 0 } = location.state || {};
  
  const shippingCost = 60; 
  const grandTotal = totalPrice + shippingCost;
  
  const orderDate = new Date().toLocaleDateString('th-TH', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  const orderId = "AI-SK-" + Math.floor(100000 + Math.random() * 900000);

  return (
    <div className="order-page-wrapper">
      
      {/* ✅✅✅ ส่วนหัว: แก้ให้ตรงตาม UI สีเหลือง รูปนาฬิกา */}
      <div className="status-header">
        <div className="status-icon-circle pending-theme">
          {/* ไอคอนนาฬิกา */}
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </div>
        <h2 className="status-title pending-text">รอดำเนินการชำระเงิน</h2>
        <p className="status-subtitle">โปรดยืนยันการชำระเงินตามรายละเอียดด้านล่าง</p>
      </div>

      <div className="order-layout">
        
        {/* ฝั่งซ้าย: รายละเอียดสินค้า */}
        <div className="order-details-section">
          <div className="section-card">
            <h3 className="section-header">รายละเอียดสินค้า</h3>
            
            <div className="order-items-list">
              {selectedItems.map((item) => (
                <div key={item.id} className="order-item-row">
                  <div className="item-img-wrapper">
                       <img src={item.image} alt={item.name} />
                  </div>
                  <div className="item-info">
                    <div className="item-brand">{item.brand}</div>
                    <div className="item-name">{item.name}</div>
                    <div className="item-qty">จำนวน: {item.quantity} ชิ้น</div>
                  </div>
                  <div className="item-price">
                    {(item.price * item.quantity).toLocaleString('en-US', {minimumFractionDigits: 2})} Baht
                  </div>
                </div>
              ))}
            </div>

            <div className="order-cost-summary">
                <div className="cost-row">
                  <span>ยอดรวมสินค้า</span>
                  <span>{totalPrice.toLocaleString('en-US', {minimumFractionDigits: 2})} Baht</span>
                </div>
                <div className="cost-row">
                  <span>ค่าจัดส่ง</span>
                  <span>{shippingCost.toLocaleString('en-US', {minimumFractionDigits: 2})} Baht</span>
                </div>
                <div className="cost-divider"></div>
                <div className="cost-row total">
                  <span>ยอดรวมสุทธิ</span>
                  <span>{grandTotal.toLocaleString('en-US', {minimumFractionDigits: 2})} Baht</span>
                </div>
            </div>
          </div>
        </div>

        {/* ฝั่งขวา: สรุปคำสั่งซื้อ */}
        <div className="order-summary-sidebar">
           <div className="sidebar-card">
             <h3 className="sidebar-header">สรุปคำสั่งซื้อ</h3>
             
             <div className="sidebar-row">
               <span className="label">หมายเลขคำสั่งซื้อ</span>
               <span className="value">{orderId}</span>
             </div>
             <div className="sidebar-row">
               <span className="label">วันที่สั่งซื้อ</span>
               <span className="value">{orderDate}</span>
             </div>
             <div className="sidebar-row">
               <span className="label">วิธีชำระเงิน</span>
               <span className="value">ชำระเงินปลายทาง</span>
             </div>
             <div className="sidebar-row">
               <span className="label">สถานะการชำระเงิน</span>
               <span className="status-tag pending">รอชำระเงิน</span>
             </div>

             <button className="btn-pay-now">ชำระเงิน</button>
           </div>

           <div className="sidebar-actions">
              <button className="btn-back-outline" onClick={() => navigate(-1)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: 8}}>
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                ย้อนกลับ
              </button>
              <button className="btn-shopping-black" onClick={() => navigate('/')}>
                 กลับไปช้อปปิ้งต่อ
              </button>
           </div>
        </div>

      </div>
    </div>
  );
}