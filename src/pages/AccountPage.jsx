import React, { useState, useEffect } from 'react';
import '../styles/AccountPage.css';
import { apiFetch } from '../utils/api';

const AccountPage = () => {
  const [userInfo, setUserInfo] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    date_of_birth: '',
    gender: '',
    skin_type: ''
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // ฟังก์ชันดึงข้อมูลโปรไฟล์
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await apiFetch('/users/me');
      if (!response.ok) throw new Error('Failed to fetch profile');
      
      const json = await response.json();
      const user = json.data;

      // อัปเดตข้อมูลผู้ใช้เข้าสู่ State
      // เนื่องจาก date_of_birth เป็นประเภท Date (YYYY-MM-DD) อยู่แล้ว จึงดึงมาใช้ได้ตรงๆ
      setUserInfo({
        email: user.email || '',
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

  const handleSave = async () => {
    if (userInfo.password && userInfo.password !== userInfo.confirmPassword) {
      alert("รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน");
      return;
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

      alert("บันทึกการเปลี่ยนแปลงเรียบร้อยแล้ว");
      setIsEditing(false);
      // เคลียร์ค่ารหัสผ่านใน State หลังบันทึก
      setUserInfo(prev => ({ ...prev, password: '', confirmPassword: '' }));
      fetchProfile();
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
    }
  };

  if (loading) return <div className="account-page-wrapper">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="account-page-wrapper">
      <div className="account-header">
        <h1 className="account-title">บัญชีของฉัน</h1>
        {!isEditing && (
          <button className="btn-edit-outline" onClick={() => setIsEditing(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            แก้ไขข้อมูล
          </button>
        )}
      </div>
      <div className="account-form">
        <div className="form-row">
          <label className="form-label">อีเมล</label>
          <div className="input-wrapper">
             <input type="text" value={userInfo.email} disabled={true} className="gray-input readonly-field"/>
          </div>
        </div>
        <div className="form-row">
          <label className="form-label">รหัสผ่านใหม่</label>
          <div className="input-wrapper">
             <input 
                type="password" 
                placeholder={isEditing ? "กรอกรหัสผ่านใหม่หากต้องการเปลี่ยน" : "********"}
                value={userInfo.password} 
                disabled={!isEditing} 
                onChange={(e) => handleInputChange('password', e.target.value)} 
                className="gray-input"
             />
          </div>
        </div>
        {isEditing && (
          <div className="form-row">
            <label className="form-label">ยืนยันรหัสผ่าน</label>
            <div className="input-wrapper">
               <input 
                  type="password" 
                  value={userInfo.confirmPassword} 
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)} 
                  className="gray-input" 
               />
            </div>
          </div>
        )}
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
             <div className="icon-overlay">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
             </div>
          </div>
        </div>
        <div className="form-row">
          <label className="form-label">เพศ</label>
          <div className="input-wrapper">
             <select value={userInfo.gender} disabled={!isEditing} className="gray-input gray-select" onChange={(e) => handleInputChange('gender', e.target.value)}>
                <option value="female">เพศหญิง</option>
                <option value="male">เพศชาย</option>
             </select>
             <div className="icon-overlay">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                   <path d="M6 9l6 6 6-6"/>
                </svg>
             </div>
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
             <div className="icon-overlay">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                   <path d="M6 9l6 6 6-6"/>
                </svg>
             </div>
          </div>
        </div>
        {isEditing && (
          <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
             <button className="btn-save-black" onClick={handleSave}>บันทึกการเปลี่ยนแปลง</button>
             <button className="btn-save-black" onClick={() => {setIsEditing(false); fetchProfile();}}>ยกเลิก</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountPage;