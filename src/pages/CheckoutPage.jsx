import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react'; 
import generatePayload from 'promptpay-qr'; 
import '../styles/CheckoutPage.css'; 
import { apiFetch } from '../utils/api';
import AlertBanner from '../components/AlertBanner'; 
import { CreateInput } from 'thai-address-autocomplete-react';

const InputThaiAddress = CreateInput();
const PROMPTPAY_ID = "0812345678"; 

export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const { selectedItems = [], totalPrice = 0 } = location.state || {};
  const shippingCost = 60;
  const grandTotal = totalPrice + shippingCost;

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null); 
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [modalMode, setModalMode] = useState('list'); 
  const [editingId, setEditingId] = useState(null); 
  const [deleteIdConfirm, setDeleteIdConfirm] = useState(null); 
  const [alertMessage, setAlertMessage] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  
  const [createdOrder, setCreatedOrder] = useState(null); 

  const [addressForm, setAddressForm] = useState({
    fullName: '', phone: '', addressLine: '', subDistrict: '', district: '', province: '', zipCode: '', note: ''
  });
  
  const [paymentMethod, setPaymentMethod] = useState('qr_code');
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [modalStep, setModalStep] = useState('select_bank'); 

  // --- Initial Data Fetching ---
  useEffect(() => {
    const fetchUser = async () => {
        try {
            const res = await apiFetch('/users/me');
            if (res.ok) {
                const json = await res.json();
                setCurrentUserId(json.data.id);
            }
        } catch (error) { console.error(error); }
    };
    fetchUser();
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const res = await apiFetch('/items/user_address?filter[user][_eq]=$CURRENT_USER&sort=-last_used');
      if (res.ok) {
        const json = await res.json();
        const mappedAddresses = json.data.map(addr => ({
            id: addr.id,
            fullName: addr.name,
            phone: addr.mobile_no,
            addressLine: addr.address,
            subDistrict: addr.sub_district,
            district: addr.district,
            province: addr.province,
            zipCode: addr.zipcode,
            isDefault: addr.is_default,
            note: ''
        }));
        setSavedAddresses(mappedAddresses);
        if (!selectedAddress && mappedAddresses.length > 0) {
            setSelectedAddress(mappedAddresses[0]);
        }
    }
    } catch (error) { console.error("Failed to fetch addresses:", error); }
  };

  useEffect(() => {
    if (!selectedItems || selectedItems.length === 0) navigate('/cart');
  }, [selectedItems, navigate]);

  // --- Handlers (Address) ---
  const handleSelectAddress = (addr) => {
    setSelectedAddress(addr);
    setShowAddressModal(false); 
    apiFetch(`/items/user_address/${addr.id}`, { method: 'PATCH', body: JSON.stringify({ last_used: new Date().toISOString() }) });
  };
  const openAddForm = () => { setEditingId(null); setAddressForm({ fullName: '', phone: '', addressLine: '', subDistrict: '', district: '', province: '', zipCode: '', note: '' }); setModalMode('form'); };
  const openEditForm = (e, addr) => { e.stopPropagation(); setEditingId(addr.id); setAddressForm({ fullName: addr.fullName, phone: addr.phone, addressLine: addr.addressLine, subDistrict: addr.subDistrict || '', district: addr.district, province: addr.province, zipCode: addr.zipCode, note: addr.note || '' }); setModalMode('form'); };
  const onClickDeleteIcon = (e, id) => { e.stopPropagation(); setDeleteIdConfirm(id); };
  
  const confirmDeleteAddress = async () => {
      if (!deleteIdConfirm) return;
      try {
        await apiFetch(`/items/user_address/${deleteIdConfirm}`, { method: 'DELETE' });
        const updatedList = savedAddresses.filter(addr => addr.id !== deleteIdConfirm);
        setSavedAddresses(updatedList);
        if (selectedAddress?.id === deleteIdConfirm) setSelectedAddress(updatedList.length > 0 ? updatedList[0] : null);
        setAlertMessage("ลบที่อยู่เรียบร้อยแล้ว"); 
      } catch (error) { alert("ลบไม่สำเร็จ: " + error.message); } finally { setDeleteIdConfirm(null); }
  };

  const handleFormChange = (e) => { setAddressForm({...addressForm, [e.target.name]: e.target.value}); };
  const handleAddressChange = (scope) => (value) => {
    const keyMap = { district: 'subDistrict', amphoe: 'district', province: 'province', zipcode: 'zipCode' };
    setAddressForm(prev => ({ ...prev, [keyMap[scope]]: value }));
  };
  const handleAddressSelect = (addressObj) => {
      setAddressForm(prev => ({ ...prev, subDistrict: addressObj.district, district: addressObj.amphoe, province: addressObj.province, zipCode: addressObj.zipcode }));
  };

  const handleSaveAddress = async () => {
    if (!addressForm.fullName || !addressForm.phone || !addressForm.addressLine || !addressForm.subDistrict) { alert("กรุณากรอกข้อมูลให้ครบถ้วน"); return; }
    if (!currentUserId) { alert("กรุณาล็อกอินใหม่"); return; }
    const payload = { name: addressForm.fullName, mobile_no: addressForm.phone, address: addressForm.addressLine, sub_district: addressForm.subDistrict, district: addressForm.district, province: addressForm.province, zipcode: addressForm.zipCode, user: currentUserId, last_used: new Date().toISOString() };
    try {
        if (editingId) { await apiFetch(`/items/user_address/${editingId}`, { method: 'PATCH', body: JSON.stringify(payload) }); setAlertMessage("แก้ไขที่อยู่เรียบร้อย"); } 
        else { await apiFetch('/items/user_address', { method: 'POST', body: JSON.stringify(payload) }); setAlertMessage("เพิ่มที่อยู่ใหม่สำเร็จ"); }
        await fetchAddresses(); setModalMode('list'); setEditingId(null);
    } catch (error) { alert("บันทึกไม่สำเร็จ: " + error.message); }
  };

  //STEP 1: กด "ชำระเงิน" -> ยิง /checkout เพื่อสร้าง Order
  const handleCreateOrderClick = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!selectedAddress) { alert("กรุณาเลือกที่อยู่จัดส่ง"); return; }
    if (!currentUserId) { alert("User ID Error: กรุณาล็อกอินใหม่"); return; }

    setIsSubmitting(true);
    try {
        const orderPayload = {
            customer_name: selectedAddress.fullName,
            phone: selectedAddress.phone,
            address: selectedAddress.addressLine,
            sub_district: selectedAddress.subDistrict,
            district: selectedAddress.district,
            province: selectedAddress.province,
            zipcode: selectedAddress.zipCode,
            total_price: grandTotal,
            item_ids: selectedItems.map(item => item.id) 
        };

        const res = await apiFetch('/shop/checkout', {
            method: 'POST',
            body: JSON.stringify(orderPayload)
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Create order failed");
        }

        const data = await res.json();
        
        setCreatedOrder({
            id: data.order_id,
            no: data.order_no,
            total: data.total_price
        });

        setShowPaymentModal(true);
        if (paymentMethod === 'qr_code') setModalStep('qr_show');
        else setModalStep('select_bank');

    } catch (error) {
        console.error(error);
        setAlertMessage("ไม่สามารถสร้างคำสั่งซื้อได้: " + error.message);
    } finally {
        setIsSubmitting(false);
    }
  };

  // STEP 2: กด "แจ้งชำระเงิน" -> ยิง /payment-webhook
  const handleConfirmPayment = async (bankName) => {
    if (!createdOrder) return;

    setModalStep('processing');

    const finalMethod = (typeof bankName === 'string' && bankName) ? bankName : (paymentMethod === 'qr_code' ? 'QR PromptPay' : 'Mobile Banking');

    setTimeout(async () => {
        try {
            const res = await apiFetch('/shop/payment-webhook', {
                method: 'POST',
                body: JSON.stringify({
                    order_id: createdOrder.id,
                    payment_status: 'success'
                })
            });

            if (!res.ok) throw new Error("Payment verification failed");

            navigate('/order-confirmation', { 
                state: { 
                  order_id: createdOrder.id,
                  order_no: createdOrder.no,
                  selectedItems, 
                  totalPrice, 
                  grandTotal, 
                  shippingCost,
                  customerInfo: selectedAddress, 
                  paymentMethod: finalMethod, 
                  isPaid: true
                } 
            });

        } catch (error) {
            console.error("Payment Error:", error);
            setAlertMessage("การชำระเงินผิดพลาด: " + error.message);
            setModalStep(paymentMethod === 'qr_code' ? 'qr_show' : 'select_bank');
        }
    }, 2000);
  };

  const qrCodePayload = generatePayload(PROMPTPAY_ID, { amount: grandTotal });
  if (selectedItems.length === 0) return null;

  return (
    <div className="checkout-container">
      {alertMessage && (
        <div style={{position: 'fixed', top: 20, right: 20, zIndex: 9999}}>
            <AlertBanner message={alertMessage} onClose={() => setAlertMessage(null)} />
        </div>
      )}

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
                        <div className="addr-detail">
                             {selectedAddress.addressLine} {selectedAddress.subDistrict} {selectedAddress.district} {selectedAddress.province} {selectedAddress.zipCode}
                        </div>
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
                
                <button 
                    className="btn-place-order" 
                    onClick={handleCreateOrderClick} 
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'กำลังสร้างรายการ...' : 'ชำระเงิน'}
                </button>
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
                                    <div className="row-detail">{addr.addressLine} {addr.subDistrict} {addr.district} {addr.province} {addr.zipCode}</div>
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
                        <div className="form-group-row">
                            <div className="fg"><label style={{fontSize:12, color:'#666', marginBottom:4, display:'block'}}>ชื่อ-นามสกุล</label><input type="text" name="fullName" placeholder="ระบุชื่อ-นามสกุล" className="gray-input" value={addressForm.fullName} onChange={handleFormChange}/></div>
                            <div className="fg"><label style={{fontSize:12, color:'#666', marginBottom:4, display:'block'}}>เบอร์โทรศัพท์</label><input type="text" name="phone" placeholder="ระบุเบอร์โทรศัพท์" className="gray-input" value={addressForm.phone} onChange={handleFormChange}/></div>
                        </div>
                        <div className="fg full"><label style={{fontSize:12, color:'#666', marginBottom:4, display:'block'}}>ที่อยู่</label><input type="text" name="addressLine" placeholder="บ้านเลขที่, ซอย, หมู่บ้าน, ถนน" className="gray-input" value={addressForm.addressLine} onChange={handleFormChange}/></div>
                         <div className="form-group-row">
                             <div className="fg"><label style={{fontSize:12, color:'#666', marginBottom:4, display:'block'}}>ตำบล / แขวง</label><InputThaiAddress.District value={addressForm.subDistrict} onChange={handleAddressChange('district')} onSelect={handleAddressSelect} className="thai-address-input" placeholder="ระบุตำบล / แขวง"/></div>
                             <div className="fg"><label style={{fontSize:12, color:'#666', marginBottom:4, display:'block'}}>อำเภอ / เขต</label><InputThaiAddress.Amphoe value={addressForm.district} onChange={handleAddressChange('amphoe')} onSelect={handleAddressSelect} className="thai-address-input" placeholder="ระบุอำเภอ / เขต"/></div>
                         </div>
                         <div className="form-group-row">
                             <div className="fg"><label style={{fontSize:12, color:'#666', marginBottom:4, display:'block'}}>จังหวัด</label><InputThaiAddress.Province value={addressForm.province} onChange={handleAddressChange('province')} onSelect={handleAddressSelect} className="thai-address-input" placeholder="ระบุจังหวัด"/></div>
                             <div className="fg"><label style={{fontSize:12, color:'#666', marginBottom:4, display:'block'}}>รหัสไปรษณีย์</label><InputThaiAddress.Zipcode value={addressForm.zipCode} onChange={handleAddressChange('zipcode')} onSelect={handleAddressSelect} className="thai-address-input" placeholder="ระบุรหัสไปรษณีย์"/></div>
                         </div>
                         <div className="form-actions-row"><button className="btn-cancel" onClick={() => setModalMode('list')}>ยกเลิก</button><button className="btn-save" onClick={handleSaveAddress}>บันทึก</button></div>
                    </div>
                )}
            </div>
        </div>
      )}
      
      {deleteIdConfirm && (
        <div className="delete-modal-overlay">
            <div className="delete-modal-box">
                <div style={{marginBottom:15}}>
                    <div style={{width:50, height:50, borderRadius:'50%', background:'#ffebee', color:'#d32f2f', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto'}}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </div>
                </div>
                <h3>ยืนยันการลบ?</h3>
                <p>คุณต้องการลบที่อยู่นี้ใช่หรือไม่?<br/>การกระทำนี้ไม่สามารถเรียกคืนได้</p>
                <div className="delete-actions">
                    <button className="btn-cancel-delete" onClick={() => setDeleteIdConfirm(null)}>ยกเลิก</button>
                    <button className="btn-confirm-delete" onClick={confirmDeleteAddress}>ลบเลย</button>
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
                        <div className="qr-wrapper"><QRCodeCanvas value={qrCodePayload} size={220} /></div>
                        <p className="qr-ref">ยอดชำระ: <strong>{grandTotal.toLocaleString()}</strong> บาท</p>
                        <p style={{fontSize:12, color:'#888', marginTop:5}}>Order No: {createdOrder?.no}</p>
                    </div>
                    <div className="qr-actions">
                        <button className="btn-confirm-pay" onClick={() => handleConfirmPayment('QR PromptPay')}>แจ้งชำระเงิน</button>
                        <button className="btn-back-text" onClick={() => setShowPaymentModal(false)}>ปิดหน้าต่าง</button>
                    </div>
                  </>
              )}
              {modalStep === 'select_bank' && (
                  <>
                     <h3>เลือกธนาคารที่ต้องการชำระ</h3>
                     <p style={{color:'#888', fontSize:'0.9rem', marginBottom:'20px'}}>Order No: {createdOrder?.no}</p>
                     <div className="bank-grid">
                        <button className="bank-btn kbank" onClick={() => handleConfirmPayment('K-Plus')}>
                            <div className="app-icon-wrapper"><img src="/assets/kplus.png" alt="K-Plus" /></div><span>K-Plus</span>
                        </button>
                        <button className="bank-btn scb" onClick={() => handleConfirmPayment('SCB Easy')}>
                            <div className="app-icon-wrapper"><img src="/assets/scb.png" alt="SCB Easy" /></div><span>SCB Easy</span>
                        </button>
                        <button className="bank-btn ktb" onClick={() => handleConfirmPayment('Krungthai NEXT')}>
                            <div className="app-icon-wrapper"><img src="/assets/ktb.png" alt="Krungthai NEXT" /></div><span>Krungthai</span>
                        </button>
                        <button className="bank-btn bbl" onClick={() => handleConfirmPayment('Bualuang mBanking')}>
                            <div className="app-icon-wrapper"><img src="/assets/bbl.png" alt="Bangkok Bank" /></div><span>Bualuang</span>
                        </button>
                     </div>
                     <button className="btn-back-text" onClick={() => setShowPaymentModal(false)}>ปิดหน้าต่าง</button>
                  </>
              )}
              {modalStep === 'processing' && (
                  <div className="processing-state"><div className="spinner"></div><p>กำลังตรวจสอบการชำระเงิน...</p></div>
              )}
           </div>
        </div>
      )}
    </div>
  );
}