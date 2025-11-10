import React from "react";
import "../components/styles/ProductCard.css";
import './ProductList.jsx';

function ProductCard({ product, onSelect }) {
  const { id, imageUrl, brand, name, price, isOutOfStock } = product;
  const cardClasses = `product-card ${isOutOfStock ? 'is-out-of-stock' : ''}`;
  const handleClick = () => {
    console.log('--- LOG: Card Clicked! ---', product);
    onSelect(product);
  };

  return (
      <div className={cardClasses} onClick={handleClick} style={{ cursor: 'pointer' }}>
        <div className="card-image-container">
          <img src={imageUrl} alt={name} className="product-image" />
          {isOutOfStock && (
            <div className="out-of-stock-overlay">
              <span>สินค้าหมด</span>
            </div>
          )}
        </div>
        <div className="card-info">
          <div className="info-top-row">
            <span className="product-brand">{brand}</span>
            <span className="product-price">{price} Baht</span>
          </div>
          <p className="product-name">{name}</p>
        </div>
      </div>
  );
}

export default ProductCard;
