import React, { useState, useEffect, forwardRef } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import th from 'date-fns/locale/th';
import "react-datepicker/dist/react-datepicker.css";
import '../styles/AccountPage.css';
import '../styles/CustomDatePicker.css';
import { apiFetch } from '../utils/api';
import CustomSelect from '../components/CustomSelect';

registerLocale('th', th);

const API_URL = import.meta.env.VITE_DIRECTUS_PUBLIC_URL;

// --- Options ---
const GENDER_OPTIONS = [
    { value: 'female', label: 'เพศหญิง' },
    { value: 'male', label: 'เพศชาย' },
    { value: 'other', label: 'ไม่ระบุ' }
];

const SKIN_TYPE_OPTIONS = [
    { value: 'oily', label: 'ผิวมัน' },
    { value: 'dry', label: 'ผิวแห้ง' },
    { value: 'combination', label: 'ผิวผสม' },
    { value: 'sensitive', label: 'ผิวแพ้ง่าย' }
];

// --- Helpers ---
const formatThaiDisplay = (date) => {
  if (!date) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear() + 543;
  return `${day}/${month}/${year}`;
};

const parseISOLocal = (s) => {
  if (!s) return null;
  const [y, m, d] = s.split(/\D/);
  return new Date(y, m - 1, d);
};

const formatISOLocal = (date) => {
  if (!date) return null;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// --- Custom Components ---

// 1. Date Input
const CustomDateInput = forwardRef(({ value, onClick, placeholder, disabled }, ref) => (
  <div className="date-input-wrapper" onClick={!disabled ? onClick : undefined}>
    <input
      className="auth-input-date"
      value={value}
      onClick={!disabled ? onClick : undefined}
      readOnly
      placeholder={placeholder}
      ref={ref}
      disabled={disabled}
      style={{ 
        background: disabled ? '#f5f5f5' : '#fff', 
        cursor: disabled ? 'default' : 'pointer',
        color: disabled ? '#999' : '#333'
      }}
    />
    {!disabled && (
        <div className="calendar-icon-overlay">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
        </div>
    )}
  </div>
));

// 2. 🔥 Password Input (แก้ไข Layout ไม่ให้ตาเบี้ยว)
const PasswordInput = ({ value, onChange, placeholder, disabled, error, onBlur }) => {
    const [showPassword, setShowPassword] = useState(false);
    return (
        <div style={{ width: '100%' }}>
            {/* Wrapper ชั้นใน: สำหรับ Input + Icon เท่านั้น (เพื่อให้ top: 50% อิงแค่ความสูง Input) */}
            <div style={{ position: 'relative' }}>
                <input 
                    type={showPassword ? "text" : "password"} 
                    value={value} 
                    onChange={onChange}
                    onBlur={onBlur}
                    placeholder={placeholder}
                    disabled={disabled} 
                    className={`gray-input ${error ? 'input-error' : ''}`}
                    style={{ paddingRight: '40px' }}
                />
                
                {!disabled && (
                    <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        // ใช้ Inline Style บังคับตำแหน่งให้ชัวร์
                        style={{
                            position: 'absolute',
                            right: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#666',
                            zIndex: 10
                        }}
                    >
                        {showPassword ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                        )}
                    </button>
                )}
            </div>

            {/* Error Message อยู่นอก Wrapper ชั้นใน (ดันลงล่าง ไม่กวนตำแหน่งลูกตา) */}
            {error && <span className="helper-text-error">{error}</span>}
        </div>
    );
};

// --- Success Modal ---
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
        <div style={{ width: '60px', height: '60px', background: '#d4edda', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#28a745" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>บันทึกสำเร็จ!</h3>
        <p style={{ color: '#666', marginBottom: '20px', fontSize: '0.9rem' }}>อัปเดตข้อมูลเรียบร้อยแล้ว</p>
        <button onClick={onClose} style={{ background: '#281D1B', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '50px', cursor: 'pointer', fontWeight: '600', width: '100%' }}>ตกลง</button>
      </div>
    </div>
  );
};

