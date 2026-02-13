// src/components/ProductCard.jsx
import React from 'react';
import '../styles/ProductCard.css';

export default function ProductCard({ product, onClick, onShowSimilar }) {
  const isOutOfStock = product?.status === 'out_of_stock';

  const discountPercentage = product?.originalPrice
    ? Math.floor(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const getSkinLabel = (type) => {
    if (!type) return '';
    const map = {
      oily: 'ผิวมัน',
      dry: 'ผิวแห้ง',
      combination: 'ผิวผสม',
      sensitive: 'แพ้ง่าย',
      normal: 'ผิวธรรมดา',
      all: 'ทุกสภาพผิว',
    };
    return map[String(type).toLowerCase()] || type;
  };

  const skinTags = Array.isArray(product?.suitable_skin_type)
    ? product.suitable_skin_type.slice(0, 3)
    : product?.suitable_skin_type
      ? [product.suitable_skin_type]
      : [];

  const handleSimilarClick = (e) => {
    e.stopPropagation();
    if (typeof onShowSimilar === 'function') onShowSimilar(product);
  };

  const handleCardClick = () => {
    if (typeof onClick === 'function') onClick(); // ✅ สินค้าหมดก็เข้า Detail ได้
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick();
    }
  };

  return (
    <div
      className={`product-card ${isOutOfStock ? 'is-oos' : ''}`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="product-image-container">
        <img src={product.image} alt={product.name} className="product-image" />

        {discountPercentage > 0 && (
          <div className="card-discount-badge">-{discountPercentage}%</div>
        )}

        {isOutOfStock && (
          <div className="out-of-stock-overlay" aria-hidden="true">
            <div className="out-of-stock-pill">สินค้าหมด</div>
          </div>
        )}

        {onShowSimilar && (
          <button
            className="btn-similar-ingredients"
            onClick={handleSimilarClick}
            type="button"
            title="ค้นหาสินค้าที่มีส่วนผสมใกล้เคียงกัน"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10 2v7.31"></path>
              <path d="M14 9.3V1.99"></path>
              <path d="M8.5 2h7"></path>
              <path d="M14 9.3a6.5 6.5 0 1 1-4 0"></path>
              <path d="M5.52 16h12.96"></path>
            </svg>
          </button>
        )}
      </div>

      <div className="product-info">
        <div className="product-header-row">
          <span className="product-brand">{product.brand}</span>

          <div className="price-container-right">
            {product.originalPrice ? (
              <>
                <span className="price-original-sm">฿{product.originalPrice.toLocaleString()}</span>
                <span className="price-current sale-text">฿{product.price.toLocaleString()}</span>
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
