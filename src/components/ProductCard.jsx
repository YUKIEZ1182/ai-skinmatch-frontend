import React from 'react';
import '../styles/ProductCard.css';

export default function ProductCard({ product, onClick }) {
  // เช็คสถานะสินค้าหมด
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
    };
    return map[type.toLowerCase()] || type;
  };

  const skinTags = Array.isArray(product.suitable_skin_type) 
    ? product.suitable_skin_type.slice(0, 3) 
    : (product.suitable_skin_type ? [product.suitable_skin_type] : []);

  return (
    /* แก้ไขจุดนี้: ให้ onClick ทำงานได้เสมอแม้สินค้าจะหมด */
    <div className={`product-card ${isOutOfStock ? 'out-of-stock' : ''}`} onClick={onClick}>
      <div className="product-image-container">
        <img 
          src={product.image} 
          alt={product.name} 
          className={`product-image ${isOutOfStock ? 'blur-img' : ''}`} 
        />
        
        {/* ไม่แสดงป้ายลดราคาถ้าสินค้าหมด */}
        {discountPercentage > 0 && !isOutOfStock && (
            <div className="card-discount-badge">-{discountPercentage}%</div>
        )}

        {isOutOfStock && (
          <div className="out-of-stock-overlay">
            <span>สินค้าหมด</span>
          </div>
        )}
      </div>
      
      <div className="product-info">
        <div className="product-header-row">
          <span className="product-brand">{product.brand}</span>
          <div className="price-container-right">
            {product.originalPrice ? (
              <>
                <span className="price-original-sm">฿{product.originalPrice.toLocaleString()}</span>
                <span className={`price-current ${!isOutOfStock ? 'sale-text' : ''}`}>
                  ฿{product.price.toLocaleString()}
                </span>
              </>
            ) : (
              <span className="price-current">฿{product.price.toLocaleString()}</span>
            )}
          </div>
        </div>
        
        <div className="product-name-row">
          <span className="product-name">{product.name}</span>
        </div>

        {skinTags.length > 0 && (
          <div className="product-tags">
            {skinTags.map((tag, index) => (
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