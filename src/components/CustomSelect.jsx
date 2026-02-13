import React, { useEffect, useMemo, useRef, useState } from 'react';
import '../styles/CustomSelect.css';

const CustomSelect = ({
  options = [],
  value,
  onChange,
  placeholder = 'กรุณาเลือก',
  disabled = false,

  // ✅ เพิ่มเพื่อทำ error แบบ textfield
  hasError = false,
  errorText = '',
  name,
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  const normalizedValue = value == null ? '' : String(value);

  const selectedOption = useMemo(() => {
    return (options || []).find((o) => String(o?.value) === String(normalizedValue));
  }, [options, normalizedValue]);

  // ปิด Dropdown เมื่อคลิกข้างนอก
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ถ้าถูก disabled แล้วเปิดค้างอยู่ ให้ปิดทันที
  useEffect(() => {
    if (disabled && isOpen) setIsOpen(false);
  }, [disabled, isOpen]);

  const handleSelect = (optionValue) => {
    if (disabled) return;
    if (onChange) onChange(optionValue);
    setIsOpen(false);
  };

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen((prev) => !prev);
  };

  const onKeyDownControl = (e) => {
    if (disabled) return;

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  return (
    <div
      className={`custom-select-wrapper ${disabled ? 'is-disabled' : ''} ${hasError ? 'has-error' : ''}`}
      ref={wrapperRef}
    >
      {/* Controller */}
      <div
        className={[
          'custom-select-control',
          isOpen ? 'is-open' : '',
          !normalizedValue ? 'is-placeholder' : '',
          disabled ? 'is-disabled' : '',
          hasError ? 'input-error' : '',
        ].join(' ')}
        onClick={handleToggle}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={onKeyDownControl}
        aria-disabled={disabled}
        aria-invalid={hasError ? 'true' : 'false'}
        aria-required={required ? 'true' : 'false'}
        data-name={name || undefined}
      >
        {/* ซ่อน input จริง ๆ ไว้ส่งค่าใน form (เผื่อใช้) */}
        {name ? <input type="hidden" name={name} value={normalizedValue} /> : null}

        <span className="selected-text">
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        {/* Arrow */}
        <svg
          className="arrow-icon"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>

      {/* Error text ใต้ช่อง (เหมือน email/password) */}
      {hasError && !!errorText && <span className="error-text">{errorText}</span>}

      {/* Dropdown Menu */}
      {isOpen && !disabled && (
        <div className="custom-select-menu" role="listbox">
          {(options || []).map((option) => {
            const optValue = option?.value;
            const isSelected = String(optValue) === String(normalizedValue);

            return (
              <div
                key={String(optValue)}
                className={`custom-select-option ${isSelected ? 'is-selected' : ''}`}
                onClick={() => handleSelect(optValue)}
                role="option"
                aria-selected={isSelected ? 'true' : 'false'}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelect(optValue);
                  }
                }}
              >
                {option?.label}
                {isSelected && (
                  <svg
                    className="check-icon"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
