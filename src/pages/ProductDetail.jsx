import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/ProductDetail.css';
import ProductCard from '../components/ProductCard';
import { apiFetch } from '../utils/api'; 

const API_URL = import.meta.env.VITE_DIRECTUS_PUBLIC_URL;

const skinTypeOptions = {
  oily: 'ผิวมัน',
  combination: 'ผิวผสม',
  dry: 'ผิวแห้ง',
  sensitive: 'ผิวแพ้ง่าย',
  all: 'ทุกสภาพผิว',
};

export default function ProductDetail({ onAddToCart }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [galleryImages, setGalleryImages] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // --- 1. Fetch Product Detail ---
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await apiFetch(
          `/items/product/${id}?fields=id,name,price,description,brand_name,suitable_skin_type,status,illustration.directus_files_id,ingredients.ingredient_id.name`
        );
        
        if (!response.ok) throw new Error('Failed to fetch product');

        const json = await response.json();

        if (json.data) {
          const item = json.data;

          let images = [];
          if (item.illustration && item.illustration.length > 0) {
            images = item.illustration
              .map((img) =>
                img.directus_files_id
                  ? `${API_URL}/assets/${img.directus_files_id}`
                  : null
              )
              .filter(Boolean);
          }

          if (images.length === 0) {
            images = ['https://via.placeholder.com/500x500?text=No+Image'];
          }

          const ingredientList =
            item.ingredients
              ?.map((i) => i.ingredient_id?.name)
              .filter(Boolean)
              .join(', ') || '-';

          setProduct({
            ...item,
            price: Number(item.price),
            ingredientsDisplay: ingredientList,
          });
          setGalleryImages(images);
          setCurrentIndex(0);
          setQuantity(1);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const response = await apiFetch(
          `/recommend/similar-product?product_id=${id}`
        );

        if (response.ok) {
          const json = await response.json();
          if (json.data) {
            const mappedRelated = json.data.map((p) => ({
              id: p.id,
              name: p.name,
              price: Number(p.price),
              image: p.thumbnail
                ? `${API_URL}/assets/${p.thumbnail}`
                : 'https://via.placeholder.com/300x300?text=No+Image',
              brand: p.brand_name || 'General', 
            }));
            setRelatedProducts(mappedRelated);
          }
        }
      } catch (error) {
        console.error('Error fetching related:', error);
      }
    };
    if (id) fetchRelated();
  }, [id]);

  useEffect(() => {
    if (scrollRef.current && galleryImages.length > 0) {
      const activeThumb = scrollRef.current.children[currentIndex];
      if (activeThumb) {
        activeThumb.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    }
  }, [currentIndex, galleryImages]);

  const handlePrev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? galleryImages.length - 1 : prev - 1
    );
  };
  const handleNext = () => {
    setCurrentIndex((prev) =>
      prev === galleryImages.length - 1 ? 0 : prev + 1
    );
  };
  const handleQuantityChange = (delta) => {
    setQuantity((prev) => (prev + delta < 1 ? 1 : prev + delta));
  };

  const handleProductSelect = (p) => {
    navigate(`/product/${p.id}`);
    window.scrollTo(0, 0);
  };

  if (loading) return <div className="loading-state">กำลังโหลดข้อมูล...</div>;
  if (!product) return null;

  const isOutOfStock = product.status === 'out_of_stock';
  const mainImage = galleryImages[currentIndex];

  return (
    <div className="product-detail-page">
      <div className="product-main-layout">
        <div className="left-column-gallery">
          <div className="main-image-frame">
            <img
              src={mainImage}
              alt={product.name}
              className="main-img-display"
              onError={(e) => {
                e.target.src =
                  'https://via.placeholder.com/500?text=Image+Error';
              }}
            />
            {isOutOfStock && (
              <div className="out-of-stock-badge">สินค้าหมด</div>
            )}
          </div>

          {galleryImages.length > 1 && (
            <div className="thumbnails-container">
              <button className="nav-arrow left" onClick={handlePrev}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
              <div className="thumbnail-scroll-area" ref={scrollRef}>
                {galleryImages.map((img, idx) => (
                  <div
                    key={idx}
                    className={`thumb-card ${idx === currentIndex ? 'active' : ''}`}
                    onClick={() => setCurrentIndex(idx)}
                  >
                    <img src={img} alt={`thumb-${idx}`} />
                  </div>
                ))}
              </div>
              <button className="nav-arrow right" onClick={handleNext}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="right-column-info">
          <div className="brand-name">{product.brand_name || '-'}</div>
          <h1 className="product-name-title">{product.name}</h1>

          <div className="product-tags-row">
            {Array.isArray(product.suitable_skin_type) &&
              product.suitable_skin_type.map((skinType, index) => (
                <span key={index} className="tag-pill">
                  {skinTypeOptions[skinType] || skinType}
                </span>
              ))}
          </div>

          <div className="product-price-display">
            {product.price.toLocaleString('en-US', {
              minimumFractionDigits: 2,
            })}{' '}
            Baht
          </div>

          <div className="actions-wrapper">
            <div className="quantity-selector">
              <span className="qty-label-top">จำนวน</span>
              <div className="qty-buttons">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="qty-number">{quantity}</span>
                <button onClick={() => handleQuantityChange(1)}>+</button>
              </div>
            </div>
            <button
              className={`add-to-cart-btn-black ${isOutOfStock ? 'disabled' : ''}`}
              onClick={() => !isOutOfStock && onAddToCart(product, quantity)}
              disabled={isOutOfStock}
            >
              {isOutOfStock ? (
                'สินค้าหมด'
              ) : (
                <>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{ marginRight: 8 }}
                  >
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                  </svg>
                  เพิ่มในถุงช้อปปิ้ง
                </>
              )}
            </button>
          </div>

          <div className="divider-line"></div>

          <div className="description-blocks">
            <div className="desc-item">
              <div
                className="wysiwyg-content"
                dangerouslySetInnerHTML={{ __html: product.description || '-' }}
              />
            </div>

            {product.ingredientsDisplay &&
              product.ingredientsDisplay !== '-' && (
                <div className="desc-item">
                  <h3>ส่วนประกอบ</h3>
                  <p>{product.ingredientsDisplay}</p>
                </div>
              )}
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="related-section">
          <h2 className="related-title">สินค้าที่มีส่วนผสมคล้ายคลึงกัน</h2>
          <div className="related-grid">
            {relatedProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onClick={() => handleProductSelect(p)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}