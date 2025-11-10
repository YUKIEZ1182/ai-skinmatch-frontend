import React, { useState } from "react";
import { validateEmail, validatePassword, validateConfirmPassword } from "./Validation.js";
import "../components/styles/LoginModal.css";

function Register({ onSwitchToLogin, onClose, onSwitchToPersonalInfo }) {

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState({
    isValid: true, meetsLength: false, hasUppercase: false,
    hasLowercase: false, hasNumber: false, hasSpecialChar: false, hasOnlyAllowedChars: true
  });
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);
  const togglePasswordVisibility = () => { setIsPasswordVisible(!isPasswordVisible); };
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setEmailError(validateEmail(value));
  };
  const handleEmailBlur = () => { setEmailError(validateEmail(email)); };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    const result = validatePassword(value);
    setPasswordError(result);
    if (confirmPasswordError) {
        setConfirmPasswordError(validateConfirmPassword(value, confirmPassword));
    }
  };
  const handlePasswordBlur = () => { setPasswordError(validatePassword(password)); };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    setConfirmPasswordError(validateConfirmPassword(password, value));
  };
  const handleConfirmPasswordBlur = () => { setConfirmPasswordError(validateConfirmPassword(password, confirmPassword)); };
  useEffect(() => {
    const isEmailValid = validateEmail(email) === '';
    const currentPasswordValidation = validatePassword(password);
    const isPasswordValid = currentPasswordValidation.isValid;
    const isConfirmPasswordValid = validateConfirmPassword(password, confirmPassword) === '';

    setIsFormValid(isEmailValid && isPasswordValid && isConfirmPasswordValid);

  }, [email, password, confirmPassword]);
  const handleRegister = () => {
    const emailValidationResult = validateEmail(email);
    const passwordValidationResult = validatePassword(password);
    const confirmPasswordValidationResult = validateConfirmPassword(password, confirmPassword);
    setEmailError(emailValidationResult);
    setPasswordError(passwordValidationResult);
    setConfirmPasswordError(confirmPasswordValidationResult);

    if (isFormValid) { 
      console.log('Register Step 1 สำเร็จ!', { email, password });
      onSwitchToPersonalInfo();
    } else {
       console.warn('Validation failed on submit');
    }
  };
  return (
    <>
      <h2>สมัครสมาชิก</h2>
      <form>
        <div className="form-group">
          <label htmlFor="register-email">อีเมล</label>
          <input
            type="email"
            id="register-email"
            placeholder="กรุณากรอกอีเมล"
            value={email}
            onChange={handleEmailChange}
            onBlur={handleEmailBlur}
            className={emailError ? 'input-error' : ''}
          />
          {emailError && <p className="help-text error-text">{emailError}</p>}
        </div> 
        <div className="form-group">
          <label htmlFor="register-password">รหัสผ่าน</label>
          <div className="password-input-wrapper">
            <input
              type={isPasswordVisible ? 'text' : 'password'}
              id="register-password"
              placeholder="กรุณากรอกรหัสผ่าน"
              value={password}
              onChange={handlePasswordChange}
              onBlur={handlePasswordBlur}
              className={!passwordError.isValid ? 'input-error' : ''}
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={togglePasswordVisibility}
            >
              {isPasswordVisible ? (
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
              )}
            </button>
          </div>
          {(password || !passwordError.isValid) && (
            <ul className="password-checklist help-text">
               <li className={passwordError.meetsLength ? 'valid-text' : 'error-text'}>
                 {passwordError.meetsLength ? ( <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> ) : ( <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> )}
                 <span>อย่างน้อย 8 ตัวอักษร</span>
               </li>
               <li className={passwordError.hasUppercase ? 'valid-text' : 'error-text'}>
                  {passwordError.hasUppercase ? ( <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> ) : ( <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> )}
                  <span>มีตัวพิมพ์ใหญ่ (A-Z)</span>
               </li>
               <li className={passwordError.hasLowercase ? 'valid-text' : 'error-text'}>
                  {passwordError.hasLowercase ? ( <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> ) : ( <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> )}
                  <span>มีตัวพิมพ์เล็ก (a-z)</span>
               </li>
               <li className={passwordError.hasNumber ? 'valid-text' : 'error-text'}>
                  {passwordError.hasNumber ? ( <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> ) : ( <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> )}
                  <span>มีตัวเลข (0-9)</span>
               </li>
               <li className={passwordError.hasSpecialChar ? 'valid-text' : 'error-text'}>
                  {passwordError.hasSpecialChar ? ( <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> ) : ( <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> )}
                  <span>มีอักขระพิเศษ (!@#...)</span>
               </li>
            </ul>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="confirm-password">ยืนยันรหัสผ่าน</label>
          <div className="password-input-wrapper">
            <input
              type={isPasswordVisible ? 'text' : 'password'}
              id="confirm-password"
              placeholder="กรุณายืนยันรหัสผ่าน"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              onBlur={handleConfirmPasswordBlur}
              className={confirmPasswordError ? 'input-error' : ''}
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={togglePasswordVisibility}
            >
              {isPasswordVisible ? ( 
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
              )}
            </button>
          </div>
          {confirmPasswordError && <p className="help-text error-text">{confirmPasswordError}</p>}
        </div>
        <button type="button" className="btn-primary" onClick={handleRegister} disabled={!isFormValid} >ต่อไป</button>
      </form>

      <p className="switch-view-text">
        มีบัญชีอยู่แล้ว?
        <button type="button" className="switch-view-btn" onClick={onSwitchToLogin}>
          เข้าสู่ระบบ
        </button>
      </p>
      <p className="terms-text">
        การใช้งานระบบสมาชิกถือว่าคุณยอมรับ
        <a href="#">เงื่อนไขการใช้งาน</a> และ <a href="#">นโยบายความเป็นส่วนตัว</a>
      </p>
    </>
  );
} 

export default Register;
