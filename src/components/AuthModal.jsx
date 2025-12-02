import React, { useState } from 'react';
import '../styles/AuthModal.css';

// --- [เพิ่ม] ตัวช่วย Regex ---
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // เช็ครูปแบบอีเมล
const PWD_REGEX = {
  lower: /(?=.*[a-z])/, // มีตัวเล็ก
  upper: /(?=.*[A-Z])/, // มีตัวใหญ่
  number: /(?=.*[0-9])/, // มีตัวเลข
  special: /(?=.*[!@#$%^&*])/, // มีอักขระพิเศษ
  length: /.{8,}/, // ยาว 8 ตัว
};

export default function AuthModal({ onLoginSuccess, onClose, allowClose }) {
  const [mode, setMode] = useState('login');

  // --- 1. Component LoginView (อัปเกรด) ---
  const LoginView = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // [เปลี่ยน] State Error แยกช่อง
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    // ฟังก์ชัน Validate Login
    const validateLogin = () => {
      let isValid = true;
      
      // 1. เช็คอีเมล
      if (email.trim() === '') {
        setEmailError('กรุณากรอกอีเมล');
        isValid = false;
      } else if (!EMAIL_REGEX.test(email)) {
        setEmailError('รูปแบบอีเมลไม่ถูกต้อง');
        isValid = false;
      } else {
        setEmailError('');
      }

      // 2. เช็ครหัสผ่าน
      if (password.trim() === '') {
        setPasswordError('กรุณากรอกรหัสผ่าน');
        isValid = false;
      } else {
        setPasswordError('');
      }
      
      return isValid;
    };

    const handleLogin = () => {
      if (validateLogin()) {
        console.log('Login attempt with:', email);
        onLoginSuccess(); 
      }
    };

    return (
      <>
        <div className="modal-header">กรุณาสมัครสมาชิกหรือเข้าสู่ระบบ</div>

        <div className="form-group">
          <label className="form-label">อีเมล</label>
          <input 
            type="text" 
            className={`form-input ${emailError ? 'is-invalid' : ''}`}
            placeholder="กรุณากรอกอีเมล"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <p className="form-help-text">{emailError}</p>
        </div>

        <div className="form-group">
            <label className="form-label">รหัสผ่าน</label>
            <div className="form-input-icon">
              <input 
                type={showPassword ? "text" : "password"} 
                className={`form-input ${passwordError ? 'is-invalid' : ''}`}
                placeholder="กรุณากรอกรหัสผ่าน" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="button" className="input-icon-btn" onClick={() => setShowPassword(!showPassword)}>
                 {/* ... (SVG ไอคอนตา) ... */}
              </button>
            </div>
            <p className="form-help-text">{passwordError}</p>
        </div>
        
        <button className="btn-primary" onClick={handleLogin}>เข้าสู่ระบบ</button>
        <button className="btn-secondary" onClick={() => setMode('register')}>สมัครสมาชิก</button>
        <div className="modal-switch">ลืมรหัสผ่าน? <a>คลิกที่นี่</a></div>
      </>
    );
  };

  // --- 2. Component RegisterView (อัปเกรด) ---
  const RegisterView = () => {
    const [registerStep, setRegisterStep] = useState(1);
    
    // Form States (หน้า 1)
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);
    
    // Error States (หน้า 1)
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmError, setConfirmError] = useState('');

    // Form States (หน้า 2)
    const [birthDate, setBirthDate] = useState('');
    const [gender, setGender] = useState('');
    const [skinType, setSkinType] = useState('');
    const [step2Error, setStep2Error] = useState(''); // Error สำหรับหน้า 2

    // ฟังก์ชัน Validate Register Step 1
    const validateStep1 = () => {
      let isValid = true;

      // 1. เช็คอีเมล
      if (email.trim() === '') {
        setEmailError('กรุณากรอกอีเมล');
        isValid = false;
      } else if (!EMAIL_REGEX.test(email)) {
        setEmailError('รูปแบบอีเมลไม่ถูกต้อง');
        isValid = false;
      } else {
        setEmailError('');
      }

      // 2. เช็ครหัสผ่าน (ตามเงื่อนไข)
      if (password.length < 8) {
        setPasswordError('ต้องมีอย่างน้อย 8 ตัวอักษร');
        isValid = false;
      } else if (!PWD_REGEX.lower.test(password)) {
        setPasswordError('ต้องมีตัวพิมพ์เล็ก (a-z) อย่างน้อย 1 ตัว');
        isValid = false;
      } else if (!PWD_REGEX.upper.test(password)) {
        setPasswordError('ต้องมีตัวพิมพ์ใหญ่ (A-Z) อย่างน้อย 1 ตัว');
        isValid = false;
      } else if (!PWD_REGEX.number.test(password)) {
        setPasswordError('ต้องมีตัวเลข (0-9) อย่างน้อย 1 ตัว');
        isValid = false;
      } else if (!PWD_REGEX.special.test(password)) {
        setPasswordError('ต้องมีอักขระพิเศษ (!@#$%) อย่างน้อย 1 ตัว');
        isValid = false;
      } else {
        setPasswordError('');
      }

      // 3. เช็คยืนยันรหัสผ่าน
      if (confirmPassword.trim() === '') {
        setConfirmError('กรุณายืนยันรหัสผ่าน');
        isValid = false;
      } else if (password !== confirmPassword) {
        setConfirmError('รหัสผ่านทั้งสองช่องไม่ตรงกัน');
        isValid = false;
      } else {
        setConfirmError('');
      }
      
      return isValid;
    };

    const handleNextStep = () => {
      if (validateStep1()) {
        setRegisterStep(2); 
      }
    };

    const handleFinalRegister = () => {
      if (birthDate === '' || gender === '' || skinType === '') {
        setStep2Error('กรุณากรอกข้อมูลส่วนตัวให้ครบถ้วน');
        return;
      }
      setStep2Error('');
      console.log('Register Success:', { email, birthDate, gender, skinType });
      onLoginSuccess();
    };

    return (
      <>
        {registerStep === 2 && (
          <button className="modal-back-btn" onClick={() => setRegisterStep(1)}>
            {/* ... (SVG ลูกศรกลับ) ... */}
          </button>
        )}
        
        {registerStep === 1 ? (
          // --- หน้า 1: อีเมลและรหัสผ่าน ---
          <>
            <div className="modal-header">สมัครสมาชิก</div>
            
            <div className="form-group">
              <label className="form-label">อีเมล</label>
              <input type="text" className={`form-input ${emailError ? 'is-invalid' : ''}`} placeholder="กรุณากรอกอีเมล" value={email} onChange={(e) => setEmail(e.target.value)} />
              <p className="form-help-text">{emailError}</p>
            </div>

            <div className="form-group">
              <label className="form-label">รหัสผ่าน</label>
              <div className="form-input-icon">
                <input type={showPass ? "text" : "password"} className={`form-input ${passwordError ? 'is-invalid' : ''}`} placeholder="กรอกรหัสผ่าน (8+ ตัว)" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="button" className="input-icon-btn" onClick={() => setShowPass(!showPass)}>
                  {/* ... (SVG ไอคอนตา) ... */}
                </button>
              </div>
              <p className="form-help-text">{passwordError}</p>
            </div>

            <div className="form-group">
              <label className="form-label">ยืนยันรหัสผ่าน</label>
              <div className="form-input-icon">
                <input type={showConfirmPass ? "text" : "password"} className={`form-input ${confirmError ? 'is-invalid' : ''}`} placeholder="กรอกรหัสผ่านอีกครั้ง" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                <button type="button" className="input-icon-btn" onClick={() => setShowConfirmPass(!showConfirmPass)}>
                  {/* ... (SVG ไอคอนตา) ... */}
                </button>
              </div>
              <p className="form-help-text">{confirmError}</p>
            </div>
            
            <button className="btn-primary" onClick={handleNextStep}>ต่อไป</button>
          </>
        ) : (
          // --- หน้า 2: ข้อมูลส่วนตัว ---
          <>
            <div className="modal-header">ข้อมูลส่วนบุคคลสำหรับระบบแนะนำ</div>
            
            {/* [เปลี่ยน] ใช้ Error Box รวมสำหรับหน้า 2 */}
            <div className={`modal-error ${step2Error ? 'active' : ''}`}>{step2Error}</div>

            <div className="form-group">
              <label className="form-label">วันเกิด</label>
              <input type="date" className="form-date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} required />
              <p className="form-help-text"></p> {/* จองที่ไว้ */}
            </div>

            <div className="form-group">
              <label className="form-label">เพศ</label>
              <select className="form-select" value={gender} onChange={(e) => setGender(e.target.value)} required>
                <option value="" disabled>กรุณาเลือกเพศของคุณ</option>
                <option value="male">ชาย</option>
                <option value="female">หญิง</option>
                <option value="other">ไม่ระบุ</option>
              </select>
              <p className="form-help-text"></p> {/* จองที่ไว้ */}
            </div>

            <div className="form-group">
              <label className="form-label">ประเภทผิว</label>
              <select className="form-select" value={skinType} onChange={(e) => setSkinType(e.target.value)} required>
                <option value="" disabled>กรุณาเลือกประเภทผิวของคุณ</option>
                <option value="oily">ผิวมัน</option>
                <option value="dry">ผิวแห้ง</option>
                <option value="combination">ผิวผสม</option>
                <option value="sensitive">ผิวแพ้ง่าย</option>
                <option value="normal">ผิวธรรมดา</option>
              </select>
              <p className="form-help-text"></p> {/* จองที่ไว้ */}
            </div>
            
            <button className="btn-primary" onClick={handleFinalRegister}>สมัครสมาชิก</button>
          </>
        )}

        <div className="modal-switch">
          มีบัญชีอยู่แล้ว? <span onClick={() => setMode('login')}>เข้าสู่ระบบ</span>
        </div>
      </>
    );
  };

  // --- 3. Component หลัก (เหมือนเดิม) ---
  return (
    <div className="modal-overlay" onClick={allowClose ? onClose : null}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        {allowClose && (
          <button className="modal-close" onClick={onClose}>✕</button>
        )}
        
        {mode === 'login' ? <LoginView /> : <RegisterView />}
        
        <p className="terms-text">
          การใช้งานระบบถือว่ายอมรับ <a>เงื่อนไขการใช้งาน</a> และ <a>นโยบายความเป็นส่วนตัว</a>
        </p>
      </div>
    </div>
  );
}