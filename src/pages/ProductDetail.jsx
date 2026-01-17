import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/ProductDetail.css';
import ProductCard from '../components/ProductCard';
import { apiFetch } from '../utils/api'; 
// 🔥 Import AlertBanner
import AlertBanner from '../components/AlertBanner';

const API_URL = import.meta.env.VITE_DIRECTUS_PUBLIC_URL;

const skinTypeOptions = {
  oily: 'ผิวมัน',
  combination: 'ผิวผสม',
  dry: 'ผิวแห้ง',
  sensitive: 'ผิวแพ้ง่าย',
  all: 'ทุกสภาพผิว',
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [galleryImages, setGalleryImages] = useState([]);
  
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [skinRecommendations, setSkinRecommendations] = useState([]);
  const [userSkinType, setUserSkinType] = useState(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  // 🔥 State สำหรับ AlertBanner
  const [alertMessage, setAlertMessage] = useState(null);

  // Helper
  const mapProductData = (item) => ({
    id: item.id,
    name: item.name,
    price: Number(item.price), 
    image: item.thumbnail ? `${API_URL}/assets/${item.thumbnail}` : 'https://via.placeholder.com/300x300?text=No+Image',
    brand: item.brand_name || 'General', 
    suitable_skin_type: Array.isArray(item.suitable_skin_type) ? item.suitable_skin_type : (item.suitable_skin_type ? [item.suitable_skin_type] : []),
    status: item.status
  });

  // 1. Fetch Product
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
            images = item.illustration.map((img) => img.directus_files_id ? `${API_URL}/assets/${img.directus_files_id}` : null).filter(Boolean);
          }
          if (images.length === 0) images = ['https://via.placeholder.com/500x500?text=No+Image'];

          const ingredientList = item.ingredients?.map((i) => i.ingredient_id?.name).filter(Boolean).join(', ') || '-';

          setProduct({
            ...item,
            price: Number(item.price),
            ingredientsDisplay: ingredientList,
            suitable_skin_type: Array.isArray(item.suitable_skin_type) ? item.suitable_skin_type : (item.suitable_skin_type ? [item.suitable_skin_type] : [])
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
    if (id) fetchProduct();
  }, [id]);

  // 2. Fetch Related
  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const response = await apiFetch(`/recommend/similar-product?product_id=${id}`);
        if (response.ok) {
          const json = await response.json();
          if (json.data) setRelatedProducts(json.data.map(mapProductData));
        }
      } catch (error) { console.error(error); }
    };
    if (id) fetchRelated();
  }, [id]);

  // 3. Fetch Skin Recs
  useEffect(() => {
    const fetchSkinRecs = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      try {
        const userRes = await apiFetch('/users/me');
        if (!userRes.ok) return;
        const userData = await userRes.json();
        const skinType = userData.data?.skin_type;

        if (skinType) {
            setUserSkinType(skinType);
            const thaiSkinType = skinTypeOptions[skinType] || skinType;
            const filterString = `filter[status][_eq]=active&filter[_or][0][suitable_skin_type][_icontains]=${skinType}&filter[_or][1][suitable_skin_type][_icontains]=${thaiSkinType}`;
            const excludeCurrent = `&filter[id][_neq]=${id}`; 
            const productRes = await apiFetch(`/items/product?limit=4&fields=id,name,price,thumbnail,brand_name,status,suitable_skin_type&${filterString}${excludeCurrent}`);
            if (productRes.ok) {
                const json = await productRes.json();
                if (json.data) setSkinRecommendations(json.data.map(mapProductData));
            }
        }
      } catch (error) { console.error(error); }
    };
    if (id) fetchSkinRecs();
  }, [id]);

  // 4. Scroll Gallery
  useEffect(() => {
    if (scrollRef.current && galleryImages.length > 0) {
      const activeThumb = scrollRef.current.children[currentIndex];
      if (activeThumb) activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [currentIndex, galleryImages]);

  // 🔥 ฟังก์ชัน Add to Cart (แบบบวกเพิ่ม Accumulate)
  const handleAddToCart = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setAlertMessage("กรุณาเข้าสู่ระบบก่อนทำการสั่งซื้อ");
      return;
    }

    try {
      setAddingToCart(true);
      
      // 1. เช็คว่ามีสินค้านี้ในตะกร้าหรือยัง
      const checkRes = await apiFetch(
        `/items/cart_detail?filter[product][_eq]=${product.id}&filter[owner][_eq]=$CURRENT_USER`
      );
      const checkData = await checkRes.json();

      if (checkData.data && checkData.data.length > 0) {
        // ✅ มีอยู่แล้ว -> เอาของเดิม + ของใหม่ (Accumulate)
        const existingItem = checkData.data[0];
        const newQty = existingItem.quantity + quantity; // บวกทบ

        await apiFetch(`/items/cart_detail/${existingItem.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ quantity: newQty })
        });
        
        setAlertMessage(`เพิ่มสินค้าจำนวน ${quantity} ชิ้น เรียบร้อยแล้ว`);

      } else {
        // ยังไม่มี -> สร้างใหม่
        await apiFetch(`/items/cart_detail`, {
          method: 'POST',
          body: JSON.stringify({
            product: product.id,
            quantity: quantity
          })
        });

        setAlertMessage(`เพิ่มสินค้า ${quantity} ชิ้น ลงในตะกร้าเรียบร้อย`);
      }
      window.dispatchEvent(new Event('cart-updated'));

    } catch (error) {
      console.error("Add to cart error:", error);
      setAlertMessage("เกิดข้อผิดพลาดในการเพิ่มสินค้า");
    } finally {
      setAddingToCart(false);
    }
  };

  const handlePrev = () => setCurrentIndex((prev) => prev === 0 ? galleryImages.length - 1 : prev - 1);
  const handleNext = () => setCurrentIndex((prev) => prev === galleryImages.length - 1 ? 0 : prev + 1);
  const handleQuantityChange = (delta) => setQuantity((prev) => (prev + delta < 1 ? 1 : prev + delta));
  const handleProductSelect = (p) => { navigate(`/product/${p.id}`); window.scrollTo(0, 0); };

  if (loading) return <div className="loading-state">กำลังโหลดข้อมูล...</div>;
  if (!product) return null;

  const isOutOfStock = product.status === 'out_of_stock';
  const mainImage = galleryImages[currentIndex];

  return (
    <div className="product-detail-page">
      {/* 🔥 แสดง AlertBanner เมื่อมีข้อความ */}
      {alertMessage && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999 }}>
          <AlertBanner message={alertMessage} onClose={() => setAlertMessage(null)} />
        </div>
      )}

      <div className="product-main-layout">
        
        {/* Left: Gallery */}
        <div className="left-column-gallery">
          <div className="main-image-frame">
            <img src={mainImage} alt={product.name} className="main-img-display" onError={(e) => { e.target.src = 'https://via.placeholder.com/500?text=Image+Error'; }} />
            {isOutOfStock && <div className="out-of-stock-badge">สินค้าหมด</div>}
          </div>
          {galleryImages.length > 1 && (
            <div className="thumbnails-container">
              <button className="nav-arrow left" onClick={handlePrev}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg></button>
              <div className="thumbnail-scroll-area" ref={scrollRef}>
                {galleryImages.map((img, idx) => (
                  <div key={idx} className={`thumb-card ${idx === currentIndex ? 'active' : ''}`} onClick={() => setCurrentIndex(idx)}>
                    <img src={img} alt={`thumb-${idx}`} />
                  </div>
                ))}
              </div>
              <button className="nav-arrow right" onClick={handleNext}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg></button>
            </div>
          )}
        </div>

        {/* Right: Info */}
        <div className="right-column-info">
          <div className="brand-name">{product.brand_name || '-'}</div>
          <h1 className="product-name-title">{product.name}</h1>
          <div className="product-tags-row">
            {Array.isArray(product.suitable_skin_type) && product.suitable_skin_type.map((skinType, index) => (
                <span key={index} className="tag-pill">{skinTypeOptions[skinType] || skinType}</span>
            ))}
          </div>
          <div className="product-price-display">{product.price.toLocaleString('en-US', { minimumFractionDigits: 2 })} Baht</div>

          <div className="actions-wrapper">
            <div className="quantity-selector">
              <span className="qty-label-top">จำนวน</span>
              <div className="qty-buttons">
                <button onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </button>
                <span className="qty-number">{quantity}</span>
                <button onClick={() => handleQuantityChange(1)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </button>
              </div>
            </div>
            <button className={`add-to-cart-btn-black ${isOutOfStock || addingToCart ? 'disabled' : ''}`} onClick={() => !isOutOfStock && !addingToCart && handleAddToCart()} disabled={isOutOfStock || addingToCart}>
              {isOutOfStock ? 'สินค้าหมด' : addingToCart ? 'กำลังเพิ่ม...' : (
                <><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 8 }}><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>เพิ่มในถุงชอปปิง</>
              )}
            </button>
          </div>

          <div className="divider-line"></div>
          <div className="description-blocks">
            <div className="desc-item"><div className="wysiwyg-content" dangerouslySetInnerHTML={{ __html: product.description || '-' }} /></div>
            {product.ingredientsDisplay && product.ingredientsDisplay !== '-' && (
                <div className="desc-item"><h3>ส่วนประกอบ</h3><p>{product.ingredientsDisplay}</p></div>
            )}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {skinRecommendations.length > 0 && (
        <div className="related-section" style={{marginBottom: '40px', background: '#FFF5F4', padding: '30px', borderRadius: '16px'}}>
          <div className="section-header-flex" style={{marginBottom: '20px'}}>
             <h2 className="related-title" style={{color: '#F1978C', margin: 0, display: 'flex', alignItems: 'center'}}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '10px' }}><path d="M12,2L9,9L2,12L9,15L12,22L15,15L22,12L15,9L12,2Z" /></svg>
                แนะนำพิเศษเพื่อคุณ ({skinTypeOptions[userSkinType] || userSkinType})
             </h2>
          </div>
          <div className="related-grid">{skinRecommendations.map((p) => (<ProductCard key={p.id} product={p} onClick={() => handleProductSelect(p)} />))}</div>
        </div>
      )}

      {relatedProducts.length > 0 && (
        <div className="related-section">
          <h2 className="related-title">สินค้าที่มีส่วนผสมคล้ายคลึงกัน</h2>
          <div className="related-grid">{relatedProducts.map((p) => (<ProductCard key={p.id} product={p} onClick={() => handleProductSelect(p)} />))}</div>
        </div>
      )}
    </div>
  );
}