import React, { useState, useEffect } from 'react';
import '../styles/AccountPage.css';
import { apiFetch } from '../utils/api';

const API_URL = import.meta.env.VITE_DIRECTUS_PUBLIC_URL;

// --- Components: Success Modal ---
const SuccessModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{
        background: 'white', padding: '30px', borderRadius: '16px', textAlign: 'center', width: '300px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
      }}>
        <div style={{ 
          width: '60px', height: '60px', background: '#d4edda', borderRadius: '50%', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' 
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#28a745" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>บันทึกสำเร็จ!</h3>
        <p style={{ color: '#666', marginBottom: '20px', fontSize: '0.9rem' }}>ข้อมูลของคุณได้รับการอัปเดตเรียบร้อยแล้ว</p>
        <button 
          onClick={onClose}
          style={{
            background: '#281D1B', color: 'white', border: 'none', padding: '10px 24px', 
            borderRadius: '50px', cursor: 'pointer', fontWeight: '600', width: '100%'
          }}
        >
          ตกลง
        </button>
      </div>
    </div>
  );
};

const AccountPage = () => {
  const [userInfo, setUserInfo] = useState({
    email: '',
    currentPassword: '', // เพิ่ม: รหัสผ่านปัจจุบัน
    password: '',        // รหัสผ่านใหม่
    confirmPassword: '', // ยืนยันรหัสผ่านใหม่
    date_of_birth: '',
    gender: '',
    skin_type: ''
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false); // State ควบคุม Modal

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await apiFetch('/users/me');
      if (!response.ok) throw new Error('Failed to fetch profile');
      
      const json = await response.json();
      const user = json.data;

      setUserInfo({
        email: user.email || '',
        currentPassword: '',
        password: '',
        confirmPassword: '',
        date_of_birth: user.date_of_birth || '', 
        gender: user.gender || 'female',
        skin_type: user.skin_type || 'oily'
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleInputChange = (field, value) => {
    setUserInfo(prev => ({ ...prev, [field]: value }));
  };

  // ฟังก์ชันตรวจสอบรหัสผ่านปัจจุบัน (โดยลอง Login)
  const verifyCurrentPassword = async (email, password) => {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        return response.ok;
    } catch {
        return false;
    }
  };

  const handleSave = async () => {
    // 1. ถ้ามีการกรอกรหัสผ่านใหม่ ต้องตรวจสอบ
    if (userInfo.password) {
        if (userInfo.password !== userInfo.confirmPassword) {
            alert("รหัสผ่านใหม่และการยืนยันไม่ตรงกัน");
            return;
        }
        if (!userInfo.currentPassword) {
            alert("กรุณากรอกรหัสผ่านปัจจุบันเพื่อยืนยันการเปลี่ยนแปลง");
            return;
        }
        
        // 2. ตรวจสอบว่ารหัสผ่านปัจจุบันถูกต้องหรือไม่
        const isPasswordCorrect = await verifyCurrentPassword(userInfo.email, userInfo.currentPassword);
        if (!isPasswordCorrect) {
            alert("รหัสผ่านปัจจุบันไม่ถูกต้อง");
            return;
        }
    }

    try {
      const updateData = {
        date_of_birth: userInfo.date_of_birth,
        gender: userInfo.gender,
        skin_type: userInfo.skin_type,
      };

      if (userInfo.password) {
        updateData.password = userInfo.password;
      }

      const response = await apiFetch('/users/me', {
        method: 'PATCH',
        body: JSON.stringify(updateData)
      });

      if (!response.ok) throw new Error('Update failed');

      // 3. แสดง Modal แทน alert
      setShowSuccess(true); 
      setIsEditing(false);
      
      // 4. เคลียร์ค่ารหัสผ่าน
      setUserInfo(prev => ({ ...prev, password: '', confirmPassword: '', currentPassword: '' }));
      
      // Refresh ข้อมูล (optional: ไม่จำเป็นต้อง fetch ใหม่ก็ได้ถ้า updateData ครบแล้ว)
      // fetchProfile(); 

    } catch (error) {
      console.error("Error updating profile:", error);
      alert("ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
    }
  };

  if (loading) return <div className="account-page-wrapper">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="account-page-wrapper">
      <SuccessModal isOpen={showSuccess} onClose={() => setShowSuccess(false)} />

      <div className="account-header">
        <h1 className="account-title">บัญชีของฉัน</h1>
        {!isEditing && (
          <button className="btn-edit-outline" onClick={() => setIsEditing(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: 6}}>
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            แก้ไขข้อมูล
          </button>
        )}
      </div>

      <div className="account-form">
        {/* Email Readonly */}
        <div className="form-row">
          <label className="form-label">อีเมล</label>
          <div className="input-wrapper">
             <input type="text" value={userInfo.email} disabled={true} className="gray-input readonly-field"/>
          </div>
        </div>

        {/* --- ส่วนเปลี่ยนรหัสผ่าน --- */}
        {isEditing && (
            <div className="form-row">
                <label className="form-label" style={{color: '#333'}}>รหัสผ่านปัจจุบัน <span style={{color:'red'}}>*</span></label>
                <div className="input-wrapper">
                    <input 
                        type="password" 
                        placeholder="กรอกรหัสผ่านปัจจุบันเพื่อยืนยัน"
                        value={userInfo.currentPassword} 
                        onChange={(e) => handleInputChange('currentPassword', e.target.value)} 
                        className="gray-input"
                    />
                    <div style={{fontSize: '0.75rem', color: '#888', marginTop: 4}}>
                        (จำเป็นต้องกรอกหากต้องการเปลี่ยนรหัสผ่าน)
                    </div>
                </div>
            </div>
        )}

        <div className="form-row">
          <label className="form-label">รหัสผ่านใหม่</label>
          <div className="input-wrapper">
             <input 
                type="password" 
                placeholder={isEditing ? "กรอกรหัสผ่านใหม่ (ถ้าต้องการเปลี่ยน)" : "********"}
                value={userInfo.password} 
                disabled={!isEditing} 
                onChange={(e) => handleInputChange('password', e.target.value)} 
                className="gray-input"
             />
          </div>
        </div>

        {isEditing && (
          <div className="form-row">
            {/* แก้ไข Label ตามที่ขอ */}
            <label className="form-label">ยืนยันรหัสผ่านใหม่</label> 
            <div className="input-wrapper">
               <input 
                  type="password" 
                  value={userInfo.confirmPassword} 
                  placeholder="กรอกรหัสผ่านใหม่ซ้ำอีกครั้ง"
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)} 
                  className="gray-input" 
               />
            </div>
          </div>
        )}
        
        {/* --- ข้อมูลส่วนตัว --- */}
        <div style={{borderTop: '1px solid #eee', margin: '20px 0'}}></div>

        <div className="form-row">
          <label className="form-label">วันเกิด</label>
          <div className="input-wrapper">
             <input 
                type="date" 
                value={userInfo.date_of_birth} 
                onChange={(e) => handleInputChange('date_of_birth', e.target.value)} 
                disabled={!isEditing} 
                className="gray-input"
             />
          </div>
        </div>

        <div className="form-row">
          <label className="form-label">เพศ</label>
          <div className="input-wrapper">
             <select value={userInfo.gender} disabled={!isEditing} className="gray-input gray-select" onChange={(e) => handleInputChange('gender', e.target.value)}>
                <option value="female">เพศหญิง</option>
                <option value="male">เพศชาย</option>
             </select>
          </div>
        </div>

        <div className="form-row">
          <label className="form-label">ประเภทผิว</label>
          <div className="input-wrapper">
             <select value={userInfo.skin_type} disabled={!isEditing} className="gray-input gray-select" onChange={(e) => handleInputChange('skin_type', e.target.value)}>
                <option value="oily">ผิวมัน</option>
                <option value="dry">ผิวแห้ง</option>
                <option value="combination">ผิวผสม</option>
                <option value="sensitive">ผิวแพ้ง่าย</option>
             </select>
          </div>
        </div>

        {isEditing && (
          <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
             <button className="btn-save-black" onClick={handleSave}>บันทึกการเปลี่ยนแปลง</button>
             <button className="btn-save-black" style={{background: '#999'}} onClick={() => {setIsEditing(false); fetchProfile();}}>ยกเลิก</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountPage;