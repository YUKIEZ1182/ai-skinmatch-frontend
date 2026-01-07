import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/OrderConfirmation.css';
import { apiFetch } from '../utils/api';

export default function OrderConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();

  const { 
    selectedItems = [], 
    totalPrice = 0, 
    order_no, 
    order_id 
  } = location.state || {};

  const shippingCost = 60; 
  const grandTotal = totalPrice + shippingCost;
  const orderDate = new Date().toLocaleDateString('th-TH', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric'
  });

  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    if (isProcessing) return;

    if (!order_id) {
      alert("ไม่พบข้อมูลคำสั่งซื้อ กรุณาลองใหม่อีกครั้ง");
      return;
    }

    try {
      setIsProcessing(true);

      const response = await apiFetch('/shop/payment-webhook', {
        method: 'POST',
        body: JSON.stringify({
          order_id: order_id,
          payment_status: 'success'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "การยืนยันชำระเงินล้มเหลว");
      }

      alert(`ชำระเงินสำเร็จ! ขอบคุณสำหรับการสั่งซื้อ หมายเลขคำสั่งซื้อของคุณคือ: ${order_no}`);
      navigate('/');
      
    } catch (error) {
      console.error("Payment Error:", error);
      alert("เกิดข้อผิดพลาด: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="order-page-wrapper">
      <div className="status-header">
        <div className="status-icon-circle pending-theme">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </div>
        <h2 className="status-title pending-text">รอดำเนินการชำระเงิน</h2>
        <p className="status-subtitle">โปรดยืนยันการชำระเงินตามรายละเอียดด้านล่าง</p>
      </div>
      <div className="order-layout">
        <div className="order-details-section">
          <div className="section-card">
            <h3 className="section-header">รายละเอียดสินค้า</h3>
            <div className="order-items-list">
              {selectedItems.map((item) => (
                <div key={item.id} className="order-item-row">
                  <div className="item-img-wrapper">
                    <img 
                      src={item.image || 'https://via.placeholder.com/150'} 
                      alt={item.name} 
                      onError={(e) => e.target.src='https://via.placeholder.com/150'}
                    />
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
        <div className="order-summary-sidebar">
           <div className="sidebar-card">
             <h3 className="sidebar-header">สรุปคำสั่งซื้อ</h3>
             <div className="sidebar-row">
               <span className="label">หมายเลขคำสั่งซื้อ</span>
               <span className="value">{order_no || 'สร้างข้อมูลไม่สำเร็จ'}</span>
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
             
             <button 
                className={`btn-pay-now ${isProcessing ? 'disabled' : ''}`} 
                onClick={handlePayment}
                disabled={isProcessing}
             >
               {isProcessing ? 'กำลังประมวลผล...' : 'ชำระเงิน'}
             </button>

           </div>
           <div className="sidebar-actions">
              <button className="btn-back-outline" onClick={() => navigate(-1)} disabled={isProcessing}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: 8}}>
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                ย้อนกลับ
              </button>
              <button className="btn-shopping-black" onClick={() => navigate('/')} disabled={isProcessing}>
                 กลับไปช้อปปิ้งต่อ
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}