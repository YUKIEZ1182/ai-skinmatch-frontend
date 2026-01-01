import React, { useState, useEffect } from 'react';
import '../styles/CategoryMenu.css';

const API_URL = import.meta.env.VITE_DIRECTUS_PUBLIC_URL;

export default function CategoryMenu({ activeCategory, onCategorySelect }) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('access_token');
        
        const headers = {
          'Content-Type': 'application/json'
        };
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(`${API_URL}/items/category?fields=id,name`, {
          method: 'GET',
          headers: headers
        });
        
        const json = await response.json();
        if (json.data) {
          setCategories(json.data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const menuItems = [
    { id: 'new', name: 'ใหม่!', isHighlight: true }, 
    ...categories 
  ];

  return (
    <nav className="category-nav-container">
      <div className="category-scroll">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${item.isHighlight ? 'highlight' : ''} ${activeCategory === item.id ? 'active' : ''}`}
            onClick={() => onCategorySelect(item.id)}
          >
            {item.name}
          </button>
        ))}
      </div>
    </nav>
  );
}