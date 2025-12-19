import React, { useState } from 'react';
import '../styles/AuthModal.css';
import CustomSelect from './CustomSelect';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/CustomDatePicker.css";

// --- Component Custom Input สำหรับ DatePicker ---
const CustomDateInput = React.forwardRef(({ value, onClick, placeholder }, ref) => (
  <div className="date-input-wrapper" onClick={onClick} ref={ref} style={{cursor: 'pointer'}}>
    <input 
      className="auth-input-date" 
      value={value}
      onChange={() => {}}
      placeholder={placeholder || "กรุณาเลือกวันเกิด"}
      readOnly 
    />
    <div className="calendar-icon-overlay">
       <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
    </div>
  </div>
));

// --- ไอคอน ---
const EyeOpenIcon = () => ( <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg> );
const EyeClosedIcon = () => ( <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg> );

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [mode, setMode] = useState('login'); 
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ✅ 1. เพิ่ม State เก็บค่า input เพื่อเอาไปตรวจสอบ
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // ข้อมูล Step 2
  const [birthDate, setBirthDate] = useState(null);
  const [gender, setGender] = useState('');
  const [skinType, setSkinType] = useState('');

  // ✅ 2. เพิ่ม State เก็บ Error Message
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const togglePassword = () => setShowPassword(!showPassword);
  const toggleConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);
  
  const handleGoToRegister = () => {
    setErrors({}); // ล้าง Error เก่าก่อนข้ามหน้า
    setMode('register_step1');
  };

  // ✅ 3. ฟังก์ชันตรวจสอบความถูกต้อง (Validation Logic)
  const validateRegisterStep1 = () => {
    let newErrors = {};
    let isValid = true;

    // 3.1 ตรวจอีเมล
    if (!email.trim()) {
      newErrors.email = "กรุณากรอกอีเมล";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "รูปแบบอีเมลไม่ถูกต้อง (ตัวอย่าง: name@example.com)";
      isValid = false;
    }

    // 3.2 ตรวจรหัสผ่าน (Advanced)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    // อธิบาย Regex:
    // (?=.*[a-z]) : มีตัวเล็กอย่างน้อย 1
    // (?=.*[A-Z]) : มีตัวใหญ่อย่างน้อย 1
    // (?=.*\d)    : มีตัวเลขอย่างน้อย 1
    // (?=.*[\W_]) : มีอักขระพิเศษอย่างน้อย 1
    // .{8,}       : ยาวอย่างน้อย 8 ตัว

    if (!password) {
      newErrors.password = "กรุณากรอกรหัสผ่าน";
      isValid = false;
    } else if (!passwordRegex.test(password)) {
      newErrors.password = "รหัสผ่านต้องมีอย่างน้อย 8 ตัว, พิมพ์ใหญ่, พิมพ์เล็ก, ตัวเลข และอักขระพิเศษ";
      isValid = false;
    }

    // 3.3 ตรวจยืนยันรหัสผ่าน
    if (!confirmPassword) {
      newErrors.confirmPassword = "กรุณายืนยันรหัสผ่าน";
      isValid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "รหัสผ่านไม่ตรงกัน";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // ปุ่ม "ถัดไป" (Step 1 -> Step 2)
  const handleNextStep = (e) => {
    e.preventDefault();
    // ถ้าผ่านการตรวจสอบ ให้ไปต่อ
    if (validateRegisterStep1()) {
       setErrors({}); // ล้าง Error
       setMode('register_step2');
    }
  };

  const handleFinalSubmit = (e) => {
    e.preventDefault();
    // (ส่วน Login อาจจะเพิ่ม check ง่ายๆ ว่าไม่ว่างเปล่า)
    if (mode === 'login' && (!email || !password)) {
        alert("กรุณากรอกข้อมูลให้ครบถ้วน");
        return;
    }
    // (ส่วน Register Step 2 อาจจะเพิ่ม check ว่าเลือกครบไหม)
    if (mode === 'register_step2' && (!birthDate || !gender || !skinType)) {
        alert("กรุณากรอกข้อมูลส่วนตัวให้ครบถ้วน");
        return;
    }
    onLoginSuccess(); 
  };

  const genderOptions = [ { value: 'male', label: 'ชาย' }, { value: 'female', label: 'หญิง' } ];
  const skinTypeOptions = [ { value: 'oily', label: 'ผิวมัน' }, { value: 'combination', label: 'ผิวผสม' }, { value: 'dry', label: 'ผิวแห้ง' }, { value: 'sensitive', label: 'ผิวแพ้ง่าย' } ];
  const eyeButtonStyle = { position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', color: '#666' };

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal-content">
        
        {mode !== 'login' && (
          <button className="modal-back-icon" onClick={() => setMode(mode === 'register_step2' ? 'register_step1' : 'login')}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
        )}
        <button className="modal-close-icon" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        {/* --- VIEW 1: Login --- */}
        {mode === 'login' && (
          <>
            <h2 className="auth-title">กรุณาสมัครสมาชิกหรือเข้าสู่ระบบก่อนดำเนินการต่อ</h2>
            <form onSubmit={handleFinalSubmit}>
              <div className="form-group">
                <label className="form-label">อีเมล</label>
                <input 
                    type="text" 
                    className="auth-input" 
                    placeholder="กรุณากรอกอีเมล" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">รหัสผ่าน</label>
                <div className="password-wrapper" style={{position: 'relative'}}>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    className="auth-input" 
                    placeholder="กรุณากรอกรหัสผ่าน" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button type="button" onClick={togglePassword} style={eyeButtonStyle}>
                    {showPassword ? <EyeOpenIcon /> : <EyeClosedIcon />}
                  </button>
                </div>
                <div style={{textAlign: 'right', marginTop: '10px'}}>
                    <span className="forgot-password-link">ลืมรหัสผ่าน</span>
                </div>
              </div>

              <button type="submit" className="auth-submit-btn">เข้าสู่ระบบ</button>
              <button type="button" className="auth-outline-btn" onClick={handleGoToRegister}>สมัครสมาชิก</button>
            </form>
          </>
        )}

        {/* --- VIEW 2: Register Step 1 (มี Validation) --- */}
        {mode === 'register_step1' && (
          <>
            <h2 className="auth-title">สมัครสมาชิก</h2>
            <form onSubmit={handleNextStep}>
              <div className="form-group">
                <label className="form-label">อีเมล</label>
                <input 
                    type="text" 
                    className={`auth-input ${errors.email ? 'input-error' : ''}`} // เพิ่ม class แดง
                    placeholder="กรุณากรอกอีเมล" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">รหัสผ่าน</label>
                <div className={`password-wrapper ${errors.password ? 'input-error' : ''}`} style={{position: 'relative'}}>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="........" 
                    className="auth-input" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button type="button" onClick={togglePassword} style={eyeButtonStyle}>
                    {showPassword ? <EyeOpenIcon /> : <EyeClosedIcon />}
                  </button>
                </div>
                {errors.password && <span className="error-text">{errors.password}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">ยืนยันรหัสผ่าน</label>
                <div className={`password-wrapper ${errors.confirmPassword ? 'input-error' : ''}`} style={{position: 'relative'}}>
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    placeholder="กรุณากรอกรหัสผ่าน" 
                    className="auth-input" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button type="button" onClick={toggleConfirmPassword} style={eyeButtonStyle}>
                    {showConfirmPassword ? <EyeOpenIcon /> : <EyeClosedIcon />}
                  </button>
                </div>
                {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
              </div>
              <button type="submit" className="auth-submit-btn" style={{marginTop: '20px'}}>ถัดไป</button>
            </form>
          </>
        )}

        {/* --- VIEW 3: Register Step 2 --- */}
        {mode === 'register_step2' && (
          <>
            <h2 className="auth-title">ข้อมูลส่วนบุคคลสำหรับระบบแนะนำ</h2>
            <form onSubmit={handleFinalSubmit}>
              
              <div className="form-group">
                <label className="form-label">วันเกิด</label>
                <DatePicker
                  selected={birthDate}
                  onChange={(date) => setBirthDate(date)}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="กรุณาเลือกวันเกิด"
                  customInput={<CustomDateInput />} 
                  showYearDropdown
                  scrollableYearDropdown
                  yearDropdownItemNumber={100}
                />
              </div>

              <div className="form-group">
                <label className="form-label">เพศ</label>
                <CustomSelect options={genderOptions} placeholder="กรุณาเลือกเพศของคุณ" value={gender} onChange={setGender} />
              </div>

              <div className="form-group">
                <label className="form-label">ประเภทผิว</label>
                <CustomSelect options={skinTypeOptions} placeholder="กรุณาเลือกประเภทผิวของคุณ" value={skinType} onChange={setSkinType} />
              </div>

              <button type="submit" className="auth-submit-btn">สมัครสมาชิก</button>
            </form>
          </>
        )}

        <div className="auth-legal-text">
          การใช้งานระบบถือว่ายอมรับ <a href="#" className="legal-link">เงื่อนไขการใช้งาน</a> และ <a href="#" className="legal-link">นโยบายความเป็นส่วนตัว</a>
        </div>
      </div>
    </div>
  );
}