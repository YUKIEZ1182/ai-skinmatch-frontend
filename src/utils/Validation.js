export const validateEmail = (value) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // รูปแบบอีเมลมาตรฐาน
  if (!value) return "กรุณากรอกอีเมล";
  if (!emailRegex.test(value)) return "รูปแบบอีเมลไม่ถูกต้อง";
  return "";
};

export const validatePassword = (value) => {
  const minLength = 8;
  const requiresUppercase = true;
  const requiresLowercase = true;
  const requiresNumber = true;
  const requiresSpecialChar = true;
  const allowedCharsRegex = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/;
  const uppercaseRegex = /[A-Z]/;
  const lowercaseRegex = /[a-z]/;
  const numberRegex = /[0-9]/;
  const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
  const result = {
    isValid: true,
    meetsLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
    hasOnlyAllowedChars: true,
  };

  if (!value) {
    result.isValid = false;
    return result;
  }

  if (!allowedCharsRegex.test(value)) {
    result.isValid = false;
    result.hasOnlyAllowedChars = false;
  } else {
    result.hasOnlyAllowedChars = true;
  }

  result.meetsLength = value.length >= minLength;
  if (!result.meetsLength) result.isValid = false;

  result.hasUppercase = !requiresUppercase || uppercaseRegex.test(value);
  if (requiresUppercase && !result.hasUppercase) result.isValid = false;

  result.hasLowercase = !requiresLowercase || lowercaseRegex.test(value);
  if (requiresLowercase && !result.hasLowercase) result.isValid = false;

  result.hasNumber = !requiresNumber || numberRegex.test(value);
  if (requiresNumber && !result.hasNumber) result.isValid = false;

  result.hasSpecialChar = !requiresSpecialChar || specialCharRegex.test(value);
  if (requiresSpecialChar && !result.hasSpecialChar) result.isValid = false;

  if (!result.hasOnlyAllowedChars) result.isValid = false;

  return result;
};

export const validateConfirmPassword = (pass, confirmPass) => {
  if (!confirmPass) return 'กรุณายืนยันรหัสผ่าน';
  if (pass !== confirmPass) return 'รหัสผ่านไม่ตรงกัน';
  return '';
};