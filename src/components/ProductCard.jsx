import React from 'react';
import '../styles/ProductCard.css';

export default function ProductCard({ product, onClick }) {
  const isOutOfStock = product.status === 'out_of_stock';

  // คำนวณ % ลดราคา
  const discountPercentage = product.originalPrice 
    ? Math.floor(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const getSkinLabel = (type) => {
    if (!type) return "";
    const map = {
      'oily': 'ผิวมัน',
      'dry': 'ผิวแห้ง',
      'combination': 'ผิวผสม',
      'sensitive': 'แพ้ง่าย',
      'normal': 'ผิวธรรมดา'
    };
    return map[type.toLowerCase()] || type;
  };

  const skinTags = Array.isArray(product.suitable_skin_type) 
    ? product.suitable_skin_type.slice(0, 3) 
    : (product.suitable_skin_type ? [product.suitable_skin_type] : []);

  return (
    <div className="product-card" onClick={onClick}>
      <div className="product-image-container">
        <img src={product.image} alt={product.name} className="product-image" />
        
        {/* ป้ายลดราคา (มุมขวาบน) */}
        {discountPercentage > 0 && (
            <div className="card-discount-badge">-{discountPercentage}%</div>
        )}

        {isOutOfStock && (
          <div className="out-of-stock-overlay">
            <span>สินค้าหมด</span>
          </div>
        )}
      </div>
      
      <div className="product-info">
        
        {/* 🔥 ส่วนหัว (Header Row): แบรนด์ (ซ้าย) - ราคา (ขวา) */}
        <div className="product-header-row">
          {/* ซ้าย: แบรนด์ */}
          <span className="product-brand">{product.brand}</span>

          {/* ขวา: ราคา (Logic เดิม: ถ้ามีลดราคา ให้โชว์ขีดฆ่า) */}
          <div className="price-container-right">
            {product.originalPrice ? (
              // กรณีมีลดราคา
              <>
                <span className="price-original-sm">฿{product.originalPrice.toLocaleString()}</span>
                <span className="price-current sale-text">฿{product.price.toLocaleString()}</span>
              </>
            ) : (
              // กรณีปกติ
              <span className="price-current">฿{product.price.toLocaleString()}</span>
            )}
          </div>
        </div>
        
        {/* ชื่อสินค้า (บรรทัดต่อมา) */}
        <div className="product-name-row">
          <span className="product-name">{product.name}</span>
        </div>

        {/* Tags (ล่างสุด) */}
        {skinTags.length > 0 && (
          <div className="product-tags">
            {skinTags.map((tag, index) => (
              // ลบ style={{...}} ออก แล้วใส่ className="skin-tag-item" แทน
              <span key={index} className="skin-tag-item">
                {getSkinLabel(tag)}
              </span>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}