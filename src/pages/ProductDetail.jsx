import React, { useState, useRef, useEffect } from "react";
import "../pages/styles/ProductDetail.css";
import ProductCard from "../components/ProductCard";
import { mockProducts } from "../components/ProductList";

function ProductDetail({ product, onGoBack, onAddToCart, onProductSelect }) {
  if (!product) {
    console.error("--- DETAIL: Product prop is null or undefined! ---");
     return (
       <div className="product-detail-container error-container">
         <p>กำลังโหลดข้อมูลสินค้า หรือ ไม่พบข้อมูล...</p>
       </div>
     );
  }
  const {
    id, images = [product.imageUrl].filter(Boolean), brand,
    name = 'สินค้า', price, isOutOfStock, description = '...',
    ingredients = '...', usage = ['...'], skinType = []
  } = product;
  const [quantity, setQuantity] = useState(1);
  const initialImage = images[0] || '';
  const [currentImage, setCurrentImage] = useState(initialImage);
  const thumbnailContainerRef = useRef(null);
  useEffect(() => {
    const newInitialImage = product?.images?.[0] || product?.imageUrl || '';
    setCurrentImage(newInitialImage);
    setQuantity(1);
    window.scrollTo(0, 0);
  }, [product]);

  const handleThumbnailClick = (imageUrl) => { setCurrentImage(imageUrl); };
  const navigateImage = (direction) => {
    if (!images || images.length <= 1) return;
    const currentIndex = images.findIndex(img => img === currentImage);
    let nextIndex;
    if (direction === 'next') {
      nextIndex = (currentIndex + 1) % images.length;
    } else {
      nextIndex = (currentIndex - 1 + images.length) % images.length;
    }
    setCurrentImage(images[nextIndex]);
    const activeButton = thumbnailContainerRef.current?.children[nextIndex];
    activeButton?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  };
  const increaseQuantity = () => setQuantity(prev => prev + 1);
  const decreaseQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  const handleAddToCart = () => {
    console.log(`เพิ่ม ${name} จำนวน ${quantity} ชิ้น ลงตะกร้า`);
    onAddToCart(name, quantity);
  };

  const relatedProducts = mockProducts.filter(p => p.id !== id).slice(0, 4);

  return (
    <div className="product-detail-container">
      <div className="product-main-section">
        <div className="product-gallery">
          <div className="main-image-container">
            <img src={currentImage} alt={name} className="main-image" />
            {isOutOfStock && ( <div className="out-of-stock-overlay detail-overlay"><span>สินค้าหมด</span></div> )}
          </div>
          {images && images.length > 1 && (
            <div className="thumbnail-gallery">
              <button className="thumb-nav-arrow prev-arrow" onClick={() => navigateImage('prev')} aria-label="Previous image">
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
              </button>
              <div className="thumbnail-container" ref={thumbnailContainerRef}>
                {images.map((imgUrl, index) => (
                  <button key={index} className={`thumbnail-button ${imgUrl === currentImage ? 'active' : ''}`} onClick={() => handleThumbnailClick(imgUrl)}>
                    <img src={imgUrl} alt={`${name} thumbnail ${index + 1}`} className="thumbnail-image" />
                  </button>
                ))}
              </div>
              <button className="thumb-nav-arrow next-arrow" onClick={() => navigateImage('next')} aria-label="Next image">
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
            </div>
          )}
        </div>
        <div className="product-info-section">
          <p className="product-brand-detail">{brand}</p>
          <h1 className="product-name-detail">{name}</h1>
          {skinType && skinType.length > 0 && (
            <div className="skin-type-tags">
              {Array.isArray(skinType) ? (
                skinType.map((type, index) => (
                  <span key={index} className="skin-type-tag">{type}</span>
                ))
              ) : (
                <span className="skin-type-tag">{skinType}</span>
              )}
            </div>
          )}
          <p className="price-current">฿{price}</p>
          <div className="quantity-selector">
            <label>จำนวน</label>
            <div className="quantity-controls">
              <button onClick={decreaseQuantity} disabled={isOutOfStock} aria-label="ลดจำนวน">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                <path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8z"/>
              </svg>
            </button>
              <span>{quantity}</span>
              <button onClick={increaseQuantity} disabled={isOutOfStock} aria-label="เพิ่มจำนวน">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
              </svg>
            </button>
            </div>
          </div>
          {/* ปุ่มเพิ่มลงตะกร้า */}
          <button className="add-to-cart-button" onClick={handleAddToCart} disabled={isOutOfStock}>
          {isOutOfStock ? 'สินค้าหมด' : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
              </svg>
              <span>เพิ่มในถุงช้อปปิ้ง</span>
            </>
          )}
        </button>
          {/* รายละเอียด */}
          <div className="product-description section">
            <h4>คำอธิบาย</h4>
            <p>{description}</p>
          </div>
          {/* ส่วนประกอบ */}
          <div className="product-ingredients section">
            <h4>ส่วนประกอบ</h4>
            <p>{ingredients}</p>
          </div>
          {/* วิธีใช้ */}
          <div className="product-usage section">
            <h4>วิธีใช้</h4>
            <ol>
              {Array.isArray(usage) ? usage.map((step, index) => <li key={index}>{step}</li>) : <li>{usage}</li>}
            </ol>
          </div>
        </div>
      </div>
      {/* --- สินค้าที่เกี่ยวข้อง --- */}
      {relatedProducts.length > 0 && (
        <div className="related-products-section">
          <h2>สินค้าที่มีส่วนผสมคล้ายคลึงกัน</h2>
          <div className="product-grid">
            {relatedProducts.map(relatedProduct => (
              <ProductCard
                key={relatedProduct.id}
                product={relatedProduct}
                onSelect={onProductSelect}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductDetail;
