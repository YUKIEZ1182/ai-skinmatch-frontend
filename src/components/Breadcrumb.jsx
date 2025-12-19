import React from 'react';
import '../styles/Breadcrumb.css'; // เรียกใช้ CSS

const Breadcrumb = ({ items }) => {
  // ถ้าไม่มีข้อมูล ไม่ต้องแสดงอะไร
  if (!items || items.length === 0) return null;

  return (
    <nav className="breadcrumb-container">
      {items.map((item, index) => (
        <span key={index} className="breadcrumb-item">
          {/* ถ้าเป็นลิงก์ให้กดได้ */}
          {item.isLink ? (
            <span onClick={item.onClick} className="breadcrumb-link">
              {item.label}
            </span>
          ) : (
            // ถ้าเป็นหน้าปัจจุบัน (ตัวหนังสือธรรมดา)
            <span className="breadcrumb-current">
              {item.label}
            </span>
          )}
          
          {/* เครื่องหมายคั่น (/) จะไม่แสดงตัวสุดท้าย */}
          {index < items.length - 1 && (
            <span className="breadcrumb-separator">/</span>
          )}
        </span>
      ))}
    </nav>
  );
};

export default Breadcrumb;
