import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import '../styles/AuthModal.css';
import CustomSelect from './CustomSelect';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/CustomDatePicker.css";

const API_URL = import.meta.env.VITE_DIRECTUS_PUBLIC_URL;
const MEMBER_ROLE_ID = import.meta.env.VITE_MEMBER_ROLE_ID;

// --- Helper Components ---
const CustomDateInput = React.forwardRef(({ value, onClick, placeholder }, ref) => (
  <div className="date-input-wrapper" onClick={onClick} ref={ref} style={{ cursor: 'pointer' }}>
    <input className="auth-input-date" value={value} onChange={() => { }} placeholder={placeholder || "กรุณาเลือกวันเกิด"} readOnly />
    <div className="calendar-icon-overlay">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
    </div>
  </div>
));

const EyeOpenIcon = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>);
const EyeClosedIcon = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>);
const CheckIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#28a745" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>);

// 🔴 Icon สำหรับ Error (สีแดง)
const AlertCircleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#721c24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{minWidth: '20px'}}>
        <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
);

const PasswordRequirement = ({ met, text }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: met ? '#28a745' : '#888', marginBottom: '4px' }}>
    {met ? <CheckIcon /> : <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid #ddd' }}></div>}
    <span>{text}</span>
  </div>
);

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const navigate = useNavigate(); 
  
  const [mode, setMode] = useState('login');
  const [hideRegisterButton, setHideRegisterButton] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [birthDate, setBirthDate] = useState(null);
  const [gender, setGender] = useState('');
  const [skinType, setSkinType] = useState('');
  
  const [errors, setErrors] = useState({});
  // ✅ เปลี่ยนจาก loginError เป็น error เพื่อใช้ร่วมกันทั้ง Login และ Register
  const [error, setError] = useState(''); 
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
       setError(''); // เคลียร์ Error ทุกครั้งที่เปิด Modal
       setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const togglePassword = () => setShowPassword(!showPassword);
  const toggleConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

  const handleGoToRegister = () => {
    setErrors({});
    setError('');
    setMode('register_step1');
  };

  const handleBack = () => {
    setErrors({});
    setError('');
    if (mode === 'register_step2') {
      setMode('register_step1');
    } else {
      setMode('login');
    }
  };

  // --- Real-time Validation ---
  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    setError(''); // เคลียร์ Banner Error
    if (val && !/\S+@\S+\.\S+/.test(val)) {
        setErrors(prev => ({ ...prev, email: "รูปแบบอีเมลไม่ถูกต้อง" }));
    } else {
        setErrors(prev => { const newErr = { ...prev }; delete newErr.email; return newErr; });
    }
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    setError(''); // เคลียร์ Banner Error
    if (confirmPassword && val !== confirmPassword) {
        setErrors(prev => ({ ...prev, confirmPassword: "รหัสผ่านไม่ตรงกัน" }));
    } else if (confirmPassword && val === confirmPassword) {
        setErrors(prev => { const newErr = { ...prev }; delete newErr.confirmPassword; return newErr; });
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const val = e.target.value;
    setConfirmPassword(val);
    if (val && val !== password) {
        setErrors(prev => ({ ...prev, confirmPassword: "รหัสผ่านไม่ตรงกัน" }));
    } else {
        setErrors(prev => { const newErr = { ...prev }; delete newErr.confirmPassword; return newErr; });
    }
  };

  const isLengthValid = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[\W_]/.test(password);

  const validateRegisterStep1 = () => {
    let newErrors = {};
    let isValid = true;
    if (!email.trim()) { newErrors.email = "กรุณากรอกอีเมล"; isValid = false; } 
    else if (!/\S+@\S+\.\S+/.test(email)) { newErrors.email = "รูปแบบอีเมลไม่ถูกต้อง"; isValid = false; }
    if (!(isLengthValid && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar)) { newErrors.password = "กรุณาตั้งรหัสผ่านให้ครบตามเงื่อนไข"; isValid = false; }
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
    setError(''); // เคลียร์ Error ก่อนยิง API

    try {
      // --- LOGIN ---
      if (mode === 'login') {
        if (!email || !password) {
          setError("กรุณากรอกอีเมลและรหัสผ่าน"); // 🔴 ใช้ Banner แทน alert
          setIsLoading(false);
          return;
        }

        const response = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await response.json();

        if (response.ok) {
          const accessToken = data.data.access_token;
          const meResponse = await fetch(`${API_URL}/users/me?fields=role`, { headers: { 'Authorization': `Bearer ${accessToken}` } });
          const meData = await meResponse.json();

          if (MEMBER_ROLE_ID && meData.data.role !== MEMBER_ROLE_ID) {
            setError("บัญชีนี้ไม่มีสิทธิ์เข้าใช้งาน (Role ไม่ถูกต้อง)"); // 🔴 Banner
            setIsLoading(false);
            return; 
          }

          localStorage.setItem('access_token', accessToken);
          localStorage.setItem('refresh_token', data.data.refresh_token);
          
          if (onLoginSuccess) onLoginSuccess();
          if (onClose) onClose(); 
          navigate('/'); 
        } else {
          setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง"); // 🔴 Banner
        }
      } 
      
      // --- REGISTER ---
      else if (mode === 'register_step2') {
        if (!birthDate || !gender || !skinType) {
            setError("กรุณากรอกข้อมูลส่วนตัวให้ครบถ้วน"); // 🔴 ใช้ Banner แทน alert
            setIsLoading(false);
            return;
        }
        const formattedDate = birthDate.toISOString().split('T')[0];
        const registerPayload = { email, password, date_of_birth: formattedDate, gender, skin_type: skinType, role: MEMBER_ROLE_ID };

        const response = await fetch(`${API_URL}/users`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(registerPayload),
        });
        const data = await response.json();

        if (response.ok) {
          setMode('register_success');
        } else {
           // 🔴 เปลี่ยน Alert เป็น Error Banner ทั้งหมด
           if (data.errors?.[0]?.message?.includes("forbidden")) {
             setError("เกิดข้อผิดพลาด: Role permission denied");
          } else {
             setError(`สมัครสมาชิกไม่สำเร็จ: ${data.errors?.[0]?.message || 'อีเมลนี้อาจถูกใช้งานแล้ว'}`);
          }
        }
      }
    } catch (err) {
      console.error("Network Error:", err);
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์"); // 🔴 Banner
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessContinue = () => {
      setPassword(''); setConfirmPassword(''); setMode('login'); setHideRegisterButton(true);
  };

  const genderOptions = [ { value: 'male', label: 'ชาย' }, { value: 'female', label: 'หญิง' } ];
  const skinTypeOptions = [ { value: 'oily', label: 'ผิวมัน' }, { value: 'combination', label: 'ผิวผสม' }, { value: 'dry', label: 'ผิวแห้ง' }, { value: 'sensitive', label: 'ผิวแพ้ง่าย' } ];
  const eyeButtonStyle = { position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', color: '#666' };
  
  return (
    <div className="auth-modal-overlay"> 
      <div className="auth-modal-content">
        {(mode === 'register_step1' || mode === 'register_step2') && (
          <button className="modal-back-icon" onClick={handleBack}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
        )}
        
        {/* โหมด Login */}
        {mode === 'login' && (
          <>
            <h2 className="auth-title">{hideRegisterButton ? "เข้าสู่ระบบ" : "กรุณาสมัครสมาชิกหรือเข้าสู่ระบบก่อนดำเนินการต่อ"}</h2>
            
            {/* 🟢 Banner Success (สีเขียว) */}
            {hideRegisterButton && (
                <div style={{background: '#d4edda', color: '#155724', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '0.9rem', textAlign: 'center'}}>
                    🎉 สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ
                </div>
            )}

            {/* 🔴 Banner Error (สีแดง) - แสดงเมื่อมี error เกิดขึ้น */}
            {error && (
                <div style={{
                    background: '#f8d7da', 
                    color: '#721c24', 
                    padding: '12px', 
                    borderRadius: '8px', 
                    marginBottom: '15px', 
                    fontSize: '0.85rem', 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: '8px', 
                    border: '1px solid #f5c6cb'
                }}>
                    <div style={{marginTop: '2px'}}><AlertCircleIcon /></div>
                    <span>{error}</span>
                </div>
            )}
            
            <form onSubmit={handleFinalSubmit}>
              <div className="form-group">
                <label className="form-label">อีเมล</label>
                <input type="text" className={`auth-input ${error ? 'input-error' : ''}`} placeholder="name@example.com" value={email} onChange={handleEmailChange} />
              </div>
              <div className="form-group">
                <label className="form-label">รหัสผ่าน</label>
                <div className={`password-wrapper ${error ? 'input-error' : ''}`} style={{position: 'relative'}}>
                  <input type={showPassword ? "text" : "password"} className="auth-input" placeholder="กรอกรหัสผ่านของคุณ" value={password} onChange={handlePasswordChange} />
                  <button type="button" onClick={togglePassword} style={eyeButtonStyle}>{showPassword ? <EyeOpenIcon /> : <EyeClosedIcon />}</button>
                </div>
                <div style={{textAlign: 'right', marginTop: '10px'}}><span className="forgot-password-link">ลืมรหัสผ่าน?</span></div>
              </div>
              <button type="submit" className="auth-submit-btn" disabled={isLoading}>{isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}</button>
              {!hideRegisterButton && (<button type="button" className="auth-outline-btn" onClick={handleGoToRegister}>สมัครสมาชิกใหม่</button>)}
            </form>
          </>
        )}

        {/* โหมด Register Step 1 */}
        {mode === 'register_step1' && (
          <>
            <h2 className="auth-title">สร้างบัญชีใหม่</h2>
            <form onSubmit={handleNextStep}>
              <div className="form-group"><label className="form-label">อีเมล</label><input type="text" className={`auth-input ${errors.email ? 'input-error' : ''}`} placeholder="name@example.com" value={email} onChange={handleEmailChange} /><div style={{fontSize: '0.75rem', color: '#888', marginTop: '4px', marginLeft: '2px'}}>เราจะใช้สำหรับการเข้าสู่ระบบและแจ้งเตือน</div>{errors.email && <span className="error-text">{errors.email}</span>}</div>
              <div className="form-group"><label className="form-label">รหัสผ่าน</label>
                <div className={`password-wrapper ${errors.password ? 'input-error' : ''}`} style={{position: 'relative'}}>
                  <input type={showPassword ? "text" : "password"} placeholder="กรุณากรอกรหัสผ่าน" className="auth-input" value={password} onChange={handlePasswordChange} />
                  <button type="button" onClick={togglePassword} style={eyeButtonStyle}>{showPassword ? <EyeOpenIcon /> : <EyeClosedIcon />}</button>
                </div>
                <div style={{marginTop: '10px', background: '#f9f9f9', padding: '10px', borderRadius: '8px'}}>
                    <PasswordRequirement met={isLengthValid} text="อย่างน้อย 8 ตัวอักษร" />
                    <PasswordRequirement met={hasUpperCase} text="ตัวพิมพ์ใหญ่ (A-Z) อย่างน้อย 1 ตัว" />
                    <PasswordRequirement met={hasLowerCase} text="ตัวพิมพ์เล็ก (a-z) อย่างน้อย 1 ตัว" />
                    <PasswordRequirement met={hasNumber} text="ตัวเลข (0-9) อย่างน้อย 1 ตัว" />
                    <PasswordRequirement met={hasSpecialChar} text="อักขระพิเศษ (!@#$%)" />
                </div>
                {errors.password && <span className="error-text">{errors.password}</span>}
              </div>
              <div className="form-group"><label className="form-label">ยืนยันรหัสผ่าน</label>
                <div className={`password-wrapper ${errors.confirmPassword ? 'input-error' : ''}`} style={{position: 'relative'}}>
                  <input type={showConfirmPassword ? "text" : "password"} placeholder="กรุณากรอกรหัสผ่าน" className="auth-input" value={confirmPassword} onChange={handleConfirmPasswordChange} />
                  <button type="button" onClick={toggleConfirmPassword} style={eyeButtonStyle}>{showConfirmPassword ? <EyeOpenIcon /> : <EyeClosedIcon />}</button>
                </div>
                {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
              </div>
              <button type="submit" className="auth-submit-btn" style={{marginTop: '20px'}}>ถัดไป</button>
            </form>
          </>
        )}

        {/* โหมด Register Step 2 */}
        {mode === 'register_step2' && (
          <>
            <h2 className="auth-title">ข้อมูลส่วนตัวเพิ่มเติม</h2>
            <p style={{textAlign: 'center', color: '#666', marginBottom: '20px', fontSize: '0.9rem'}}>เพื่อให้ระบบแนะนำสินค้าได้เหมาะสมกับคุณที่สุด</p>
            
            {/* 🔴 Banner Error ก็จะแสดงที่หน้านี้ด้วยถ้ามี Error จากการสมัคร */}
            {error && (
                <div style={{background: '#f8d7da', color: '#721c24', padding: '12px', borderRadius: '8px', marginBottom: '15px', fontSize: '0.85rem', display: 'flex', alignItems: 'flex-start', gap: '8px', border: '1px solid #f5c6cb'}}>
                    <div style={{marginTop: '2px'}}><AlertCircleIcon /></div><span>{error}</span>
                </div>
            )}

            <form onSubmit={handleFinalSubmit}>
              <div className="form-group"><label className="form-label">วันเกิด</label><DatePicker selected={birthDate} onChange={(date) => setBirthDate(date)} dateFormat="dd/MM/yyyy" placeholderText="กรุณาเลือกวันเกิด" customInput={<CustomDateInput />} showYearDropdown scrollableYearDropdown yearDropdownItemNumber={100} /></div>
              <div className="form-group"><label className="form-label">เพศ</label><CustomSelect options={genderOptions} placeholder="กรุณาเลือกเพศของคุณ" value={gender} onChange={setGender} /></div>
              <div className="form-group">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}><label className="form-label">ประเภทผิว</label><a href="https://choicechecker.com/quiz/testing?id=1" target="_blank" rel="noreferrer" style={{fontSize: '0.8rem', color: '#F1978C', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px'}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>ไม่แน่ใจ? ทำแบบทดสอบ</a></div>
                <CustomSelect options={skinTypeOptions} placeholder="กรุณาเลือกสภาพผิวของคุณ" value={skinType} onChange={setSkinType} />
              </div>
              <button type="submit" className="auth-submit-btn" disabled={isLoading}>{isLoading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}</button>
            </form>
          </>
        )}

        {/* โหมด Success */}
        {mode === 'register_success' && (
            <div style={{textAlign: 'center', padding: '20px 0'}}>
                <div style={{width: '80px', height: '80px', background: '#d4edda', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'}}><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#28a745" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
                <h2 className="auth-title" style={{marginBottom: '10px'}}>สมัครสมาชิกสำเร็จ!</h2>
                <p style={{color: '#666', marginBottom: '30px'}}>บัญชีของคุณพร้อมใช้งานแล้ว กรุณาเข้าสู่ระบบเพื่อเริ่มต้น</p>
                <button onClick={handleSuccessContinue} className="auth-submit-btn">เข้าสู่ระบบ</button>
            </div>
        )}

        {mode !== 'register_success' && ( <div className="auth-legal-text">การใช้งานระบบถือว่ายอมรับ <a href="#" className="legal-link">เงื่อนไขการใช้งาน</a> และ <a href="#" className="legal-link">นโยบายความเป็นส่วนตัว</a></div> )}
      </div>
    </div>
  );
}