import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // ลบ Link ออกได้เลยถ้าไม่ได้ใช้ที่อื่น
import { QRCodeCanvas } from 'qrcode.react'; 
import generatePayload from 'promptpay-qr'; 
import '../styles/CheckoutPage.css'; 
import { apiFetch } from '../utils/api';
import AlertBanner from '../components/AlertBanner'; 
// ❌ ลบ import Breadcrumb ออก

const PROMPTPAY_ID = "0812345678"; 

export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const { selectedItems = [], totalPrice = 0 } = location.state || {};
  const shippingCost = 60;
  const grandTotal = totalPrice + shippingCost;

  // --- Address State ---
  const [savedAddresses, setSavedAddresses] = useState([
    {
      id: 1,
      fullName: 'สมชาย ใจดี',
      phone: '081-111-1111',
      addressLine: '123/45 หมู่บ้านจัดสรร',
      district: 'ลาดพร้าว',
      province: 'กรุงเทพมหานคร',
      zipCode: '10230',
      isDefault: true
    },
    {
      id: 2,
      fullName: 'ยูกิ ซัง',
      phone: '099-999-9999',
      addressLine: '99/99 คอนโดหรู',
      district: 'บางรัก',
      province: 'กรุงเทพมหานคร',
      zipCode: '10500',
      isDefault: false
    }
  ]);
  
  const [selectedAddress, setSelectedAddress] = useState(null); 
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [modalMode, setModalMode] = useState('list'); 
  const [editingId, setEditingId] = useState(null); 
  const [deleteIdConfirm, setDeleteIdConfirm] = useState(null); 
  const [alertMessage, setAlertMessage] = useState(null);
  const [addressForm, setAddressForm] = useState({
    fullName: '', phone: '', addressLine: '', district: '', province: '', zipCode: '', note: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('qr_code');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [modalStep, setModalStep] = useState('select_bank'); 

  // ❌ ลบตัวแปร breadcrumbItems ออก

  // Auto Select
  useEffect(() => {
    if (savedAddresses.length > 0 && !selectedAddress) {
        setSelectedAddress(savedAddresses[0]);
    }
  }, [savedAddresses, selectedAddress]);

  // --- Handlers ---
  const handleSelectAddress = (addr) => {
    setSelectedAddress(addr);
    setShowAddressModal(false); 
  };

  const openAddForm = () => {
      setEditingId(null);
      setAddressForm({ fullName: '', phone: '', addressLine: '', district: '', province: '', zipCode: '', note: '' });
      setModalMode('form');
  };

  const openEditForm = (e, addr) => {
      e.stopPropagation();
      setEditingId(addr.id);
      setAddressForm({
          fullName: addr.fullName,
          phone: addr.phone,
          addressLine: addr.addressLine,
          district: addr.district,
          province: addr.province,
          zipCode: addr.zipCode,
          note: addr.note || ''
      });
      setModalMode('form');
  };

  const onClickDeleteIcon = (e, id) => {
      e.stopPropagation();
      setDeleteIdConfirm(id); 
  };

  const confirmDeleteAddress = () => {
      if (!deleteIdConfirm) return;
      const updatedList = savedAddresses.filter(addr => addr.id !== deleteIdConfirm);
      setSavedAddresses(updatedList);
      if (selectedAddress?.id === deleteIdConfirm) {
          setSelectedAddress(updatedList.length > 0 ? updatedList[0] : null);
      }
      setDeleteIdConfirm(null); 
      setAlertMessage("ลบที่อยู่เรียบร้อยแล้ว"); 
  };

  const handleFormChange = (e) => {
    setAddressForm({...addressForm, [e.target.name]: e.target.value});
  };

  const handleSaveAddress = () => {
    if (!addressForm.fullName || !addressForm.phone || !addressForm.addressLine) {
        alert("กรุณากรอกข้อมูลให้ครบถ้วน");
        return;
    }
    if (editingId) {
        const updatedList = savedAddresses.map(addr => 
            addr.id === editingId ? { ...addressForm, id: editingId, isDefault: addr.isDefault } : addr
        );
        setSavedAddresses(updatedList);
        if (selectedAddress?.id === editingId) {
            setSelectedAddress({ ...addressForm, id: editingId });
        }
        setAlertMessage("แก้ไขที่อยู่เรียบร้อย"); 
    } else {
        const newId = Date.now();
        const newAddrObj = { ...addressForm, id: newId, isDefault: false };
        setSavedAddresses([...savedAddresses, newAddrObj]);
        setSelectedAddress(newAddrObj);
        setAlertMessage("เพิ่มที่อยู่ใหม่สำเร็จ"); 
    }
    setModalMode('list');
    setEditingId(null);
  };

  const handlePlaceOrderClick = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!selectedAddress) {
        alert("กรุณาเลือกที่อยู่จัดส่ง");
        return;
    }
    setShowPaymentModal(true);
    if (paymentMethod === 'qr_code') setModalStep('qr_show');
    else setModalStep('select_bank');
  };

  const handleSimulatePayment = (bankName) => {
    setModalStep('processing');
    const finalMethod = (typeof bankName === 'string' && bankName) ? bankName : paymentMethod;
    setTimeout(() => {
        submitOrder(finalMethod, 'paid');
    }, 3000);
  };

  const submitOrder = async (method, status) => {
    setIsSubmitting(true);
    try {
      const payload = {
        item_ids: selectedItems.map(item => item.id),
        shipping_address: selectedAddress, 
        payment_method: method,
        payment_status: status,
        total_price: grandTotal
      };
      
      const res = await apiFetch('/shop/checkout', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      navigate('/order-confirmation', { 
        state: { 
          selectedItems, totalPrice, grandTotal, shippingCost,
          order_no: data.order_no, order_id: data.order_id, customerInfo: selectedAddress,
          isPaid: true,
          paymentMethod: method
        } 
      });

    } catch (error) {
      alert("Error: " + error.message);
      setShowPaymentModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const qrCodePayload = generatePayload(PROMPTPAY_ID, { amount: grandTotal });

  if (selectedItems.length === 0) return <div style={{padding: 40, textAlign:'center'}}>ไม่มีสินค้าที่เลือก <button onClick={() => navigate('/cart')}>กลับไปตะกร้า</button></div>;

  return (
    <div className="checkout-container">
      {alertMessage && (
        <div style={{position: 'fixed', top: 20, right: 20, zIndex: 9999}}>
            <AlertBanner message={alertMessage} onClose={() => setAlertMessage(null)} />
        </div>
      )}

      {/* ❌ เอาส่วน Breadcrumb ที่ซ้ำออกไปแล้วครับ */}

      <h1 className="checkout-title">ชำระเงิน & ที่อยู่จัดส่ง</h1>
      
      <div className="checkout-layout">
        <div className="checkout-left">
          
          <div className="checkout-section address-display-section">
            <div className="section-header-row">
                <h3 className="section-head-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F1978C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    ที่อยู่ในการจัดส่ง
                </h3>
            </div>
            {selectedAddress ? (
                <div className="selected-address-card">
                    <div className="addr-info">
                        <div className="addr-name">{selectedAddress.fullName} <span className="addr-phone">({selectedAddress.phone})</span></div>
                        <div className="addr-detail">{selectedAddress.addressLine} {selectedAddress.district} {selectedAddress.province} {selectedAddress.zipCode}</div>
                    </div>
                    <button className="btn-change-addr" onClick={() => { setShowAddressModal(true); setModalMode('list'); }}>เปลี่ยน</button>
                </div>
            ) : (
                <div className="no-address-box">
                    <p>คุณยังไม่ได้เลือกที่อยู่จัดส่ง</p>
                    <button className="btn-add-new-addr" onClick={() => { setShowAddressModal(true); openAddForm(); }}>+ เพิ่มที่อยู่ใหม่</button>
                </div>
            )}
          </div>

          <div className="checkout-section">
            <h3 className="section-head">💳 วิธีการชำระเงิน</h3>
            <div className="payment-methods">
                <label className={`payment-option ${paymentMethod === 'qr_code' ? 'active' : ''}`}>
                    <input type="radio" name="payment" value="qr_code" checked={paymentMethod === 'qr_code'} onChange={(e) => setPaymentMethod(e.target.value)} />
                    <div className="pay-content"><span className="pay-icon">📱</span> <span>สแกนจ่าย (PromptPay QR)</span></div>
                </label>
                <label className={`payment-option ${paymentMethod === 'mobile_banking' ? 'active' : ''}`}>
                    <input type="radio" name="payment" value="mobile_banking" checked={paymentMethod === 'mobile_banking'} onChange={(e) => setPaymentMethod(e.target.value)} />
                    <div className="pay-content"><span className="pay-icon">🏦</span> <span>Mobile Banking (K-Plus, SCB, etc.)</span></div>
                </label>
            </div>
          </div>
        </div>

        <div className="checkout-right">
            <div className="summary-card">
                <h3 className="summary-head">สรุปคำสั่งซื้อ</h3>
                <div className="mini-product-list">
                    {selectedItems.map(item => (
                        <div key={item.id} className="mini-item">
                            <span>{item.name} <small>x{item.quantity}</small></span>
                            <span>{(item.price * item.quantity).toLocaleString()} ฿</span>
                        </div>
                    ))}
                </div>
                <div className="summary-divider"></div>
                <div className="summary-row"><span>ค่าจัดส่ง</span><span>{shippingCost} ฿</span></div>
                <div className="summary-row total"><span>ยอดสุทธิ</span><span>{grandTotal.toLocaleString()} ฿</span></div>
                <button className="btn-place-order" onClick={handlePlaceOrderClick} disabled={isSubmitting}>ชำระเงิน</button>
            </div>
        </div>
      </div>

      {showAddressModal && (
        <div className="modal-overlay">
            <div className="address-modal-content">
                <div className="modal-header">
                    <h3>{modalMode === 'list' ? 'ที่อยู่ของฉัน' : (editingId ? 'แก้ไขที่อยู่' : 'เพิ่มที่อยู่ใหม่')}</h3>
                    <button className="close-btn" onClick={() => setShowAddressModal(false)}>&times;</button>
                </div>
                {modalMode === 'list' ? (
                    <div className="address-list-mode">
                        {savedAddresses.map(addr => (
                            <div key={addr.id} className={`address-item-row ${selectedAddress?.id === addr.id ? 'selected' : ''}`} onClick={() => handleSelectAddress(addr)}>
                                <div className="radio-col"><input type="radio" checked={selectedAddress?.id === addr.id} readOnly /></div>
                                <div className="info-col">
                                    <div className="row-top"><span className="name">{addr.fullName}</span><span className="separator">|</span><span className="phone">{addr.phone}</span>{addr.isDefault && <span className="default-tag">Default</span>}</div>
                                    <div className="row-detail">{addr.addressLine} {addr.district} {addr.province} {addr.zipCode}</div>
                                </div>
                                <div className="edit-col">
                                    <button className="btn-icon edit" onClick={(e) => openEditForm(e, addr)} title="แก้ไข"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
                                    <button className="btn-icon delete" onClick={(e) => onClickDeleteIcon(e, addr.id)} title="ลบ"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
                                </div>
                            </div>
                        ))}
                        <button className="btn-add-new-big" onClick={openAddForm}>+ เพิ่มที่อยู่ใหม่</button>
                    </div>
                ) : (
                    <div className="address-form-mode">
                         <div className="form-group-row"><div className="fg"><input type="text" name="fullName" placeholder="ชื่อ-นามสกุล" className="gray-input" value={addressForm.fullName} onChange={handleFormChange}/></div><div className="fg"><input type="text" name="phone" placeholder="เบอร์โทรศัพท์" className="gray-input" value={addressForm.phone} onChange={handleFormChange}/></div></div>
                         <div className="fg full"><input type="text" name="addressLine" placeholder="บ้านเลขที่, ซอย, หมู่บ้าน, ถนน" className="gray-input" value={addressForm.addressLine} onChange={handleFormChange}/></div>
                         <div className="form-group-row"><div className="fg"><input type="text" name="district" placeholder="แขวง/ตำบล" className="gray-input" value={addressForm.district} onChange={handleFormChange}/></div><div className="fg"><input type="text" name="province" placeholder="เขต/จังหวัด" className="gray-input" value={addressForm.province} onChange={handleFormChange}/></div><div className="fg"><input type="text" name="zipCode" placeholder="รหัสไปรษณีย์" className="gray-input" value={addressForm.zipCode} onChange={handleFormChange}/></div></div>
                         <div className="form-actions-row"><button className="btn-cancel" onClick={() => setModalMode('list')}>ยกเลิก</button><button className="btn-save" onClick={handleSaveAddress}>บันทึก</button></div>
                    </div>
                )}
            </div>
        </div>
      )}

      {deleteIdConfirm && (
        <div className="modal-overlay" style={{zIndex: 1100}}>
            <div className="confirm-modal-content">
                <h3>ยืนยันการลบ?</h3>
                <p>คุณต้องการลบที่อยู่นี้ใช่หรือไม่ การกระทำนี้ไม่สามารถเรียกคืนได้</p>
                <div className="confirm-actions">
                    <button className="btn-cancel" onClick={() => setDeleteIdConfirm(null)}>ยกเลิก</button>
                    <button className="btn-delete-confirm" onClick={confirmDeleteAddress}>ลบเลย</button>
                </div>
            </div>
        </div>
      )}

      {showPaymentModal && (
        <div className="modal-overlay">
           <div className="payment-modal">
              {modalStep === 'qr_show' && (
                  <>
                    <h3>สแกน QR เพื่อชำระเงิน</h3>
                    <div className="qr-section">
                        <div className="qr-wrapper">
                            <QRCodeCanvas value={qrCodePayload} size={220} />
                        </div>
                        <p className="qr-ref">ยอดชำระ: <strong>{grandTotal.toLocaleString()}</strong> บาท</p>
                    </div>
                    <div className="qr-actions">
                        <button className="btn-confirm-pay" onClick={handleSimulatePayment}>แจ้งชำระเงิน</button>
                        <button className="btn-back-text" onClick={() => setShowPaymentModal(false)}>ยกเลิก</button>
                    </div>
                  </>
              )}
              
              {modalStep === 'select_bank' && (
                  <>
                     <h3>เลือกธนาคารที่ต้องการชำระ</h3>
                     <p style={{color:'#888', fontSize:'0.9rem', marginBottom:'20px'}}>เลือกแอปธนาคารของคุณเพื่อดำเนินการต่อ</p>
                     
                     <div className="bank-grid">
                        <button className="bank-btn kbank" onClick={() => handleSimulatePayment('K-Plus')}>
                            <div className="app-icon-wrapper">
                                <img src="/assets/kplus.png" alt="K-Plus" />
                            </div>
                            <span>K-Plus</span>
                        </button>

                        <button className="bank-btn scb" onClick={() => handleSimulatePayment('SCB Easy')}>
                            <div className="app-icon-wrapper">
                                <img src="/assets/scb.png" alt="SCB Easy" />
                            </div>
                            <span>SCB Easy</span>
                        </button>

                        <button className="bank-btn ktb" onClick={() => handleSimulatePayment('Krungthai NEXT')}>
                            <div className="app-icon-wrapper">
                                <img src="/assets/ktb.png" alt="Krungthai NEXT" />
                            </div>
                            <span>Krungthai</span>
                        </button>

                        <button className="bank-btn bbl" onClick={() => handleSimulatePayment('Bualuang mBanking')}>
                            <div className="app-icon-wrapper">
                                <img src="/assets/bbl.png" alt="Bangkok Bank" />
                            </div>
                            <span>Bualuang</span>
                        </button>
                     </div>
                     <button className="btn-back-text" onClick={() => setShowPaymentModal(false)}>ยกเลิก</button>
                  </>
              )}

              {modalStep === 'processing' && (
                  <div className="processing-state">
                      <div className="spinner"></div>
                      <p>กำลังดำเนินการชำระเงิน...</p>
                  </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
}