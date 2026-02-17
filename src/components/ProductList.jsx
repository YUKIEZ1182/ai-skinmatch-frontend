import React, { useState, useRef, useEffect } from 'react';
import '../styles/CustomSelect.css';

const CustomSelect = ({
  options,
  value,
  onChange,
  placeholder,
  disabled = false,
  hasError = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  const selectedOption = options.find((o) => o.value === value);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (disabled && isOpen) setIsOpen(false);
  }, [disabled, isOpen]);

  const handleSelect = (optionValue) => {
    if (disabled) return;
    onChange(optionValue);
    setIsOpen(false);
  };

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen((prev) => !prev);
  };

  return (
    <div className={`custom-select-wrapper ${disabled ? 'is-disabled' : ''}`} ref={wrapperRef}>
      <div
        className={[
          'custom-select-control',
          isOpen ? 'is-open' : '',
          !value ? 'is-placeholder' : '',
          disabled ? 'is-disabled' : '',
          hasError ? 'has-error' : '',
        ].join(' ')}
        onClick={handleToggle}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === 'Enter' || e.key === ' ') handleToggle();
          if (e.key === 'Escape') setIsOpen(false);
        }}
        aria-disabled={disabled}
        aria-invalid={hasError ? 'true' : 'false'}
      >
        <span className="selected-text">{selectedOption ? selectedOption.label : placeholder}</span>

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
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {isOpen && !disabled && (
        <div className="custom-select-menu">
          {options.map((option) => (
            <div
              key={option.value}
              className={`custom-select-option ${value === option.value ? 'is-selected' : ''}`}
              onClick={() => handleSelect(option.value)}
              role="button"
              tabIndex={0}
            >
              {option.label}
              {value === option.value && (
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
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
