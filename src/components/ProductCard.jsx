import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/ProductCard.css';

export default function ProductCard({ product }) {
  return (
    <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="product-card">
        <div className="image-wrapper">
          {product.stock === 0 && (
            <div className="sold-out-overlay">
              <div className="sold-out-text">สินค้าหมด</div>
              <div className="sold-out-sub">Sold Out</div>
            </div>
          )}
          <img src={product.image} alt={product.name} className="product-img" />
        </div>

        <div className="info-row">
          <div>
            <div className="brand">{product.brand}</div>
            <div className="name">{product.name}</div>
          </div>
          <div className="price">{product.price.toLocaleString()} Baht</div>
        </div>
      </div>
    </Link>
  );
}