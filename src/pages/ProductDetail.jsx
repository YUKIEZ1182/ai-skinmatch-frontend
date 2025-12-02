import React, { useState, useRef, useEffect } from 'react';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import { Link, useParams } from 'react-router-dom';
import '../styles/ProductDetail.css';
import '../styles/App.css';
import { mockProducts } from '../data/mockData';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const sliderRef = useRef(null);

  useEffect(() => {
    const foundProduct = mockProducts.find(p => p.id === parseInt(id));
    if (foundProduct) {
      setProduct(foundProduct);
      const initialImage = (foundProduct.images && foundProduct.images.length > 0) ? foundProduct.images[0] : foundProduct.image;
      setMainImage(initialImage);
    }
    if (sliderRef.current) sliderRef.current.scrollLeft = 0;
  }, [id]);

  const slide = (direction) => {
    if (sliderRef.current) {
      const { current } = sliderRef;
      if (direction === 'left') current.scrollLeft -= 100;
      else current.scrollLeft += 100;
    }
  };

  if (!product) return <div style={{textAlign:'center', marginTop: 50}}>Loading...</div>;

  const imageList = (product.images && product.images.length > 0) ? product.images : [product.image];
  const relatedProducts = mockProducts.filter(p => p.id !== product.id && p.type === product.type).slice(0, 4);

  return (
    <div>
      <div className="breadcrumb"><Link to="/" className="breadcrumb-link">หน้าแรก</Link> <span className="breadcrumb-separator"> &gt; </span> <span>{product.name}</span></div>

      <main className="detail-container">
        <div className="product-top-section">
          <div className="gallery-section">
            <div className="main-image-box"><img src={mainImage} alt={product.name} className="main-image" /></div>
            <div className="thumbnail-carousel-container">
              <button className="arrow-btn" onClick={() => slide('left')}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg></button>
              <div className="thumbnail-wrapper" ref={sliderRef}>
                <div className="thumbnail-list">
                  {imageList.map((imgSrc, index) => (
                    <img key={index} src={imgSrc} className={`thumbnail ${mainImage === imgSrc ? 'active' : ''}`} onClick={() => setMainImage(imgSrc)} alt="" />
                  ))}
                </div>
              </div>
              <button className="arrow-btn" onClick={() => slide('right')}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg></button>
            </div>
          </div>

          <div className="info-section">
            <div className="brand-title">{product.brand}</div>
            <h1 className="product-title">{product.name}</h1>
            <div className="tag-container">{product.skinType && product.skinType.map((type, i) => <span key={i} className="skin-type-tag">{type}</span>)}</div>
            <div className="product-price">{product.price.toLocaleString()} Baht</div>
            <div className="action-row">
               <span className="qty-label">จำนวน</span>
               <div className="qty-selector">
                  <button className="qty-btn" onClick={()=> setQuantity(q => Math.max(1, q-1))}>−</button>
                  <span className="qty-number">{quantity}</span>
                  <button className="qty-btn" onClick={()=> setQuantity(q => q+1)}>+</button>
               </div>
               <button className="add-to-cart-btn">เพิ่มในถุงช้อปปิ้ง</button>
            </div>
            <div className="detail-text-group">
              <div className="detail-heading">คำอธิบาย</div>
              <p className="detail-desc" style={{whiteSpace: 'pre-line'}}>{product.description}</p>
            </div>
          </div>
        </div>
        <h2 className="section-header">สินค้าที่คล้ายกัน</h2>
        <div className="product-grid">{relatedProducts.map(p => <ProductCard key={p.id} product={p} />)}</div>
      </main>
      <footer className="footer" style={{textAlign: 'center', padding: '40px', background: '#fff0e8'}}>Footer Content</footer>
    </div>
  );
}