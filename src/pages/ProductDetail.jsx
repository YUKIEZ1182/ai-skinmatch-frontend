import React, { useState, useEffect, useRef } from 'react';
import '../styles/ProductDetail.css';
import ProductCard from '../components/ProductCard';
import { mockProducts } from '../data/mockData';

export default function ProductDetail({ product, onAddToCart, onProductSelect }) {
  const galleryImages = product ? [
    product.image,
    "https://via.placeholder.com/500x500?text=Side+View",
    "https://via.placeholder.com/500x500?text=Texture",
    "https://via.placeholder.com/500x500?text=Package",
    "https://via.placeholder.com/500x500?text=Usage"
  ] : [];
  const [currentIndex, setCurrentIndex] = useState(0);
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
  const handlePrev = () => { setCurrentIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));};
  const handleNext = () => { setCurrentIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));};
  const handleQuantityChange = (delta) => { setQuantity(prev => (prev + delta < 1 ? 1 : prev + delta));};
  const relatedProducts = mockProducts.filter(p => p.id !== product.id).slice(0, 4);
  return (
    <div className="product-detail-page">
      <div className="product-main-layout">
        <div className="left-column-gallery">
          <div className="main-image-frame">
            <img src={mainImage} alt={product.name} className="main-img-display" onError={(e) => {e.target.src = 'https://via.placeholder.com/500?text=Image+Error'}} />
            {isOutOfStock && <div className="out-of-stock-badge">สินค้าหมด</div>}
          </div>
          <div className="thumbnails-container">
              <button className="nav-arrow left" onClick={handlePrev}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
              </button>
              <div className="thumbnail-scroll-area" ref={scrollRef}>
                {galleryImages.map((img, idx) => (
                  <div  key={idx} className={`thumb-card ${idx === currentIndex ? 'active' : ''}`}                onClick={() => setCurrentIndex(idx)}>
                    <img src={img} alt={`thumb-${idx}`} />
                  </div>
                ))}
              </div>
              <button className="nav-arrow right" onClick={handleNext}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
          </div>
        </div>
        <div className="right-column-info">
          <div className="brand-name">{product.brand}</div>
          <h1 className="product-name-title">{product.name}</h1>
          <div className="product-tags-row">
             <span className="tag-pill">ผิวมัน</span>
          </div>
          <div className="product-price-display">
            {product.price.toLocaleString('en-US', { minimumFractionDigits: 2 })} Baht
          </div>
          <div className="actions-wrapper">
            <div className="quantity-selector">
                <span className="qty-label-top">จำนวน</span>
                <div className="qty-buttons">
                    <button onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>-</button>
                    <span className="qty-number">{quantity}</span>
                    <button onClick={() => handleQuantityChange(1)}>+</button>
                </div>
            </div>
            <button className={`add-to-cart-btn-black ${isOutOfStock ? 'disabled' : ''}`} onClick={() => !isOutOfStock && onAddToCart(product, quantity)} disabled={isOutOfStock}>
               {isOutOfStock ? 'สินค้าหมด' : (
                 <>
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight:8}}><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                   เพิ่มในถุงช้อปปิ้ง
                 </>
               )}
            </button>
          </div>
          <div className="divider-line"></div>
          <div className="description-blocks">
             <div className="desc-item">
                <h3>คำอธิบาย</h3>
                <p>{product.description || "เซ็ตของขวัญพิเศษ มอบผิวจระจ่างใสให้คนสำคัญ"}</p>
             </div>
             <div className="desc-item">
                <h3>ส่วนประกอบ</h3>
                <p>{product.ingredients || "Pitera™, Galactomyces Ferment Filtrate, Butylene Glycol..."}</p>
             </div>
             <div className="desc-item">
                <h3>วิธีการใช้งาน</h3>
                <ol>
                   <li>ใช้หลังการล้างหน้าและโทนเนอร์</li>
                   <li>ทาให้ทั่วใบหน้าและลำคอ</li>
                </ol>
             </div>
          </div>
        </div>
      </div>
      <div className="related-section">
         <h2 className="related-title">สินค้าที่มีส่วนผสมคล้ายคลึงกัน</h2>
         <div className="related-grid">
           {relatedProducts.map(p => (
             <ProductCard key={p.id} product={p} onClick={() => onProductSelect(p)} />
           ))}
         </div>
      </div>
    </div>
  );
}