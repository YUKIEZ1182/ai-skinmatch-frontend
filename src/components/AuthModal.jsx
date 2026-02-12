import React, { useState, useEffect, forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../styles/AuthModal.css';
import CustomSelect from './CustomSelect';

const API_URL = import.meta.env.VITE_DIRECTUS_PUBLIC_URL;
const MEMBER_ROLE_ID = import.meta.env.VITE_MEMBER_ROLE_ID;

// --- Icons ---
const EyeOpenIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeClosedIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#28a745" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const AlertCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#721c24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ minWidth: '20px' }}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const PasswordRequirement = ({ met, text }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '0.8rem',
      color: met ? '#28a745' : '#888',
      lineHeight: '1.4',
    }}
  >
    {met ? <CheckIcon /> : <div style={{ minWidth: 16, height: 16, borderRadius: '50%', border: '2px solid #ddd' }} />}
    <span>{text}</span>
  </div>
);

// --- Date input for react-datepicker ---
const CustomDateInput = forwardRef(({ value, onClick, placeholder, hasError }, ref) => (
  <div className="date-input-wrapper" onClick={onClick} ref={ref}>
    <input
      className={`auth-input-date ${hasError ? 'input-error' : ''}`}
      value={value}
      onChange={() => {}}
      placeholder={placeholder || 'กรุณาเลือกวันเกิด'}
      readOnly
      aria-invalid={hasError ? 'true' : 'false'}
    />
    <div className="calendar-icon-overlay">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    </div>
  </div>
));

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const navigate = useNavigate();

  const [mode, setMode] = useState('login'); // login | register_step1 | register_step2 | forgot_password
  const [hideRegisterButton, setHideRegisterButton] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [birthDate, setBirthDate] = useState(null);
  const [gender, setGender] = useState('');
  const [skinType, setSkinType] = useState('');

  // ✅ errors รายช่อง
  const [errors, setErrors] = useState({});
  // ✅ error global ไว้ใช้ตอน API fail จริง ๆ
  const [error, setError] = useState('');

  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // ✅ กำหนดวันเกิด: "ห้ามเลือกปีปัจจุบัน" -> maxDate = 31/12 ของปีที่แล้ว
  const maxBirthDate = (() => {
    const now = new Date();
    const lastYear = now.getFullYear() - 1;
    return new Date(lastYear, 11, 31);
  })();

  const showBack = mode === 'register_step1' || mode === 'register_step2';

  useEffect(() => {
    if (isOpen) {
      setError('');
      setErrors({});
      // ไม่รีเซ็ต successMessage ทันที เผื่อโชว์หลังสมัครเสร็จ
    }
  }, [isOpen]);

  // ✅ success banner หายเอง
  useEffect(() => {
    if (!successMessage) return;
    const t = setTimeout(() => setSuccessMessage(''), 1800);
    return () => clearTimeout(t);
  }, [successMessage]);

  if (!isOpen) return null;

  const inputClass = (hasErr) => `auth-input${hasErr ? ' input-error' : ''}`;

  const togglePassword = () => setShowPassword((v) => !v);
  const toggleConfirmPassword = () => setShowConfirmPassword((v) => !v);

  const handleGoToRegister = () => {
    setErrors({});
    setError('');
    setMode('register_step1');
  };

  const handleBack = () => {
    setErrors({});
    setError('');
    if (mode === 'register_step2') setMode('register_step1');
    else setMode('login');
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);

    if (val && !/\S+@\S+\.\S+/.test(val)) {
      setErrors((prev) => ({ ...prev, email: 'รูปแบบอีเมลไม่ถูกต้อง' }));
    } else {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.email;
        return next;
      });
    }
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);

    if (confirmPassword && val !== confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: 'รหัสผ่านไม่ตรงกัน' }));
    } else {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.confirmPassword;
        return next;
      });
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const val = e.target.value;
    setConfirmPassword(val);

    if (val && val !== password) {
      setErrors((prev) => ({ ...prev, confirmPassword: 'รหัสผ่านไม่ตรงกัน' }));
    } else {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.confirmPassword;
        return next;
      });
    }
  };

  // Password complexity
  const isLengthValid = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[\W_]/.test(password);
  const isPasswordComplex = isLengthValid && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;

  const validateRegisterStep1 = () => {
    const newErrors = {};
    let ok = true;

    if (!email.trim()) {
      newErrors.email = 'กรุณากรอกอีเมล';
      ok = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
      ok = false;
    }

    if (!isPasswordComplex) {
      newErrors.password = 'กรุณาตั้งรหัสผ่านให้ครบตามเงื่อนไข';
      ok = false;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'กรุณายืนยันรหัสผ่าน';
      ok = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'รหัสผ่านไม่ตรงกัน';
      ok = false;
    }

    setErrors(newErrors);
    return ok;
  };

  // ✅ validate step2 ให้แดงที่ช่อง (ไม่ขึ้นบล็อกแดงรวม)
  const validateRegisterStep2 = () => {
    const newErrors = {};
    let ok = true;

    if (!birthDate) {
      newErrors.birthDate = 'กรุณาเลือกวันเกิด';
      ok = false;
    } else {
      const year = birthDate.getFullYear();
      const thisYear = new Date().getFullYear();
      if (year === thisYear) {
        newErrors.birthDate = 'วันเกิดต้องไม่เป็นปีปัจจุบัน';
        ok = false;
      }
      if (birthDate > maxBirthDate) {
        newErrors.birthDate = 'วันเกิดต้องไม่เป็นปีปัจจุบัน';
        ok = false;
      }
    }

    if (!gender) {
      newErrors.gender = 'กรุณาเลือกเพศ';
      ok = false;
    }

    if (!skinType) {
      newErrors.skinType = 'กรุณาเลือกประเภทผิว';
      ok = false;
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return ok;
  };

  // ✅ เช็คอีเมลซ้ำตั้งแต่ step1 (ถ้า API อนุญาตให้อ่าน users)
  const checkEmailExists = async (emailToCheck) => {
    try {
      const url = `${API_URL}/users?fields=id&filter[email][_eq]=${encodeURIComponent(emailToCheck)}`;
      const res = await fetch(url, { method: 'GET' });

      if (res.status === 401 || res.status === 403) {
        return { canCheck: false, exists: false };
      }
      if (!res.ok) return { canCheck: false, exists: false };

      const json = await res.json();
      const exists = Array.isArray(json?.data) && json.data.length > 0;
      return { canCheck: true, exists };
    } catch {
      return { canCheck: false, exists: false };
    }
  };

  const handleNextStep = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateRegisterStep1()) return;

    setIsLoading(true);
    try {
      const { canCheck, exists } = await checkEmailExists(email.trim());
      if (canCheck && exists) {
        setErrors((prev) => ({ ...prev, email: 'อีเมลนี้ถูกใช้งานแล้ว' }));
        return;
      }

      setErrors({});
      setMode('register_step2');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      let url = `${API_URL}/auth/login`;
      let bodyData = {};

      if (mode === 'login') {
        if (!email || !password) throw new Error('กรุณากรอกอีเมลและรหัสผ่าน');
        bodyData = { email, password };
      } else if (mode === 'register_step2') {
        if (!validateRegisterStep2()) return;

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
          role: MEMBER_ROLE_ID,
        };
      } else {
        return;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });

      const contentType = response.headers.get('content-type');
      let data = {};
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error('Non-JSON Error:', text);
        throw new Error('เซิร์ฟเวอร์ตอบกลับผิดพลาด (โปรดลองใหม่อีกครั้ง)');
      }

      if (response.ok) {
        if (mode === 'login') {
          const accessToken = data?.data?.access_token;

          if (MEMBER_ROLE_ID && accessToken) {
            const meResponse = await fetch(`${API_URL}/users/me?fields=role`, {
              headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (meResponse.ok) {
              const meData = await meResponse.json();
              if (meData?.data?.role !== MEMBER_ROLE_ID) throw new Error('บัญชีนี้ไม่มีสิทธิ์เข้าใช้งาน');
            }
          }

          localStorage.setItem('access_token', data?.data?.access_token);
          localStorage.setItem('refresh_token', data?.data?.refresh_token);

          if (onLoginSuccess) onLoginSuccess();
          if (onClose) onClose();
          navigate('/');
        } else {
          setPassword('');
          setConfirmPassword('');
          setBirthDate(null);
          setGender('');
          setSkinType('');
          setErrors({});
          setMode('login');
          setHideRegisterButton(true);
          setSuccessMessage('สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ');
        }
      } else {
        let errorMsg = 'ดำเนินการไม่สำเร็จ';
        if (data?.errors?.length > 0) {
          const code = data.errors[0]?.extensions?.code;
          const msg = data.errors[0]?.message;

          if (code === 'RECORD_NOT_UNIQUE') {
            errorMsg = 'อีเมลนี้ถูกใช้งานแล้ว';
            if (mode === 'register_step2') {
              setMode('register_step1');
              setErrors((prev) => ({ ...prev, email: 'อีเมลนี้ถูกใช้งานแล้ว' }));
              return;
            }
          } else if (code === 'INVALID_CREDENTIALS') errorMsg = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
          else if (msg) errorMsg = msg;
        }
        setError(errorMsg);
      }
    } catch (err) {
      console.error('Critical Error:', err);
      setError(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setIsLoading(false);
    }
  };

  const genderOptions = [
    { value: 'male', label: 'ชาย' },
    { value: 'female', label: 'หญิง' },
  ];

  const skinTypeOptions = [
    { value: 'oily', label: 'ผิวมัน' },
    { value: 'combination', label: 'ผิวผสม' },
    { value: 'dry', label: 'ผิวแห้ง' },
    { value: 'sensitive', label: 'ผิวแพ้ง่าย' },
  ];

  // ✅ title ตามโหมด (ใช้กับ header)
  const getHeaderTitle = () => {
    if (mode === 'login') return hideRegisterButton ? 'เข้าสู่ระบบ' : 'กรุณาสมัครสมาชิกหรือเข้าสู่ระบบก่อนดำเนินการต่อ';
    if (mode === 'register_step1') return 'สมัครสมาชิก';
    if (mode === 'register_step2') return 'ข้อมูลส่วนบุคคล';
    return '';
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* ✅ HEADER ตาม CSS งานปัจจุบัน: Back | Title | Close */}
        <div className="auth-modal-header">
          <div className="auth-modal-header-slot">
            {showBack ? (
              <button className="modal-back-icon" onClick={handleBack} type="button" aria-label="ย้อนกลับ">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
            ) : null}
          </div>

          <div className="auth-modal-header-title">
            <h2 className="auth-title">{getHeaderTitle()}</h2>
            {mode === 'login' && successMessage ? <div className="auth-header-banner">{successMessage}</div> : null}
          </div>

          <div className="auth-modal-header-slot">
            <button className="modal-close-icon" onClick={onClose} type="button" aria-label="ปิด">
              ×
            </button>
          </div>
        </div>

        {/* ✅ global error */}
        {error && (
          <div
            style={{
              background: '#f8d7da',
              color: '#721c24',
              padding: '12px',
              borderRadius: '14px',
              marginBottom: '20px',
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
            }}
          >
            <AlertCircleIcon />
            <span>{error}</span>
          </div>
        )}

        {/* --- LOGIN --- */}
        {mode === 'login' && (
          <form noValidate onSubmit={handleFinalSubmit}>
            <div className="form-group">
              <label className="form-label">อีเมล</label>
              <input
                type="text"
                className={inputClass(!!errors.email)}
                placeholder="name@example.com"
                value={email}
                onChange={handleEmailChange}
                aria-invalid={!!errors.email}
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">รหัสผ่าน</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={inputClass(!!errors.password)}
                  style={{ paddingRight: '50px' }}
                  placeholder="กรอกรหัสผ่านของคุณ"
                  value={password}
                  onChange={handlePasswordChange}
                  aria-invalid={!!errors.password}
                />
                <button type="button" className="password-toggle-btn" onClick={togglePassword} aria-label="แสดง/ซ่อนรหัสผ่าน">
                  {showPassword ? <EyeOpenIcon /> : <EyeClosedIcon />}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={isLoading}>
              {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>

            {!hideRegisterButton && (
              <button type="button" className="auth-outline-btn" onClick={handleGoToRegister}>
                สมัครสมาชิกใหม่
              </button>
            )}
          </form>
        )}

        {/* --- REGISTER STEP 1 --- */}
        {mode === 'register_step1' && (
          <form noValidate onSubmit={handleNextStep}>
            <div className="form-group">
              <label className="form-label">
                อีเมล <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="text"
                className={inputClass(!!errors.email)}
                placeholder="name@example.com"
                value={email}
                onChange={handleEmailChange}
                aria-invalid={!!errors.email}
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                รหัสผ่าน <span style={{ color: 'red' }}>*</span>
              </label>

              <div className="password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="กรุณากรอกรหัสผ่าน"
                  className={inputClass(!!errors.password)}
                  style={{ paddingRight: '50px' }}
                  value={password}
                  onChange={handlePasswordChange}
                  aria-invalid={!!errors.password}
                />
                <button type="button" className="password-toggle-btn" onClick={togglePassword} aria-label="แสดง/ซ่อนรหัสผ่าน">
                  {showPassword ? <EyeOpenIcon /> : <EyeClosedIcon />}
                </button>
              </div>

              {password.length > 0 && (
                <div style={{ marginTop: '10px', background: '#F5F7FA', padding: '12px', borderRadius: '14px' }}>
                  <PasswordRequirement
                    met={isPasswordComplex}
                    text="ต้องมีตัวพิมพ์ใหญ่, เล็ก, ตัวเลข และอักขระพิเศษ ผสมกัน (8 ตัวอักษรขึ้นไป)"
                  />
                </div>
              )}

              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                ยืนยันรหัสผ่าน <span style={{ color: 'red' }}>*</span>
              </label>

              <div className="password-wrapper">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="กรุณากรอกรหัสผ่าน"
                  className={inputClass(!!errors.confirmPassword)}
                  style={{ paddingRight: '50px' }}
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  aria-invalid={!!errors.confirmPassword}
                />
                <button type="button" className="password-toggle-btn" onClick={toggleConfirmPassword} aria-label="แสดง/ซ่อนยืนยันรหัสผ่าน">
                  {showConfirmPassword ? <EyeOpenIcon /> : <EyeClosedIcon />}
                </button>
              </div>

              {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
            </div>

            <button type="submit" className="auth-submit-btn" disabled={isLoading}>
              {isLoading ? 'กำลังตรวจสอบ...' : 'ถัดไป'}
            </button>
          </form>
        )}

        {/* --- REGISTER STEP 2 --- */}
        {mode === 'register_step2' && (
          <form noValidate onSubmit={handleFinalSubmit}>
            <div className="form-group">
              <label className="form-label">
                วันเกิด <span style={{ color: 'red' }}>*</span>
              </label>

              <DatePicker
                selected={birthDate}
                onChange={(date) => {
                  setBirthDate(date);
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.birthDate;
                    return next;
                  });
                }}
                dateFormat="dd/MM/yyyy"
                placeholderText="กรุณาเลือกวันเกิด"
                customInput={<CustomDateInput hasError={!!errors.birthDate} />}
                showYearDropdown
                yearDropdownItemNumber={100}
                maxDate={maxBirthDate}
              />

              {errors.birthDate && <span className="error-text">{errors.birthDate}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                เพศ <span style={{ color: 'red' }}>*</span>
              </label>

              <CustomSelect
                options={genderOptions}
                placeholder="กรุณาเลือกเพศของคุณ"
                value={gender}
                onChange={(val) => {
                  setGender(val);
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.gender;
                    return next;
                  });
                }}
                hasError={!!errors.gender}
              />

              {errors.gender && <span className="error-text">{errors.gender}</span>}
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">
                  ประเภทผิว <span style={{ color: 'red' }}>*</span>
                </label>

                <a href="https://choicechecker.com/quiz/testing?id=1" target="_blank" rel="noreferrer" style={{ fontSize: '13px' }} className="legal-link">
                  ไม่แน่ใจ? ทำแบบทดสอบ
                </a>
              </div>

              <CustomSelect
                options={skinTypeOptions}
                placeholder="กรุณาเลือกสภาพผิวของคุณ"
                value={skinType}
                onChange={(val) => {
                  setSkinType(val);
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.skinType;
                    return next;
                  });
                }}
                hasError={!!errors.skinType}
              />

              {errors.skinType && <span className="error-text">{errors.skinType}</span>}
            </div>

            <button type="submit" className="auth-submit-btn" disabled={isLoading}>
              {isLoading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
            </button>
          </form>
        )}

        <div className="auth-legal-text">
          การใช้งานระบบถือว่ายอมรับ{' '}
          <a href="#" className="legal-link">
            เงื่อนไขการใช้งาน
          </a>{' '}
          และ{' '}
          <a href="#" className="legal-link">
            นโยบายความเป็นส่วนตัว
          </a>
        </div>
      </div>
    </div>
  );
}
