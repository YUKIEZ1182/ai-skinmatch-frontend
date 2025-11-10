import React, { useState } from "react";
import "../pages/styles/AccountPage.css";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { th } from "date-fns/locale";
import { format, parseISO, isValid as isValidDate } from "date-fns";

const CalendarIcon = () => (
  <span className="calendar-icon">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  </span>
);

const initialUserData = {
  email: 'guess@gmail.com',
  dob: '2003-09-01',
  gender: 'female',
  skinType: 'oily'
};

function AccountPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState(initialUserData);
  const [newPassword, setNewPassword] = useState('');

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (isEditing) { 
      setUserData(initialUserData);
      setNewPassword('');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleMUIDateChange = (newDate) => {
    try {
      if (newDate && isValidDate(newDate)) {
        const formattedDate = format(newDate, 'yyyy-MM-dd');
        setUserData(prevData => ({ ...prevData, dob: formattedDate }));
      } else {
         setUserData(prevData => ({ ...prevData, dob: null }));
      }
    } catch (error) {
        console.error("Error formatting date:", error);
         setUserData(prevData => ({ ...prevData, dob: null }));
    }
  };

  const handleSave = () => {
    console.log("Saving user data (excluding password):", {
        email: userData.email, dob: userData.dob,
        gender: userData.gender, skinType: userData.skinType,
    });
    if(newPassword){ console.log("New password would be saved"); }
    alert("ข้อมูลถูกบันทึก (จำลอง)");
    setIsEditing(false);
    setNewPassword('');
  };

  let dobDateObject = null;
  if (userData.dob && typeof userData.dob === 'string') {
      try {
          dobDateObject = parseISO(userData.dob);
          if (!isValidDate(dobDateObject)) dobDateObject = null;
      } catch (error) { dobDateObject = null; }
  } else if (userData.dob instanceof Date && isValidDate(userData.dob)) {
      dobDateObject = userData.dob;
  }


  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={th}>
      <div className="account-page-container">
        <div className="account-header">
          <h1>บัญชีของฉัน</h1>
          <button className="edit-button" onClick={handleEditToggle}>
            <span>{isEditing ? 'ยกเลิก' : 'แก้ไขข้อมูล'}</span>
          </button>
        </div>

        <div className="account-info-grid">
          <label htmlFor="email">อีเมล</label>
          <div className="account-field-value">
            <input
              type="email" id="email" name="email"
              value={userData.email}
              readOnly={true} disabled={true}
              className="account-input-style"
            />
          </div>

          <label htmlFor="password">รหัสผ่าน</label>
          <div className={`account-field-value ${isEditing ? 'editing' : ''}`}>
            <input
              type="password"
              id="password"
              name="newPassword"
              value={isEditing ? newPassword : '********'}
              placeholder={isEditing ? "กรอกรหัสผ่านใหม่ (ถ้าต้องการเปลี่ยน)" : ""}
              readOnly={!isEditing}
              onChange={isEditing ? (e) => setNewPassword(e.target.value) : undefined}
              className="account-input-style"
            />
          </div>

          <label htmlFor="dob">วันเกิด</label>
          <div className={`account-field-value date-field ${isEditing ? 'editing' : ''}`}>
            {isEditing ? (
              <DatePicker
                value={dobDateObject}
                onChange={handleMUIDateChange}
                inputFormat="dd/MM/yyyy"
                sx={{ width: '100%' }}
                renderInput={(params) => (
                   <input
                     ref={params.inputRef}
                     {...params.inputProps}
                     className="account-input-style datepicker-input"
                   />
                )}
                 components={{ OpenPickerIcon: CalendarIcon }}
              />
            ) : (
              <input
                type="text" id="dob" name="dob"
                value={dobDateObject ? format(dobDateObject, 'dd/MM/yyyy') : ''}
                readOnly disabled
                className="account-input-style"
              />
            )}
             {!isEditing && <CalendarIcon />}
          </div>

          <label htmlFor="gender">เพศ</label>
          <div className={`account-field-value ${isEditing ? 'editing' : ''}`}>
            <select id="gender" name="gender" value={userData.gender} onChange={handleChange} disabled={!isEditing} className="account-input-style">
              <option value="female">หญิง</option>
              <option value="male">ชาย</option>
            </select>
          </div>

          <label htmlFor="skinType">ประเภทผิว</label>
          <div className={`account-field-value ${isEditing ? 'editing' : ''}`}>
            <select id="skinType" name="skinType" value={userData.skinType} onChange={handleChange} disabled={!isEditing} className="account-input-style">
              <option value="oily">ผิวมัน</option>
              <option value="dry">ผิวแห้ง</option>
              <option value="combination">ผิวผสม</option>
              <option value="sensitive">ผิวแพ้ง่าย</option>
            </select>
          </div>
        </div>

        {isEditing && (
          <div className="save-button-container">
            <button className="save-button" onClick={handleSave}>
              บันทึกการเปลี่ยนแปลง
            </button>
          </div>
        )}
      </div>
    </LocalizationProvider>
  );
}

export default AccountPage;
