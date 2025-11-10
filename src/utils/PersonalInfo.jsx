import React, { useState } from "react";
import "../components/styles/LoginModal.css";

function PersonalInfo({ onSwitchBackToRegister, onClose, showNotification }) {

  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [skinType, setSkinType] = useState('');
  const [dobError, setDobError] = useState('');
  const [genderError, setGenderError] = useState('');
  const [skinTypeError, setSkinTypeError] = useState('');
  const handleFinalRegister = () => {
    setDobError('');
    setGenderError('');
    setSkinTypeError('');
    let isValid = true;

    if (!dob) {
      setDobError('กรุณาเลือกวันเกิด');
      isValid = false;
    }
    if (!gender) {
      setGenderError('กรุณาเลือกเพศ');
      isValid = false;
    }
    if (!skinType) {
      setSkinTypeError('กรุณาเลือกประเภทผิว');
      isValid = false;
    }

    if (isValid) {
      console.log('ข้อมูลส่วนตัว:', { dob, gender, skinType });
      showNotification('สมัครสมาชิกสำเร็จ!', 'success');
      setTimeout(() => {
      onClose();
      }, 1000);
    } else {
      console.warn('Personal Info Validation Failed');
    }
  };

  return (
    <>
      <button
        type="button"
        className="back-modal-btn"
        onClick={onSwitchBackToRegister}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>

      <h2>ข้อมูลส่วนตัวสำหรับรับคำแนะนำ</h2>

      <form>
        <div className="form-group">
          <label htmlFor="dob">วันเกิด</label>
          <input
            type="date"
            id="dob"
            value={dob}
            onChange={(e) => {
              setDob(e.target.value);
              if (dobError) setDobError('');
            }}
            className={dobError ? 'input-error' : ''}
          />
          {dobError && <p className="help-text error-text">{dobError}</p>}
        </div>
        <div className="form-group">
          <label htmlFor="gender">เพศ</label>
          <select
            id="gender"
            value={gender}
            onChange={(e) => {
              setGender(e.target.value);
              if (genderError) setGenderError('');
            }}
            className={genderError ? 'input-error' : ''}
            required
          >
            <option value="" disabled hidden>กรุณาเลือกเพศของคุณ</option>
            <option value="male">ชาย</option>
            <option value="female">หญิง</option>
            <option value="other">อื่นๆ</option>
            <option value="not_specified">ไม่ระบุ</option>
          </select>
          {genderError && <p className="help-text error-text">{genderError}</p>}
        </div>
        <div className="form-group">
          <label htmlFor="skinType">ประเภทผิว</label>
          <select
            id="skinType"
            value={skinType}
            onChange={(e) => {
              setSkinType(e.target.value);
              if (skinTypeError) setSkinTypeError('');
            }}
            className={skinTypeError ? 'input-error' : ''}
            required
          >
            <option value="" disabled hidden>กรุณาเลือกประเภทผิวของคุณ</option>
            <option value="dry">ผิวแห้ง</option>
            <option value="oily">ผิวมัน</option>
            <option value="combination">ผิวผสม</option>
            <option value="sensitive">ผิวแพ้ง่าย</option>
          </select>
           {skinTypeError && <p className="help-text error-text">{skinTypeError}</p>}
        </div>
        <button type="button" className="btn-primary" onClick={handleFinalRegister}>
          สมัครสมาชิก
        </button>
      </form>
      <p className="terms-text" style={{ marginTop: '20px' }}>
        การใช้งานระบบสมาชิกถือว่าคุณยอมรับ
        <a href="#">เงื่อนไขการใช้งาน</a> และ <a href="#">นโยบายความเป็นส่วนตัว</a>
      </p>
    </>
  );
}

export default PersonalInfo;
