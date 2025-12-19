import React, { useState, useRef, useEffect } from 'react';
import '../styles/CustomSelect.css';

// ไอคอนลูกศรลง
const ChevronDownIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
);

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
);

export default function CustomSelect({ options, placeholder, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // ปิดเมื่อคลิกที่อื่น
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={`custom-select-container ${isOpen ? 'open' : ''}`} ref={dropdownRef}>
      
      {/* ตัวกดเปิด Dropdown */}
      <div className="custom-select-trigger" onClick={() => setIsOpen(!isOpen)}>
        <span className={selectedOption ? '' : 'select-placeholder'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        
        <div className="select-arrow">
          <ChevronDownIcon />
        </div>
      </div>

      {/* รายการตัวเลือก */}
      <div className="custom-select-options">
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <div 
              key={option.value} 
              className={`custom-option ${isSelected ? 'selected' : ''}`}
              onClick={() => handleSelect(option.value)}
            >
              <span>{option.label}</span>
              
              {/* ✅ เพิ่มไอคอนติ๊กถูกตรงนี้ */}
              <span className="option-check-icon">
                 <CheckIcon />
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}