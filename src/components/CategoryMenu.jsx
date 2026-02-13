import React, { useEffect, useState, useCallback } from 'react';
import '../styles/CategoryMenu.css';

const API_URL = import.meta.env.VITE_DIRECTUS_PUBLIC_URL;
const CATEGORY_CACHE_KEY = 'category_cache_v1';

export default function CategoryMenu({ activeCategory, onCategorySelect }) {
  const [categories, setCategories] = useState(() => {
    // ✅ โหลดจาก cache ก่อน กัน “หายวูบ”
    try {
      const raw = localStorage.getItem(CATEGORY_CACHE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const fetchCategories = useCallback(async (signal) => {
    try {
      const token = localStorage.getItem('access_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const response = await fetch(
        `${API_URL}/items/category?fields=id,name&limit=200&sort=name`,
        { method: 'GET', headers, signal }
      );

      if (!response.ok) throw new Error(`Fetch categories failed: ${response.status}`);

      const json = await response.json();
      const list = Array.isArray(json?.data) ? json.data : [];

      // ✅ normalize + กัน id ชน type
      const normalized = list
        .filter((x) => x && x.id != null)
        .map((x) => ({
          id: String(x.id),
          name: String(x.name ?? '').trim(),
        }))
        .filter((x) => x.name.length > 0);

      setCategories(normalized);

      // ✅ cache
      try {
        localStorage.setItem(CATEGORY_CACHE_KEY, JSON.stringify(normalized));
      } catch {
        // ignore cache errors
      }
    } catch (error) {
      if (error?.name === 'AbortError') return;
      console.error('Error fetching categories:', error);

      // ✅ ถ้า fetch พัง อย่างน้อยยังมี cache ที่เคยโหลดไว้
      // ไม่ต้อง setCategories([]) เพราะจะทำให้ “หาย”
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchCategories(controller.signal);

    // ✅ เวลา user สลับแท็บแล้วกลับมา ให้ลองรีเฟชอีกรอบ
    const onFocus = () => {
      const c = new AbortController();
      fetchCategories(c.signal);
    };
    window.addEventListener('focus', onFocus);

    return () => {
      controller.abort();
      window.removeEventListener('focus', onFocus);
    };
  }, [fetchCategories]);

  const active = String(activeCategory ?? 'home');

  return (
    <nav className="category-nav-container">
      <div className="category-scroll">
        <button
          className={`nav-item ${active === 'home' ? 'active' : ''}`}
          onClick={() => onCategorySelect('home')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          type="button"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          หน้าหลัก
        </button>

        <div
          style={{
            width: '1px',
            height: '20px',
            backgroundColor: '#ddd',
            margin: '0 10px',
            flex: '0 0 auto',
          }}
        />

        <button
          className={`nav-item highlight ${active === 'new' ? 'active' : ''}`}
          onClick={() => onCategorySelect('new')}
          type="button"
        >
          ใหม่!
        </button>

        {categories.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${active === item.id ? 'active' : ''}`}
            onClick={() => onCategorySelect(item.id)}
            type="button"
          >
            {item.name}
          </button>
        ))}
      </div>
    </nav>
  );
}
