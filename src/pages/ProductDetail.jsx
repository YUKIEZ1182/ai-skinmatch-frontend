import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/ProductDetail.css';
import ProductCard from '../components/ProductCard';
import AlertBanner from '../components/AlertBanner';
import { apiFetch, getProductById, getSimilarProducts } from '../utils/api'; 
import { mockProducts } from '../data/mockData';

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
  const [alertMessage, setAlertMessage] = useState(null);

  const mapProductData = (item) => ({
    id: item.id,
    name: item.name,
    price: Number(item.price), 
    originalPrice: item.originalPrice ? Number(item.originalPrice) : null,
    image: item.thumbnail ? `${API_URL}/assets/${item.thumbnail}` : (item.image || 'https://via.placeholder.com/300x300?text=No+Image'),
    brand: item.brand_name || item.brand || 'General', 
    suitable_skin_type: Array.isArray(item.suitable_skin_type) ? item.suitable_skin_type : (item.suitable_skin_type ? [item.suitable_skin_type] : []),
    status: item.status
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const mockedItem = mockProducts.find(p => String(p.id) === String(id));
        if (mockedItem) {
          setProduct({ ...mockedItem, price: Number(mockedItem.price), originalPrice: mockedItem.originalPrice ? Number(mockedItem.originalPrice) : null, brand_name: mockedItem.brand, suitable_skin_type: mockedItem.skinType || [] });
          setGalleryImages([mockedItem.image]);
          setLoading(false);
          return;
        }

        const item = await getProductById(id);
        if (item) {
          let images = [];
          if (item.illustration && item.illustration.length > 0) {
            images = item.illustration.map((img) => img.directus_files_id ? `${API_URL}/assets/${img.directus_files_id}` : null).filter(Boolean);
          }
          if (images.length === 0 && item.thumbnail) images = [`${API_URL}/assets/${item.thumbnail}`];
          if (images.length === 0) images = ['https://via.placeholder.com/500x500?text=No+Image'];

          const ingredientList = item.ingredients?.map((i) => i.ingredient_id?.name).filter(Boolean).join(', ') || '-';

          setProduct({ ...item, price: Number(item.price), originalPrice: null, ingredientsDisplay: ingredientList, suitable_skin_type: Array.isArray(item.suitable_skin_type) ? item.suitable_skin_type : (item.suitable_skin_type ? [item.suitable_skin_type] : []) });
          setGalleryImages(images);
          setCurrentIndex(0);
          setQuantity(1);
        }
      } catch (error) { console.error('Error fetching product:', error); } 
      finally { setLoading(false); }
    };
    if (id) fetchProduct();
  }, [id]);

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const json = await getSimilarProducts(id);
        if (json.data) setRelatedProducts(json.data.map(mapProductData));
      } catch (error) { console.error("Error loading similar products:", error); }
    };
    if (id) fetchRelated();
  }, [id]);

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

  const handlePrev = () => setCurrentIndex((prev) => prev === 0 ? galleryImages.length - 1 : prev - 1);
  const handleNext = () => setCurrentIndex((prev) => prev === galleryImages.length - 1 ? 0 : prev + 1);
  const handleQuantityChange = (delta) => setQuantity((prev) => (prev + delta < 1 ? 1 : prev + delta));
  const handleProductSelect = (p) => { navigate(`/product/${p.id}`); window.scrollTo(0, 0); };

  const handleAddToCart = async () => {
      if (product.originalPrice) {
        setAlertMessage({ text:"ขออภัย: ระบบส่วนลดกำลังอยู่ระหว่างการพัฒนา จึงยังไม่สามารถสั่งซื้อได้ในขณะนี้", type: "warning" });
        return;
      }

      const token = localStorage.getItem('access_token');
      if (!token) {
        setAlertMessage({ text: "กรุณาเข้าสู่ระบบก่อนทำการสั่งซื้อ", type: "warning" });
        return;
      }
  
      try {
        setAddingToCart(true);
        const stockRes = await apiFetch(`/items/product/${product.id}?fields=quantity`);
        const stockData = await stockRes.json();
        const availableStock = stockData.data?.quantity ?? 0;

        const checkRes = await apiFetch(`/items/cart_detail?filter[product][_eq]=${product.id}&filter[owner][_eq]=$CURRENT_USER`);
        const checkData = await checkRes.json();
        
        const existingItem = checkData.data && checkData.data.length > 0 ? checkData.data[0] : null;
        const currentQtyInCart = existingItem ? existingItem.quantity : 0;
        const totalNewQuantity = currentQtyInCart + quantity;

        if (totalNewQuantity > availableStock) {
          setAlertMessage({ text: `ไม่สามารถเพิ่มได้: คงเหลือในสต็อก ${availableStock} ชิ้น`, type: "warning" });
          return;
        }

        if (existingItem) {
          await apiFetch(`/items/cart_detail/${existingItem.id}`, { method: 'PATCH', body: JSON.stringify({ quantity: totalNewQuantity }) });
          setAlertMessage({ text: `อัปเดตตะกร้าเรียบร้อยแล้ว`, type: "success" });
        } else {
          await apiFetch(`/items/cart_detail`, { method: 'POST', body: JSON.stringify({ product: product.id, quantity: quantity }) });
          setAlertMessage({ text: `เพิ่มสินค้าลงในตะกร้าเรียบร้อย`, type: "success" });
        }
        window.dispatchEvent(new Event('cart-updated'));
      } catch (error) {
        console.error("Add to cart error:", error);
        setAlertMessage({ text: "เกิดข้อผิดพลาดในการเพิ่มสินค้า", type: "error" });
      } finally { setAddingToCart(false); }
  };

  if (loading) return <div className="loading-state">กำลังโหลดข้อมูล...</div>;
  if (!product) return null;

  // คืนค่า Logic สินค้าหมดที่ถูกต้อง
  const isOutOfStock = product.status === 'out_of_stock' || product.status === 'inactive' || (product.quantity <= 0 && product.status !== 'active');
  const discountPercent = product.originalPrice ? Math.floor(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  return (
    <div className="product-detail-page">
      <div className="product-main-layout">
        <div className="left-column-gallery">
          {/* คืนค่า UI กรอบรูปสินค้าหมด */}
          <div className={`main-image-frame ${isOutOfStock ? 'out-of-stock-mode' : ''}`}>
            {!isOutOfStock && product.originalPrice && discountPercent > 0 && (
                <div className="detail-discount-badge">SAVE {discountPercent}%</div>
            )}
            <img src={galleryImages[currentIndex]} alt={product.name} className="main-img-display" />
            {isOutOfStock && <div className="out-of-stock-center-overlay"><span>สินค้าหมด</span></div>}
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

        <div className="right-column-info">
          <div className="brand-name">{product.brand_name || product.brand || '-'}</div>
          <h1 className="product-name-title">{product.name}</h1>
          <div className="product-tags-row">
            {Array.isArray(product.suitable_skin_type) && product.suitable_skin_type.map((skinType, index) => (
                <span key={index} className="tag-pill">{skinTypeOptions[skinType] || skinType}</span>
            ))}
          </div>
          
          <div className="price-row-container">
            <span className="current-price-red">฿{product.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            {product.originalPrice && <span className="original-price-gray">฿{product.originalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>}
          </div>

          <div className="actions-wrapper">
            <div className="quantity-selector">
              <span className="qty-label-top">จำนวน</span>
              <div className="qty-buttons">
                <button onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1 || isOutOfStock}>
                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </button>
                <span className="qty-number">{quantity}</span>
                <button onClick={() => handleQuantityChange(1)} disabled={isOutOfStock}>
                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </button>
              </div>
            </div>
            <button className={`add-to-cart-btn-black ${isOutOfStock || addingToCart ? 'disabled' : ''}`} onClick={handleAddToCart} disabled={isOutOfStock || addingToCart}>
              {isOutOfStock ? 'สินค้าหมด' : addingToCart ? 'กำลังเพิ่ม...' : 'เพิ่มในถุงชอปปิง'}
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

      {/* แนะนำพิเศษเพื่อคุณ */}
      {skinRecommendations.length > 0 && (
        <div className="related-section special-rec">
          <h2 className="related-title">แนะนำพิเศษเพื่อคุณ ({skinTypeOptions[userSkinType] || userSkinType})</h2>
          <div className="related-grid">{skinRecommendations.map((p) => (<ProductCard key={p.id} product={p} onClick={() => handleProductSelect(p)} />))}</div>
        </div>
      )}

      {relatedProducts.length > 0 && (
        <div className="related-section">
          <h2 className="related-title">สินค้าที่คล้ายกัน</h2>
          <div className="related-grid">{relatedProducts.map((p) => (<ProductCard key={p.id} product={p} onClick={() => handleProductSelect(p)} />))}</div>
        </div>
      )}

      {/* แจ้งเตือนลอยมุมจอ */}
      {alertMessage && (
        <div className="alert-banner-wrapper">
          <AlertBanner message={alertMessage} onClose={() => setAlertMessage(null)} />
        </div>
      )}
    </div>
  );
}