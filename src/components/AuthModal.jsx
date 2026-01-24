import React, { useState, useEffect, forwardRef } from 'react';
import { useNavigate } from 'react-router-dom'; 
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import '../styles/AuthModal.css'; // ✅ ใช้ CSS สไตล์เดิม
import CustomSelect from './CustomSelect';

const API_URL = import.meta.env.VITE_DIRECTUS_PUBLIC_URL;
const MEMBER_ROLE_ID = import.meta.env.VITE_MEMBER_ROLE_ID;

// --- Helper Components & Icons ---
const CustomDateInput = forwardRef(({ value, onClick, placeholder }, ref) => (
  <div className="date-input-wrapper" onClick={onClick} ref={ref}>
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

const EyeOpenIcon = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>);
const EyeClosedIcon = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>);
const CheckIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#28a745" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>);
const AlertCircleIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#721c24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{minWidth: '20px'}}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>);

const PasswordRequirement = ({ met, text }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: met ? '#28a745' : '#888', lineHeight: '1.4' }}>
    {met ? <CheckIcon /> : <div style={{ minWidth: 16, height: 16, borderRadius: '50%', border: '2px solid #ddd' }}></div>}
    <span>{text}</span>
  </div>
);

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const navigate = useNavigate(); 
  
  const [mode, setMode] = useState('login'); 
  const [hideRegisterButton, setHideRegisterButton] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [birthDate, setBirthDate] = useState(null);
  const [gender, setGender] = useState('');
  const [skinType, setSkinType] = useState('');
  
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
       setError('');
       setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const togglePassword = () => setShowPassword(!showPassword);
  const toggleConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

  const handleGoToRegister = () => {
    setErrors({}); setError(''); setMode('register_step1');
  };

  const handleBack = () => {
    setErrors({}); setError('');
    if (mode === 'register_step2') setMode('register_step1');
    else setMode('login');
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    if (val && !/\S+@\S+\.\S+/.test(val)) setErrors(prev => ({ ...prev, email: "รูปแบบอีเมลไม่ถูกต้อง" }));
    else setErrors(prev => { const newErr = { ...prev }; delete newErr.email; return newErr; });
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    if (confirmPassword && val !== confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: "รหัสผ่านไม่ตรงกัน" }));
    else setErrors(prev => { const newErr = { ...prev }; delete newErr.confirmPassword; return newErr; });
  };

  const handleConfirmPasswordChange = (e) => {
    const val = e.target.value;
    setConfirmPassword(val);
    if (val && val !== password) setErrors(prev => ({ ...prev, confirmPassword: "รหัสผ่านไม่ตรงกัน" }));
    else setErrors(prev => { const newErr = { ...prev }; delete newErr.confirmPassword; return newErr; });
  };

  // Logic รวมเงื่อนไขรหัสผ่าน
  const isLengthValid = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[\W_]/.test(password);
  const isPasswordComplex = isLengthValid && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;

  const validateRegisterStep1 = () => {
    let newErrors = {};
    let isValid = true;
    if (!email.trim()) { newErrors.email = "กรุณากรอกอีเมล"; isValid = false; } 
    else if (!/\S+@\S+\.\S+/.test(email)) { newErrors.email = "รูปแบบอีเมลไม่ถูกต้อง"; isValid = false; }
    
    if (!isPasswordComplex) { newErrors.password = "กรุณาตั้งรหัสผ่านให้ครบตามเงื่อนไข"; isValid = false; }
    
    if (!confirmPassword) { newErrors.confirmPassword = "กรุณายืนยันรหัสผ่าน"; isValid = false; } 
    else if (password !== confirmPassword) { newErrors.confirmPassword = "รหัสผ่านไม่ตรงกัน"; isValid = false; }
    setErrors(newErrors);
    return isValid;
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (validateRegisterStep1()) { setErrors({}); setMode('register_step2'); }
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      let url = `${API_URL}/auth/login`;
      let method = 'POST';
      let bodyData = {};

      // 1. เตรียมข้อมูล
      if (mode === 'login') {
        if (!email || !password) throw new Error("กรุณากรอกอีเมลและรหัสผ่าน");
        bodyData = { email, password };
      } 
      else if (mode === 'register_step2') {
        if (!birthDate || !gender || !skinType) throw new Error("กรุณากรอกข้อมูลให้ครบถ้วน");
        
        const year = birthDate.getFullYear();
        const month = String(birthDate.getMonth() + 1).padStart(2, '0');
        const day = String(birthDate.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;

        url = `${API_URL}/users`;
        bodyData = { 
            email, 
            password, 
            date_of_birth: formattedDate, 
            gender, 
            skin_type: skinType, 
            role: MEMBER_ROLE_ID 
        };
      }

      // 2. ยิง API
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });

      const contentType = response.headers.get("content-type");
      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error("Non-JSON Error:", text);
        throw new Error("เซิร์ฟเวอร์ตอบกลับผิดพลาด (โปรดลองใหม่อีกครั้ง)");
      }

      // 3. ตรวจสอบผลลัพธ์
      if (response.ok) {
        if (mode === 'login') {
            const accessToken = data.data.access_token;
            if (MEMBER_ROLE_ID) {
                const meResponse = await fetch(`${API_URL}/users/me?fields=role`, { 
                    headers: { 'Authorization': `Bearer ${accessToken}` } 
                });
                if (meResponse.ok) {
                    const meData = await meResponse.json();
                    if (meData.data.role !== MEMBER_ROLE_ID) throw new Error("บัญชีนี้ไม่มีสิทธิ์เข้าใช้งาน");
                }
            }
            localStorage.setItem('access_token', accessToken);
            localStorage.setItem('refresh_token', data.data.refresh_token);
            if (onLoginSuccess) onLoginSuccess();
            if (onClose) onClose(); 
            navigate('/'); 
        } else {
            // สมัครเสร็จ -> เคลียร์ค่า -> เด้งไป Login
            setPassword(''); 
            setConfirmPassword(''); 
            setMode('login'); 
            setHideRegisterButton(true);
        }
      } else {
        let errorMsg = "ดำเนินการไม่สำเร็จ";
        if (data.errors && data.errors.length > 0) {
            const code = data.errors[0]?.extensions?.code;
            const msg = data.errors[0]?.message;
            if (code === 'RECORD_NOT_UNIQUE') errorMsg = "อีเมลนี้ถูกใช้งานแล้ว";
            else if (code === 'INVALID_CREDENTIALS') errorMsg = "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
            else if (msg) errorMsg = msg;
        }
        setError(errorMsg);
      }
    } catch (err) {
      console.error("Critical Error:", err);
      setError(err.message || "เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setIsLoading(false);
    }
  };

  const genderOptions = [ { value: 'male', label: 'ชาย' }, { value: 'female', label: 'หญิง' } ];
  const skinTypeOptions = [ { value: 'oily', label: 'ผิวมัน' }, { value: 'combination', label: 'ผิวผสม' }, { value: 'dry', label: 'ผิวแห้ง' }, { value: 'sensitive', label: 'ผิวแพ้ง่าย' } ];
  
  return (
    <div className="auth-modal-overlay" onClick={onClose}> 
      <div className="auth-modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close-icon" onClick={onClose}>&times;</button>
        {(mode === 'register_step1' || mode === 'register_step2') && (
          <button className="modal-back-icon" onClick={handleBack}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg></button>
        )}
        
        {/* --- LOGIN --- */}
        {mode === 'login' && (
          <>
            <h2 className="auth-title">{hideRegisterButton ? "เข้าสู่ระบบ" : "กรุณาสมัครสมาชิกหรือเข้าสู่ระบบก่อนดำเนินการต่อ"}</h2>
            
            {hideRegisterButton && <div style={{background: '#d4edda', color: '#155724', padding: '10px', borderRadius: '14px', marginBottom: '20px', textAlign: 'center'}}>สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ</div>}
            
            {error && <div style={{ background: '#f8d7da', color: '#721c24', padding: '12px', borderRadius: '14px', marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}><AlertCircleIcon /><span>{error}</span></div>}
            
            <form onSubmit={handleFinalSubmit}>
              <div className="form-group">
                <label className="form-label">อีเมล</label>
                <input type="text" className={`auth-input ${error ? 'input-error' : ''}`} placeholder="name@example.com" value={email} onChange={handleEmailChange} />
              </div>
              <div className="form-group">
                <label className="form-label">รหัสผ่าน</label>
                <div className={`password-wrapper ${error ? 'input-error' : ''}`}>
                  <input type={showPassword ? "text" : "password"} className="auth-input" style={{paddingRight: '50px'}} placeholder="กรอกรหัสผ่านของคุณ" value={password} onChange={handlePasswordChange} />
                  <button type="button" className="password-toggle-btn" onClick={togglePassword}>{showPassword ? <EyeOpenIcon /> : <EyeClosedIcon />}</button>
                </div>
                {/* 🔥 เพิ่มปุ่มลืมรหัสผ่านตรงนี้ครับ 🔥 */}
                <div style={{ textAlign: 'right', marginTop: '8px' }}>
                    <span className="forgot-password-link">ลืมรหัสผ่าน?</span>
                </div>
              </div>
              <button type="submit" className="auth-submit-btn" disabled={isLoading}>{isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}</button>
              {!hideRegisterButton && (<button type="button" className="auth-outline-btn" onClick={handleGoToRegister}>สมัครสมาชิกใหม่</button>)}
            </form>
          </>
        )}

        {/* --- REGISTER STEP 1 --- */}
        {mode === 'register_step1' && (
          <>
            <h2 className="auth-title">สมัครสมาชิก</h2>
            <form onSubmit={handleNextStep}>
              <div className="form-group">
                  <label className="form-label">อีเมล</label>
                  <input type="text" className={`auth-input ${errors.email ? 'input-error' : ''}`} placeholder="name@example.com" value={email} onChange={handleEmailChange} />
                  {errors.email && <span className="error-text">{errors.email}</span>}
              </div>
              <div className="form-group"><label className="form-label">รหัสผ่าน</label>
                <div className={`password-wrapper ${errors.password ? 'input-error' : ''}`}>
                  <input type={showPassword ? "text" : "password"} placeholder="กรุณากรอกรหัสผ่าน" className="auth-input" style={{paddingRight: '50px'}} value={password} onChange={handlePasswordChange} />
                  <button type="button" className="password-toggle-btn" onClick={togglePassword}>{showPassword ? <EyeOpenIcon /> : <EyeClosedIcon />}</button>
                </div>
                
                {password && (
                    <div style={{marginTop: '10px', background: '#F5F7FA', padding: '12px', borderRadius: '14px'}}>
                        <PasswordRequirement 
                            met={isPasswordComplex} 
                            text="ต้องมีตัวพิมพ์ใหญ่, เล็ก, ตัวเลข และอักขระพิเศษ ผสมกัน (8 ตัวอักษรขึ้นไป)" 
                        />
                    </div>
                )}
                {errors.password && <span className="error-text">{errors.password}</span>}
              </div>
              <div className="form-group"><label className="form-label">ยืนยันรหัสผ่าน</label>
                <div className={`password-wrapper ${errors.confirmPassword ? 'input-error' : ''}`}>
                  <input type={showConfirmPassword ? "text" : "password"} placeholder="กรุณากรอกรหัสผ่าน" className="auth-input" style={{paddingRight: '50px'}} value={confirmPassword} onChange={handleConfirmPasswordChange} />
                  <button type="button" className="password-toggle-btn" onClick={toggleConfirmPassword}>{showConfirmPassword ? <EyeOpenIcon /> : <EyeClosedIcon />}</button>
                </div>
                {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
              </div>
              <button type="submit" className="auth-submit-btn">ถัดไป</button>
            </form>
          </>
        )}

        {/* --- REGISTER STEP 2 --- */}
        {mode === 'register_step2' && (
          <>
            <h2 className="auth-title">ข้อมูลส่วนบุคคล</h2>
            {error && <div style={{ background: '#f8d7da', color: '#721c24', padding: '12px', borderRadius: '14px', marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}><AlertCircleIcon /><span>{error}</span></div>}
            <form onSubmit={handleFinalSubmit}>
              <div className="form-group"><label className="form-label">วันเกิด</label>
                <DatePicker selected={birthDate} onChange={(date) => setBirthDate(date)} dateFormat="dd/MM/yyyy" placeholderText="กรุณาเลือกวันเกิด" customInput={<CustomDateInput />} showYearDropdown scrollableYearDropdown yearDropdownItemNumber={100} maxDate={new Date()} />
              </div>
              <div className="form-group"><label className="form-label">เพศ</label><CustomSelect options={genderOptions} placeholder="กรุณาเลือกเพศของคุณ" value={gender} onChange={setGender} /></div>
              <div className="form-group">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <label className="form-label">ประเภทผิว</label>
                  <a 
                    href="https://choicechecker.com/quiz/testing?id=1" 
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{fontSize: '13px'}} 
                    className="legal-link"
                  >
                    ไม่แน่ใจ? ทำแบบทดสอบ
                  </a>
                </div>
                <CustomSelect options={skinTypeOptions} placeholder="กรุณาเลือกสภาพผิวของคุณ" value={skinType} onChange={setSkinType} />
              </div>
              <button type="submit" className="auth-submit-btn" disabled={isLoading}>{isLoading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}</button>
            </form>
          </>
        )}

        <div className="auth-legal-text">การใช้งานระบบถือว่ายอมรับ <a href="#" className="legal-link">เงื่อนไขการใช้งาน</a> และ <a href="#" className="legal-link">นโยบายความเป็นส่วนตัว</a></div>
      </div>
    </div>
  );
}