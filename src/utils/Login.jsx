import React, { useState } from "react";
import { validateEmail } from "./Validation.js";
import "../components/styles/LoginModal.css";
const allowedPasswordCharsRegex = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/;
const validateSimplePassword = (value) => {
  if (!value) {
    return 'กรุณากรอกรหัสผ่าน';
  }

  if (value.length < 8 || !allowedPasswordCharsRegex.test(value)) {
    return 'รหัสผ่านไม่ถูกต้อง';
  }
  return '';
};

function Login({ onSwitchToRegister, onClose, onLoginSuccess }) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    if (emailError) setEmailError(validateEmail(newEmail));
  };
  const handleEmailBlur = () => {
    setEmailError(validateEmail(email));
  };

  const handlePasswordChange = (e) => {
    const newValue = e.target.value;

    if (allowedPasswordCharsRegex.test(newValue) || newValue === '') {
      setPassword(newValue);
      if (passwordError) {
        setPasswordError(validateSimplePassword(newValue));
      }
    }
  };

  const handlePasswordBlur = () => {
    setPasswordError(validateSimplePassword(password));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailValidationResult = validateEmail(email);
    const passwordValidationResultStr = validateSimplePassword(password);

    setEmailError(emailValidationResult);
    setPasswordError(passwordValidationResultStr);

    console.log('--- LOG: Email Validation Result:', `"${emailValidationResult}"`);
    console.log('--- LOG: Password Validation Result (Simple):', `"${passwordValidationResultStr}"`);

    if (emailValidationResult === '' && passwordValidationResultStr === '') {
      setIsLoading(true);
      console.log('--- LOG: Validation Passed. Starting API Simulation...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      const loginSuccess = true;
      if (loginSuccess) {
        console.log('--- LOG: Login Successful. Calling onClose().');
        onLoginSuccess();
      } else {
        setEmailError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      }
      setIsLoading(false);
    } else {
        console.log('--- LOG: Validation Failed. onClose() was NOT called.');
    }
  };

  return (
    <>
      <h2>กรุณาสมัครสมาชิกหรือเข้าสู่ระบบก่อนดำเนินการต่อ</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">อีเมล</label>
          <input
            type="email"
            id="email"
            placeholder="กรุณากรอกอีเมล"
            value={email}
            onChange={handleEmailChange}
            onBlur={handleEmailBlur}
            className={emailError ? 'input-error' : ''}
            disabled={isLoading}
          />
          {emailError && <p className="help-text error-text">{emailError}</p>}
        </div>
        <div className="form-group">
          <label htmlFor="password">รหัสผ่าน</label>
          <div className="password-input-wrapper">
            <input
              type={isPasswordVisible ? 'text' : 'password'}
              id="password"
              placeholder="กรุณากรอกรหัสผ่าน"
              value={password}
              onChange={handlePasswordChange}
              onBlur={handlePasswordBlur}
              className={passwordError ? 'input-error' : ''}
              disabled={isLoading}
            />
            <button type="button" className="password-toggle-btn" onClick={togglePasswordVisibility} disabled={isLoading}>
              {isPasswordVisible ? (
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
              )}
            </button>
          </div>
          {passwordError && <p className="help-text error-text">{passwordError}</p>}
          <a href="#" className="forgot-password">ลืมรหัสผ่าน</a>
        </div>
        <button type="submit" className="btn-primary" disabled={isLoading}>
          {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
        </button>

        <button type="button" className="btn-secondary" onClick={onSwitchToRegister} disabled={isLoading}>
          สมัครสมาชิก
        </button>
      </form>
      <p className="terms-text">
        การใช้งานระบบสมาชิกถือว่าคุณยอมรับ
        <a href="#">เงื่อนไขการใช้งาน</a> และ <a href="#">นโยบายความเป็นส่วนตัว</a>
      </p>
    </>
  );
}

export default Login;