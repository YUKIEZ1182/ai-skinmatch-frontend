import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/CategoryMenu.css';

const categories = [
  { id: 'new', label: 'ใหม่!', isHighlight: true },
  { id: 'makeup', label: 'เมคอัพ' },
  { id: 'skincare', label: 'สกินแคร์' },
  { id: 'haircare', label: 'ดูแลเส้นผม' },
  { id: 'tools', label: 'อุปกรณ์เสริมสวย' },
  { id: 'body', label: 'ดูแลผิวกาย' },
  { id: 'perfume', label: 'น้ำหอม' },
  { id: 'queen', label: 'ควีนบิวตี้' },
  { id: 'gift', label: 'ของขวัญ' },
  { id: 'brand', label: 'แบรนด์' },
  { id: 'sale', label: 'สินค้าลดราคา' },
];

export default function CategoryMenu({ activeCategory, onCategorySelect }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = (catId) => {
    if (location.pathname !== '/') {
      navigate('/');
    }
    if (onCategorySelect) {
      onCategorySelect(catId);
    }
  };

  return (
    <nav className="category-nav-container">
      <div className="category-scroll">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`nav-item ${cat.isHighlight ? 'highlight' : ''} ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => handleClick(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </nav>
  );
}