import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/OrderConfirmation.css';
// import AlertBanner from '../components/AlertBanner'; // ❌ ไม่ใช้ Banner แล้ว (ถ้าจะใช้ Modal)

export default function OrderConfirmationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // 🔥 เปลี่ยนจาก alertMessage เป็น showModal
  const [showModal, setShowModal] = useState(false);

  // ... (ส่วนรับข้อมูลและฟังก์ชันวันที่ เหมือนเดิม) ...
  const { 
    order_no, 
    customerInfo, 
    selectedItems = [], 
    totalPrice, 
    shippingCost, 
    grandTotal, 
    paymentMethod = 'qr_code' 
  } = location.state || {};

  const getDeliveryDate = () => {
      const date = new Date();
      date.setDate(date.getDate() + 2);
      return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  useEffect(() => {
      if (!location.state) {
          navigate('/');
      }
  }, [location.state, navigate]);

  if (!location.state) return null;

  return (
    <div className="order-page-wrapper">
      
      {/* ... (ส่วน Header และ Layout เหมือนเดิม) ... */}
      <div className="status-header">
          {/* ... (Code Header เดิม) ... */}
          <div className="status-icon-circle success-theme">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <h1 className="status-title success-text">ชำระเงินเรียบร้อยแล้ว!</h1>
          <p className="status-subtitle">ขอบคุณที่สั่งซื้อสินค้ากับเรา หมายเลขคำสั่งซื้อของคุณคือ</p>
          <p style={{fontSize:'1.2rem', fontWeight:'bold', color:'#281D1B', marginTop:'5px'}}>{order_no || 'AI-SK-XXXXXX'}</p>
      </div>

      <div className="order-layout">
          <div className="order-details-section">
              {/* ... (Code ส่วนแสดงสินค้า เหมือนเดิม) ... */}
              <div className="section-card">
                  {/* ... เนื้อหาข้างในเหมือนเดิม ... */}
                  <div className="section-header">สรุปรายการที่สั่งซื้อ ({selectedItems.length})</div>
                  {selectedItems.map((item, index) => (
                      <div key={index} className="order-item-row">
                          <div className="item-img-wrapper"><img src={item.image || "https://placehold.co/100"} alt={item.name} /></div>
                          <div className="item-info">
                              <div className="item-brand">{item.brand || 'SKINMATCH'}</div>
                              <div className="item-name">{item.name}</div>
                              <div className="item-qty">จำนวน: {item.quantity} ชิ้น</div>
                          </div>
                          <div className="item-price">{(item.price * item.quantity).toLocaleString()} ฿</div>
                      </div>
                  ))}
                  <div className="order-cost-summary">
                      <div className="cost-row"><span>ยอดรวมสินค้า</span><span>{totalPrice?.toLocaleString()} ฿</span></div>
                      <div className="cost-row"><span>ค่าจัดส่ง</span><span>{shippingCost?.toLocaleString()} ฿</span></div>
                      <div className="cost-divider"></div>
                      <div className="cost-row total"><span>ยอดสุทธิ</span><span>{grandTotal?.toLocaleString()} ฿</span></div>
                  </div>
              </div>
          </div>

          <div className="order-summary-sidebar">
              <div className="sidebar-card">
                  {/* ... (Code ส่วน Sidebar เหมือนเดิม) ... */}
                  <div className="sidebar-header">ข้อมูลการจัดส่ง</div>
                  <div className="sidebar-row"><span className="label">วันที่สั่งซื้อ</span><span className="value">{new Date().toLocaleDateString('th-TH')}</span></div>
                  <div className="sidebar-row"><span className="label">คาดว่าจะได้รับ</span><span className="value">{getDeliveryDate()}</span></div>
                  <div className="sidebar-row"><span className="label">สถานะการชำระ</span><span className="status-tag success">ชำระเงินแล้ว</span></div>
                  <div className="sidebar-row"><span className="label">ช่องทางชำระ</span><span className="value">{paymentMethod === 'qr_code' ? 'สแกน QR Code' : 'Mobile Banking'}</span></div>
                  <div className="cost-divider"></div>
                  <div className="sidebar-header" style={{fontSize: '16px', marginBottom: '10px'}}>ที่อยู่จัดส่ง</div>
                  <div style={{fontSize: '14px', color: '#4B5563', lineHeight: '1.6'}}>
                      <div style={{fontWeight: '600', color:'#111', marginBottom:'4px'}}>{customerInfo?.fullName}<span style={{fontWeight:'400', color:'#6B7280', marginLeft:'8px'}}>{customerInfo?.phone}</span></div>
                      {customerInfo?.addressLine} {customerInfo?.district} {customerInfo?.province} {customerInfo?.zipCode}
                  </div>

                  <div className="sidebar-actions">
                      <button className="btn-shopping-black" onClick={() => navigate('/')}>กลับไปหน้าหลัก</button>
                      
                      {/* 🔥 กดปุ่มนี้แล้วเปิด Modal แทน */}
                      <button className="btn-back-outline" onClick={() => setShowModal(true)}>
                          ดูประวัติการสั่งซื้อ
                      </button>
                  </div>
              </div>
          </div>
      </div>

      {/* 🔥🔥🔥 MODAL POPUP (ใส่เพิ่มตรงนี้) 🔥🔥🔥 */}
      {showModal && (
        <div className="modal-overlay">
            <div className="info-modal-content">
                <div className="info-icon">🚧</div>
                <h3>กำลังพัฒนาจ้า!</h3>
                <p>ระบบประวัติการสั่งซื้อกำลังอยู่ในช่วงพัฒนา <br/>อดใจรออีกนิดนะครับ 🚀</p>
                <button className="btn-close-modal" onClick={() => setShowModal(false)}>
                    ตกลง
                </button>
            </div>
        </div>
      )}

    </div>
  );
}