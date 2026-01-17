import React from 'react';
import '../styles/ProductCard.css';

export default function ProductCard({ product, onClick }) {
  const isOutOfStock = product.status === 'out_of_stock';

  // 1. ฟังก์ชันแปลงชื่อผิวเป็นภาษาไทย
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
        {isOutOfStock && (
          <div className="out-of-stock-overlay">
            <span>สินค้าหมด</span>
          </div>
        )}
      </div>
      
      <div className="product-info">
        <div className="product-header-row">
          <span className="product-brand">{product.brand}</span>
          <span className="product-price">
            {product.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Baht
          </span>
        </div>
        
        <div className="product-name-row">
          <span className="product-name">{product.name}</span>
        </div>

        {skinTags.length > 0 && (
          <div className="product-tags" style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '6px' }}>
            {skinTags.map((tag, index) => (
              <span key={index} style={{
                fontSize: '0.65rem',
                padding: '2px 6px',
                borderRadius: '9999px',
                backgroundColor: '#FFD6C9', 
                color: '#670B00',
                fontWeight: '600',
                whiteSpace: 'nowrap'
              }}>
                {getSkinLabel(tag)}
              </span>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}