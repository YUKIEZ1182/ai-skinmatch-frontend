// src/pages/ProductDetail.jsx
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  const [isMockProduct, setIsMockProduct] = useState(false);

  const [loading, setLoading] = useState(true);
  const [galleryImages, setGalleryImages] = useState([]);

  const [relatedProducts, setRelatedProducts] = useState([]);
  const [skinRecommendations, setSkinRecommendations] = useState([]);
  const [userSkinType, setUserSkinType] = useState(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);

  // ---------- helpers ----------
  const mapProductData = (item) => ({
    id: item.id,
    name: item.name,
    price: Number(item.price),
    originalPrice: item.originalPrice ? Number(item.originalPrice) : null,
    image: item.thumbnail
      ? `${API_URL}/assets/${item.thumbnail}`
      : item.image || 'https://via.placeholder.com/300x300?text=No+Image',
    brand: item.brand_name || item.brand || 'General',
    suitable_skin_type: Array.isArray(item.suitable_skin_type)
      ? item.suitable_skin_type
      : item.suitable_skin_type
        ? [item.suitable_skin_type]
        : [],
    status: item.status,
    stock: item.stock,
  });

  const isOutOfStock = (p) => {
    const status = String(p?.status || '').toLowerCase();
    const stock = Number(p?.stock ?? 999999);
    return status === 'out_of_stock' || status === 'inactive' || stock <= 0;
  };

  const oos = useMemo(() => isOutOfStock(product), [product]);

  const stockLeft = useMemo(() => {
  const raw = product?.stock;
  if (raw === null || raw === undefined || raw === '') return null;

  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  return Math.max(0, Math.floor(n));
}, [product?.stock]);

  const discountPercent = useMemo(() => {
    if (!product?.originalPrice) return 0;
    const op = Number(product.originalPrice);
    const cp = Number(product.price);
    if (!op || op <= 0) return 0;
    return Math.floor(((op - cp) / op) * 100);
  }, [product]);

  const mainImage = useMemo(() => galleryImages[currentIndex], [galleryImages, currentIndex]);

  // ---------- scroll top ----------
  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }, [id, loading]);

  // ---------- load product (mock only if id exists in mockProducts) ----------
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);

        const mockedItem = mockProducts.find((p) => String(p.id) === String(id));
        if (mockedItem) {
          setIsMockProduct(true);
          setProduct({
            ...mockedItem,
            price: Number(mockedItem.price),
            originalPrice: mockedItem.originalPrice ? Number(mockedItem.originalPrice) : null,
            brand_name: mockedItem.brand,
            suitable_skin_type: mockedItem.skinType || [],
            status: mockedItem.status ?? (Number(mockedItem.stock) <= 0 ? 'out_of_stock' : 'active'),
            stock: mockedItem.stock,
            ingredientsDisplay: mockedItem.ingredients
              ? (Array.isArray(mockedItem.ingredients) ? mockedItem.ingredients : String(mockedItem.ingredients).split(','))
                  .map((x) => String(x).trim())
                  .filter(Boolean)
                  .join(', ')
              : '-',
          });
          setGalleryImages([mockedItem.image]);
          setCurrentIndex(0);
          setQuantity(1);
          setLoading(false);
          return;
        }

        setIsMockProduct(false);

        const item = await getProductById(id);
        if (item) {
          let images = [];

          if (item.illustration && item.illustration.length > 0) {
            images = item.illustration
              .map((img) => (img.directus_files_id ? `${API_URL}/assets/${img.directus_files_id}` : null))
              .filter(Boolean);
          }

          if (images.length === 0 && item.thumbnail) images = [`${API_URL}/assets/${item.thumbnail}`];
          if (images.length === 0) images = ['https://via.placeholder.com/500x500?text=No+Image'];

          const ingredientList =
            item.ingredients?.map((i) => i.ingredient_id?.name).filter(Boolean).join(', ') || '-';

          setProduct({
            ...item,
            price: Number(item.price),
            originalPrice: item.originalPrice ? Number(item.originalPrice) : null,
            ingredientsDisplay: ingredientList,
            suitable_skin_type: Array.isArray(item.suitable_skin_type)
              ? item.suitable_skin_type
              : item.suitable_skin_type
                ? [item.suitable_skin_type]
                : [],
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

  // ---------- similar products (API if possible, else mock fallback) ----------
  useEffect(() => {
    const normalizeTags = (arr) =>
      (Array.isArray(arr) ? arr : arr ? [arr] : [])
        .map((x) => String(x).trim().toLowerCase())
        .filter(Boolean);

    const getMockSimilar = () => {
      const current = mockProducts.find((p) => String(p.id) === String(id));
      if (!current) return [];

      const curTags = normalizeTags(current.skinType);
      const curIngs = normalizeTags(current.ingredients);

      const scored = mockProducts
        .filter((p) => String(p.id) !== String(id))
        .map((p) => {
          const pTags = normalizeTags(p.skinType);
          const pIngs = normalizeTags(p.ingredients);

          const tagHit = pTags.filter((t) => curTags.includes(t)).length;
          const ingHit = pIngs.filter((t) => curIngs.includes(t)).length;

          const score = ingHit * 3 + tagHit;
          return { p, score };
        })
        .sort((a, b) => b.score - a.score)
        .filter((x) => x.score > 0)
        .slice(0, 8) // ✅ เอาได้มากกว่า 2/4 ตามที่อยากได้
        .map(({ p }) => ({
          id: p.id,
          name: p.name,
          price: Number(p.price),
          originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
          image: p.image,
          brand: p.brand || 'Brand',
          suitable_skin_type: Array.isArray(p.skinType) ? p.skinType : [],
          stock: p.stock,
          status: p.status ?? (Number(p.stock) <= 0 ? 'out_of_stock' : 'active'),
        }));

      if (scored.length > 0) return scored;

      return mockProducts
        .filter((p) => String(p.id) !== String(id))
        .slice(0, 8)
        .map((p) => ({
          id: p.id,
          name: p.name,
          price: Number(p.price),
          originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
          image: p.image,
          brand: p.brand || 'Brand',
          suitable_skin_type: Array.isArray(p.skinType) ? p.skinType : [],
          stock: p.stock,
          status: p.status ?? (Number(p.stock) <= 0 ? 'out_of_stock' : 'active'),
        }));
    };

    const fetchRelated = async () => {
      if (!id) return;

      // ✅ ถ้าเป็น mock: ไม่เรียก API
      if (isMockProduct) {
        setRelatedProducts(getMockSimilar());
        return;
      }

      try {
        const json = await getSimilarProducts(id);
        const list = Array.isArray(json?.data) ? json.data : [];

        if (list.length === 0) {
          setRelatedProducts(getMockSimilar());
          return;
        }

        setRelatedProducts(list.map(mapProductData));
      } catch (error) {
        console.error('Error loading similar products:', error);
        setRelatedProducts(getMockSimilar());
      }
    };

    fetchRelated();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isMockProduct]);

  // ---------- skin recommendations (API) ----------
  useEffect(() => {
    const fetchSkinRecs = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      try {
        const userRes = await apiFetch('/users/me');
        if (!userRes.ok) return;

        const userData = await userRes.json();
        const skinType = userData?.data?.skin_type;

        if (skinType) {
          setUserSkinType(skinType);
          const thaiSkinType = skinTypeOptions[skinType] || skinType;

          const filterString =
            `filter[status][_eq]=active&filter[_or][0][suitable_skin_type][_icontains]=${skinType}` +
            `&filter[_or][1][suitable_skin_type][_icontains]=${thaiSkinType}`;
          const excludeCurrent = `&filter[id][_neq]=${id}`;

          const productRes = await apiFetch(
            `/items/product?limit=4&fields=id,name,price,thumbnail,brand_name,status,suitable_skin_type,stock&${filterString}${excludeCurrent}`
          );

          if (productRes.ok) {
            const json = await productRes.json();
            if (json?.data) setSkinRecommendations(json.data.map(mapProductData));
          }
        }
      } catch (error) {
        console.error(error);
      }
    };

    if (id) fetchSkinRecs();
  }, [id]);

  // ---------- gallery controls ----------
  const handlePrev = () => setCurrentIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  const handleNext = () => setCurrentIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));

  // ✅ จำกัด quantity ไม่ให้เกิน stock (ถ้ามี stock)
  const handleQuantityChange = (delta) => {
    setQuantity((prev) => {
      const next = prev + delta;
      if (next < 1) return 1;

      if (stockLeft !== null && Number.isFinite(stockLeft)) {
        return next > stockLeft ? stockLeft : next;
      }
      return next;
    });
  };

  const handleProductSelect = (p) => {
    navigate(`/product/${p.id}`);
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  };

  // ---------- add to cart ----------
  const handleAddToCart = async () => {
    if (isOutOfStock(product)) {
      setAlertMessage({ text: 'ขออภัย สินค้าหมด ไม่สามารถสั่งซื้อได้', type: 'warning' });
      return;
    }

    // ✅ กันซื้อเฉพาะ mock discount (เดโม่)
    if (isMockProduct && product?.originalPrice) {
      setAlertMessage({
        text: 'ขออภัย: ระบบส่วนลดกำลังอยู่ระหว่างการพัฒนา (ตัวอย่าง demo) จึงยังไม่สามารถสั่งซื้อได้ในขณะนี้',
        type: 'warning',
      });
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      setAlertMessage({ text: 'กรุณาเข้าสู่ระบบก่อนทำการสั่งซื้อ', type: 'warning' });
      return;
    }

    try {
      setAddingToCart(true);

      const checkRes = await apiFetch(
        `/items/cart_detail?filter[product][_eq]=${product.id}&filter[owner][_eq]=$CURRENT_USER`
      );
      const checkData = await checkRes.json();

      if (checkData?.data && checkData.data.length > 0) {
        const existingItem = checkData.data[0];
        await apiFetch(`/items/cart_detail/${existingItem.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ quantity: existingItem.quantity + quantity }),
        });
        setAlertMessage({ text: `เพิ่มสินค้าจำนวน ${quantity} ชิ้น เรียบร้อยแล้ว`, type: 'success' });
      } else {
        await apiFetch(`/items/cart_detail`, {
          method: 'POST',
          body: JSON.stringify({ product: product.id, quantity }),
        });
        setAlertMessage({ text: `เพิ่มสินค้า ${quantity} ชิ้น ลงในตะกร้าเรียบร้อย`, type: 'success' });
      }

      window.dispatchEvent(new Event('cart-updated'));
    } catch (error) {
      console.error('Add to cart error:', error);
      setAlertMessage({ text: 'เกิดข้อผิดพลาดในการเพิ่มสินค้า', type: 'error' });
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) return <div className="loading-state">กำลังโหลดข้อมูล.</div>;
  if (!product) return null;

  return (
    <div className="product-detail-page">
      {alertMessage && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999 }}>
          <AlertBanner message={alertMessage} onClose={() => setAlertMessage(null)} />
        </div>
      )}

      <div className="product-main-layout">
        <div className="left-column-gallery">
          <div className="main-image-frame" style={{ position: 'relative' }}>
            {/* ✅ โชว์ส่วนลดได้แม้ oos */}
            {product.originalPrice && discountPercent > 0 && (
              <div className="detail-discount-badge">SAVE {discountPercent}%</div>
            )}

            <img
              src={mainImage}
              alt={product.name}
              className={`main-img-display ${oos ? 'is-oos' : ''}`}
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/500?text=Image+Error';
              }}
            />

            {/* ✅ OUT OF STOCK pill กลางรูป */}
            {oos && (
              <div className="pd-oos-overlay" aria-hidden="true">
                <div className="pd-oos-pill">สินค้าหมด</div>
              </div>
            )}
          </div>

          {galleryImages.length > 1 && (
            <div className="thumbnails-container">
              <button className="nav-arrow left" onClick={handlePrev} type="button" aria-label="รูปก่อนหน้า">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>

              <div className="thumbnail-scroll-area" ref={scrollRef}>
                {galleryImages.map((img, idx) => (
                  <div
                    key={`${img}-${idx}`}
                    className={`thumb-card ${idx === currentIndex ? 'active' : ''}`}
                    onClick={() => setCurrentIndex(idx)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setCurrentIndex(idx);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`เลือกภาพที่ ${idx + 1}`}
                  >
                    <img src={img} alt={`thumb-${idx}`} />
                  </div>
                ))}
              </div>

              <button className="nav-arrow right" onClick={handleNext} type="button" aria-label="รูปถัดไป">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
          )}
        </div>

        <div className="right-column-info">
          <div className="brand-name">{product.brand_name || product.brand || '-'}</div>
          <h1 className="product-name-title">{product.name}</h1>

          <div className="product-tags-row">
            {Array.isArray(product.suitable_skin_type) &&
              product.suitable_skin_type.map((skinType, index) => (
                <span key={`${skinType}-${index}`} className="tag-pill">
                  {skinTypeOptions[skinType] || skinType}
                </span>
              ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', margin: '20px 0 10px 0' }}>
            <div
              className="product-price-display"
              style={{ color: product.originalPrice ? '#FF2D55' : '#000', fontSize: '2rem', fontWeight: '700' }}
            >
              ฿ {Number(product.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>

            {product.originalPrice && (
              <div style={{ textDecoration: 'line-through', color: '#9CA3AF', fontSize: '1.2rem', fontWeight: '500' }}>
                ฿ {Number(product.originalPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            )}
          </div>


          <div className="actions-wrapper">
            <div className="quantity-selector">
              <span className="qty-label-top">จำนวน</span>
              <div className="qty-buttons">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1 || oos}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  aria-label="ลดจำนวน"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>

                <span className="qty-number">{quantity}</span>

                <button
                  type="button"
                  onClick={() => handleQuantityChange(1)}
                  disabled={oos || (stockLeft !== null && quantity >= stockLeft)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  aria-label="เพิ่มจำนวน"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
              </div>
            </div>

            {/* ✅ กันซื้อ */}
            <button
              type="button"
              className={`add-to-cart-btn-black ${oos || addingToCart ? 'disabled' : ''}`}
              onClick={() => !oos && !addingToCart && handleAddToCart()}
              disabled={oos || addingToCart}
            >
              {oos ? (
                'สินค้าหมด'
              ) : addingToCart ? (
                'กำลังเพิ่ม...'
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 8 }}>
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                  </svg>
                  เพิ่มในถุงชอปปิง
                </>
              )}
            </button>
          </div>

          <div className="divider-line"></div>

          <div className="description-blocks">
            <div className="desc-item">
              <div className="wysiwyg-content" dangerouslySetInnerHTML={{ __html: product.description || '-' }} />
            </div>

            {product.ingredientsDisplay && product.ingredientsDisplay !== '-' && (
              <div className="desc-item">
                <h3>ส่วนประกอบ</h3>
                <p>{product.ingredientsDisplay}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {skinRecommendations.length > 0 && (
        <div className="related-section" style={{ marginBottom: '40px', background: '#FFF5F4', padding: '30px', borderRadius: '16px' }}>
          <div className="section-header-flex" style={{ marginBottom: '20px' }}>
            <h2 className="related-title" style={{ color: '#F1978C', margin: 0, display: 'flex', alignItems: 'center' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '10px' }}>
                <path d="M12,2L9,9L2,12L9,15L12,22L15,15L22,12L15,9L12,2Z" />
              </svg>
              แนะนำพิเศษเพื่อคุณ ({skinTypeOptions[userSkinType] || userSkinType})
            </h2>
          </div>

          <div className="related-grid">
            {skinRecommendations.map((p) => (
              <ProductCard key={p.id} product={p} onClick={() => handleProductSelect(p)} />
            ))}
          </div>
        </div>
      )}

      {relatedProducts.length > 0 && (
        <div className="related-section">
          <h2 className="related-title">สินค้าที่มีส่วนผสมคล้ายคลึงกัน</h2>
          <div className="related-grid">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} onClick={() => handleProductSelect(p)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