// --- Main Page ---
const AccountPage = () => {
  const [userInfo, setUserInfo] = useState({
    email: '',
    currentPassword: '',
    password: '',
    confirmPassword: '',
    date_of_birth: null,
    gender: '',
    skin_type: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  // Fetch Profile
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await apiFetch('/users/me');
      if (response.ok) {
        const json = await response.json();
        const user = json.data;
        setUserInfo({
          email: user.email || '',
          currentPassword: '',
          password: '',
          confirmPassword: '',
          date_of_birth: parseISOLocal(user.date_of_birth),
          gender: user.gender || 'female',
          skin_type: user.skin_type || 'oily'
        });
        setErrors({}); 
      }
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleInputChange = (field, value) => {
    const updatedUserInfo = { ...userInfo, [field]: value };
    setUserInfo(updatedUserInfo);

    let newErrors = { ...errors };

    // Check Password & Confirm Password
    if (field === 'password' || field === 'confirmPassword') {
        const pass = field === 'password' ? value : updatedUserInfo.password;
        const confirm = field === 'confirmPassword' ? value : updatedUserInfo.confirmPassword;

        if (field === 'password') {
            if (pass && pass.length < 8) newErrors.password = "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร";
            else delete newErrors.password;
        }

        if (confirm) {
            if (pass !== confirm) newErrors.confirmPassword = "รหัสผ่านไม่ตรงกัน";
            else delete newErrors.confirmPassword;
        } else {
            delete newErrors.confirmPassword;
        }
    }

    if (field === 'currentPassword') delete newErrors.currentPassword;

    setErrors(newErrors);
  };

  const verifyCurrentPassword = async (email, password) => {
    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        return res.ok;
    } catch { return false; }
  };

  // 🔥 Check Current Password on Blur (เมื่อกดออกจากช่อง)
  const checkCurrentPasswordValidity = async () => {
      if (!userInfo.currentPassword) return;
      const isValid = await verifyCurrentPassword(userInfo.email, userInfo.currentPassword);
      
      if (!isValid) {
          setErrors(prev => ({ ...prev, currentPassword: "รหัสผ่านปัจจุบันไม่ถูกต้อง (ตรวจสอบอีกครั้ง)" }));
      } else {
          setErrors(prev => ({ ...prev, currentPassword: null }));
      }
  };

  const validateForm = async () => {
      let newErrors = { ...errors };
      let isValid = true;

      const isTryingToChangePassword = userInfo.password || userInfo.confirmPassword;

      if (isTryingToChangePassword) {
          if (!userInfo.password) {
              newErrors.password = "กรุณากรอกรหัสผ่าน";
              isValid = false;
          } else if (userInfo.password.length < 8) {
              newErrors.password = "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร";
              isValid = false;
          }

          if (!userInfo.confirmPassword) {
              newErrors.confirmPassword = "กรุณากรอกยืนยันรหัสผ่าน";
              isValid = false;
          } else if (userInfo.password !== userInfo.confirmPassword) {
              newErrors.confirmPassword = "รหัสผ่านไม่ตรงกัน";
              isValid = false;
          }

          if (!userInfo.currentPassword) {
              newErrors.currentPassword = "กรุณากรอกรหัสผ่านปัจจุบันเพื่อยืนยัน";
              isValid = false;
          } else {
              const isPassCorrect = await verifyCurrentPassword(userInfo.email, userInfo.currentPassword);
              if (!isPassCorrect) {
                  newErrors.currentPassword = "รหัสผ่านปัจจุบันไม่ถูกต้อง";
                  isValid = false;
              }
          }
      }

      setErrors(newErrors);
      if (Object.keys(newErrors).length > 0 && Object.values(newErrors).some(x => x)) isValid = false;
      return isValid;
  };

  const handleSave = async () => {
    const isValid = await validateForm();
    if (!isValid) return; 

    try {
      const isoDate = formatISOLocal(userInfo.date_of_birth);
      const updateData = {
        date_of_birth: isoDate,
        gender: userInfo.gender,
        skin_type: userInfo.skin_type,
      };
      if (userInfo.password) updateData.password = userInfo.password;

      const res = await apiFetch('/users/me', { method: 'PATCH', body: JSON.stringify(updateData) });
      if (!res.ok) throw new Error();

      setShowSuccess(true);
      setIsEditing(false);
      setUserInfo(prev => ({ ...prev, password: '', confirmPassword: '', currentPassword: '' }));
      setErrors({});
    } catch {
      alert("เกิดข้อผิดพลาดในการบันทึก");
    }
  };

  const handleCancel = () => {
      setIsEditing(false);
      fetchProfile();
      setErrors({});
  }

  if (loading) return <div className="account-page-wrapper">Loading...</div>;

  return (
    <div className="account-page-wrapper">
      <SuccessModal isOpen={showSuccess} onClose={() => setShowSuccess(false)} />

      <div className="account-header">
        <h1 className="account-title">บัญชีของฉัน</h1>
        {!isEditing && (
          <button className="btn-edit-outline" onClick={() => setIsEditing(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: 6}}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
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

        {/* --- รหัสผ่านปัจจุบัน (เช็ค onBlur) --- */}
        {isEditing && (
            <div className="form-row">
                <label className="form-label" style={{color: '#333'}}>รหัสผ่านปัจจุบัน <span style={{color:'red'}}>*</span></label>
                <PasswordInput 
                    placeholder="กรอกเพื่อยืนยันการแก้ไข" 
                    value={userInfo.currentPassword} 
                    onChange={(e) => handleInputChange('currentPassword', e.target.value)} 
                    onBlur={checkCurrentPasswordValidity}
                    error={errors.currentPassword}
                />
            </div>
        )}

        <div className="form-row">
          <label className="form-label">รหัสผ่านใหม่</label> 
          <PasswordInput 
             placeholder={isEditing ? "กรอกรหัสผ่าน (ถ้าต้องการเปลี่ยน)" : "********"} 
             value={userInfo.password} 
             disabled={!isEditing} 
             onChange={(e) => handleInputChange('password', e.target.value)} 
             error={errors.password}
          />
        </div>

        {isEditing && (
          <div className="form-row">
            <label className="form-label">ยืนยันรหัสผ่าน</label> 
            <PasswordInput 
                placeholder="กรอกรหัสผ่านซ้ำอีกครั้ง" 
                value={userInfo.confirmPassword} 
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)} 
                error={errors.confirmPassword}
            />
          </div>
        )}
        
        <div style={{borderTop: '1px solid #eee', margin: '20px 0'}}></div>

        <div className="form-row">
          <label className="form-label">วันเกิด</label>
          <div className="input-wrapper">
             <DatePicker
                selected={userInfo.date_of_birth}
                onChange={(date) => handleInputChange('date_of_birth', date)}
                customInput={<CustomDateInput />}
                value={userInfo.date_of_birth ? formatThaiDisplay(userInfo.date_of_birth) : ''}
                locale="th"
                dateFormat="dd/MM/yyyy"
                placeholderText="เลือกวันเกิด"
                disabled={!isEditing}
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                popperPlacement="bottom-end" 
             />
          </div>
        </div>

        <div className="form-row">
          <label className="form-label">เพศ</label>
          <div className="input-wrapper">
             <CustomSelect 
                options={GENDER_OPTIONS}
                value={userInfo.gender}
                onChange={(val) => handleInputChange('gender', val)}
                placeholder="เลือกเพศ"
                disabled={!isEditing}
             />
          </div>
        </div>

        <div className="form-row">
          <label className="form-label">ประเภทผิว</label>
          <div className="input-wrapper">
             <CustomSelect 
                options={SKIN_TYPE_OPTIONS}
                value={userInfo.skin_type}
                onChange={(val) => handleInputChange('skin_type', val)}
                placeholder="เลือกประเภทผิว"
                disabled={!isEditing}
             />
          </div>
        </div>

        {isEditing && (
          <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
             <button className="btn-save-black" onClick={handleSave}>บันทึกการเปลี่ยนแปลง</button>
             <button className="btn-save-black" style={{background: '#999'}} onClick={handleCancel}>ยกเลิก</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountPage;