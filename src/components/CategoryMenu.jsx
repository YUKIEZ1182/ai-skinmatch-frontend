import React, { useState, useEffect } from 'react';
import '../styles/CategoryMenu.css';

const API_URL = import.meta.env.VITE_DIRECTUS_PUBLIC_URL;

export default function CategoryMenu({ activeCategory, onCategorySelect }) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        
        const response = await fetch(`${API_URL}/items/category?fields=id,name`, {
          method: 'GET',
          headers: headers
        });
        
        const json = await response.json();
        if (json.data) setCategories(json.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  return (
    <nav className="category-nav-container">
      <div className="category-scroll">
        
        <button
          className={`nav-item ${activeCategory === 'home' ? 'active' : ''}`}
          onClick={() => onCategorySelect('home')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          หน้าหลัก
        </button>

        <div style={{ width: '1px', height: '20px', backgroundColor: '#ddd', margin: '0 10px' }}></div>

        <button
          className={`nav-item highlight ${activeCategory === 'new' ? 'active' : ''}`}
          onClick={() => onCategorySelect('new')}
        >
          ใหม่!
        </button>

        {categories.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeCategory === item.id ? 'active' : ''}`}
            onClick={() => onCategorySelect(item.id)}
          >
            {item.name}
          </button>
        ))}
      </div>
    </nav>
  );
}