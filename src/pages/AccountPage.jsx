import React, { useState, useRef, useEffect } from 'react';
import '../styles/AccountPage.css'; // เรียกใช้ CSS ที่เรารวมร่างเมื่อกี้
import { mockUser } from '../data/mockData';

const IconEdit = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>);
const IconCalendar = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>);
const ChevronDownIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>);
const CheckIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>);
function CustomSelect({ options, placeholder, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const handleSelect = (optionValue) => { onChange(optionValue); setIsOpen(false); };
  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={`custom-select-container ${isOpen ? 'open' : ''}`} ref={dropdownRef}>
      <div className="custom-select-trigger" onClick={() => setIsOpen(!isOpen)}>
        <span className={selectedOption ? '' : 'select-placeholder'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <div className="select-arrow">
          <ChevronDownIcon />
        </div>
      </div>
      <div className="custom-select-options">
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <div key={option.value} className={`custom-option ${isSelected ? 'selected' : ''}`} onClick={() => handleSelect(option.value)}>
              <span>{option.label}</span>
              <span className="option-check-icon"><CheckIcon /></span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- 🚀 3. หน้าจอหลัก (AccountPage) ---
const AccountPage = () => {
  const [userInfo, setUserInfo] = useState(mockUser);
  const [isEditing, setIsEditing] = useState(false);

  const genderOptions = [
    { value: 'female', label: 'เพศหญิง' },
    { value: 'male', label: 'เพศชาย' }
  ];

  const skinTypeOptions = [
    { value: 'oily', label: 'ผิวมัน' },
    { value: 'dry', label: 'ผิวแห้ง' },
    { value: 'combination', label: 'ผิวผสม' },
    { value: 'sensitive', label: 'ผิวแพ้ง่าย' }
  ];

  const handleInputChange = (field, value) => {
    setUserInfo(prev => ({ ...prev, [field]: value }));
  };

  const getLabel = (options, value) => {
    const found = options.find(opt => opt.value === value);
    return found ? found.label : value;
  };

  return (
    <div className="account-page-wrapper">
      <div className="account-header">
        <h1 className="account-title">บัญชีของฉัน</h1>
        {!isEditing && (
          <button className="btn-edit-outline" onClick={() => setIsEditing(true)}>
            <IconEdit />
            แก้ไขข้อมูล
          </button>
        )}
      </div>

      <div className="account-form">
        <div className="form-row">
          <label className="form-label">อีเมล</label>
          <div className="input-wrapper">
            <input type="text" value={userInfo.email} disabled={true} className="gray-input" />
          </div>
        </div>

        <div className="form-row">
          <label className="form-label">รหัสผ่านใหม่</label>
          <div className="input-wrapper">
            <input type="password" value={userInfo.password} disabled={!isEditing} onChange={(e) => handleInputChange('password', e.target.value)} className="gray-input" />
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
            <input type="date" value={userInfo.birthdate} onChange={(e) => handleInputChange('birthdate', e.target.value)} disabled={!isEditing} className="gray-input" />
            <div className="icon-overlay"><IconCalendar /></div>
          </div>
        </div>

        {/* --- เลือกเพศ (ถ้าแก้ไขใช้ CustomSelect / ถ้าไม่ใช้ Input) --- */}
        <div className="form-row">
          <label className="form-label">เพศ</label>
          {isEditing ? (
            <CustomSelect
              options={genderOptions}
              value={userInfo.gender}
              onChange={(val) => handleInputChange('gender', val)}
              placeholder="เลือกเพศ"
            />
          ) : (
            <div className="input-wrapper">
               <input type="text" value={getLabel(genderOptions, userInfo.gender)} disabled={true} className="gray-input" />
            </div>
          )}
        </div>

        {/* --- เลือกผิว (ถ้าแก้ไขใช้ CustomSelect / ถ้าไม่ใช้ Input) --- */}
        <div className="form-row">
          <label className="form-label">ประเภทผิว</label>
          {isEditing ? (
            <CustomSelect
              options={skinTypeOptions}
              value={userInfo.skinType}
              onChange={(val) => handleInputChange('skinType', val)}
              placeholder="เลือกประเภทผิว"
            />
          ) : (
            <div className="input-wrapper">
              <input type="text" value={getLabel(skinTypeOptions, userInfo.skinType)} disabled={true} className="gray-input" />
            </div>
          )}
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