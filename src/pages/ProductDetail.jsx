import React, { useState, useEffect, useRef } from 'react';
import '../styles/ProductDetail.css';
import ProductCard from '../components/ProductCard';
import { mockProducts } from '../data/mockData';

export default function ProductDetail({ product, onAddToCart, onProductSelect }) {
  const galleryImages = product ? [
    product.image,
    '/assets/64a8f17fdff7ede2b34ac16f5fb2e125.jpg_720x720q80.jpg',
    '/assets/COSRX-Galactomyces-95-Tone-Balancing-Essence-1-copy.webp',
    '/assets/cosrx-galactomyces-95-tone-balancing-essence-3-1000x1250w.jpg',
    '/assets/CosRxGalactomyces95ToneBalancingEssence2.webp',
    '/assets/textura-galactomyces.jpg',
    '/assets/sg-11134201-7rd4w-m72l5atb9d1w9e.jpg'
  ] : [];

  const [currentIndex, setCurrentIndex] = useState(0); // ✅ เก็บตำแหน่งรูปปัจจุบัน (0, 1, 2...)
  const [quantity, setQuantity] = useState(1);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (product) {
      setCurrentIndex(0);
      setQuantity(1);
    }
  }, [product]);

  useEffect(() => {
    if (scrollRef.current) {
      const activeThumb = scrollRef.current.children[currentIndex];
      if (activeThumb) {
        activeThumb.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  }, [currentIndex]);

  if (!product) return null;
  const isOutOfStock = product.status === 'out_of_stock';
  const mainImage = galleryImages[currentIndex];
  const handlePrev = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? galleryImages.length - 1 : prevIndex - 1
    );
  };
  const handleNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === galleryImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleQuantityChange = (delta) => {
    setQuantity(prev => (prev + delta < 1 ? 1 : prev + delta));
  };

  const relatedProducts = mockProducts.filter(p => p.id !== product.id).slice(0, 4);

  return (
    <div className="product-detail-page">
      <div className="product-main-section">
        <div className="product-gallery-container">
          <div className="main-image-wrapper">
            <img 
               src={mainImage} 
               alt={product.name} 
               className="detail-main-image"
               onError={(e) => {e.target.src = 'https://via.placeholder.com/500?text=Image+Not+Found'}} 
            />
            {isOutOfStock && (
              <div className="detail-out-of-stock-overlay"><span>สินค้าหมด</span></div>
            )}
          </div>

          <div className="thumbnail-wrapper">
            <button className="nav-arrow left" onClick={handlePrev}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <div className="thumbnail-list" ref={scrollRef}>
              {galleryImages.map((img, idx) => (
                <div 
                  key={idx} 
                  className={`thumbnail-item ${idx === currentIndex ? 'active' : ''}`}
                  onClick={() => setCurrentIndex(idx)}
                >
                  <img 
                    src={img} 
                    alt={`thumb-${idx}`} 
                    onError={(e) => {e.target.src = 'https://via.placeholder.com/80'}}
                  />
                </div>
              ))}
            </div>
            <button className="nav-arrow right" onClick={handleNext}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </div>

        <div className="product-info-container">
          <h2 className="detail-brand">{product.brand}</h2>
          <h1 className="detail-name">{product.name}</h1>
          <div style={{margin: '15px 0'}}>
             <span className="tag-badge">ผิวมัน</span>
          </div>

          <div className="detail-price">
            {product.price.toLocaleString('en-US', { minimumFractionDigits: 2 })} Baht
          </div>

          <div className="detail-actions">
            <div className="qty-section">
              <span className="qty-label">จำนวน</span>
              <div className="qty-control-group">
                <button className="qty-circle-btn" onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </button>
                <span className="qty-value-text">{quantity}</span>
                <button className="qty-circle-btn" onClick={() => handleQuantityChange(1)}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </button>
              </div>
            </div>

            <button 
              className={`add-to-cart-pill ${isOutOfStock ? 'disabled' : ''}`}
              onClick={() => !isOutOfStock && onAddToCart(product, quantity)}
              disabled={isOutOfStock}
            >
               {isOutOfStock ? 'สินค้าหมด' : (
                 <>
                   <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                   เพิ่มในถุงช้อปปิ้ง
                 </>
               )}
            </button>
          </div>

          <div className="detail-text-content">
             <div className="text-section">
                <h3>คำอธิบาย</h3>
                <p>{product.description || "คำอธิบายสินค้า..."}</p>
             </div>
             <div className="text-section">
                <h3>ส่วนประกอบ</h3>
                <p>{product.ingredients || "..."}</p>
             </div>
             <div className="text-section">
                <h3>วิธีการใช้งาน</h3>
                <ol className="usage-list">
                   <li>ใช้หลังการล้างหน้าและโทนเนอร์</li>
                   <li>ทาให้ทั่วใบหน้าและลำคอ</li>
                </ol>
             </div>
          </div>
        </div>
      </div>

      <div className="related-products-section">
         <h2 className="section-title">สินค้าที่มีส่วนผสมคล้ายคลึงกัน</h2>
         <div className="related-grid">
           {relatedProducts.map(p => (
             <ProductCard key={p.id} product={p} onClick={() => onProductSelect(p)} />
           ))}
         </div>
      </div>
    </div>
  );
}