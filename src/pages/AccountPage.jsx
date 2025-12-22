import React, { useState } from 'react';
import '../styles/AccountPage.css';

const AccountPage = () => {
  const [userInfo, setUserInfo] = useState({
    email: 'guess@gmail.com',
    password: 'password123',
    confirmPassword: 'password123',
    birthdate: '2003-09-01',
    gender: 'female',
    skinType: 'oily'
  });
  const [isEditing, setIsEditing] = useState(false);
  const handleInputChange = (field, value) => {setUserInfo(prev => ({ ...prev, [field]: value }));};
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
             <input type="text" value={userInfo.email} disabled={true} className="gray-input"/>
          </div>
        </div>
        <div className="form-row">
          <label className="form-label">รหัสผ่าน</label>
          <div className="input-wrapper">
             <input type="password" value={userInfo.password} disabled={!isEditing} onChange={(e) => handleInputChange('password', e.target.value)} className="gray-input"/>
          </div>
        </div>
        {isEditing && (
          <div className="form-row">
            <label className="form-label">ยืนยันรหัสผ่าน</label>
            <div className="input-wrapper">
               <input type="password" value={userInfo.confirmPassword} onChange={(e) => handleInputChange('confirmPassword', e.target.value)} className="gray-input" />
            </div>
          </div>
        )}
        <div className="form-row">
          <label className="form-label">วันเกิด</label>
          <div className="input-wrapper">
             <input type="date" value={userInfo.birthdate} onChange={(e) => handleInputChange('birthdate', e.target.value)} disabled={!isEditing} className="gray-input"/>
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
             <select value={userInfo.skinType} disabled={!isEditing} className="gray-input gray-select" onChange={(e) => handleInputChange('skinType', e.target.value)}>
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
          <div className="form-actions">
             <button className="btn-save-black" onClick={() => setIsEditing(false)}>บันทึกการเปลี่ยนแปลง</button>
          </div>
        )}
      </div>
    </div>
  );
};
export default AccountPage;