import React from 'react';
import '../styles/ProductCard.css';

export default function ProductCard({ product, onClick }) {
  const isOutOfStock = product.status === 'out_of_stock';
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
      </div>
    </div>
  );
}