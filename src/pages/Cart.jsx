import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Cart.css';
import { apiFetch, deleteCartDetail, getSimilarProducts } from '../utils/api';
import AlertBanner from '../components/AlertBanner';

const API_URL = import.meta.env.VITE_DIRECTUS_PUBLIC_URL;

export default function CartPage() {
  const navigate = useNavigate();
  
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recommendationsMap, setRecommendationsMap] = useState({});
  const [selectedIds, setSelectedIds] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [alertInfo, setAlertInfo] = useState(null);

  const showAlert = (message, type = 'warning') => {
    setAlertInfo({ message, type });
  };

  const fetchCart = async () => {
    try {
      const response = await apiFetch(
        `/items/cart_detail?fields=id,quantity,product.id,product.name,product.price,product.brand_name,product.status,product.quantity,product.illustration.directus_files_id,product.thumbnail&filter[owner][_eq]=$CURRENT_USER`
      );
      
      if (!response.ok) throw new Error('Failed to fetch cart');
      
      const json = await response.json();
      const items = json.data.map(item => {
        const product = item.product || {};
        const imgId =  product.thumbnail || product.illustration?.[0]?.directus_files_id; 
        
        return {
          id: item.id,
          productId: product.id,
          name: product.name,
          price: Number(product.price) || 0,
          brand: product.brand_name || 'Brand',
          status: product.status,
          stock: product.quantity !== null && product.quantity !== undefined ? Number(product.quantity) : 0, 
          quantity: item.quantity,
          image: imgId ? `${API_URL}/assets/${imgId}` : 'https://via.placeholder.com/80',
        };
      });

      setCartItems(items);
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  useEffect(() => {
    cartItems.forEach(item => {
      const isOutOfStock = item.status === 'inactive' || item.stock <= 0;
      if (isOutOfStock && !recommendationsMap[item.productId]) {
        fetchSimilarProducts(item.productId);
      }
    });
  }, [cartItems]);

  const fetchSimilarProducts = async (productId) => {
    try {
      const json = await getSimilarProducts(productId);
      if (json.data) {
        const mappedRecs = json.data.map(p => ({
          id: p.id,
          name: p.name,
          brand: p.brand_name || 'Brand',
          price: Number(p.price) || 0,
          image: p.thumbnail ? `${API_URL}/assets/${p.thumbnail}` : 'https://via.placeholder.com/60'
        }));
        setRecommendationsMap(prev => ({ ...prev, [productId]: mappedRecs.slice(0, 3) }));
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    }
  };

  const handleRemoveItem = async (cartId) => {
    if (!cartId) return;
    if (!confirm("ต้องการลบสินค้าออกจากตะกร้า?")) return;

    try {
      await deleteCartDetail(cartId);
      setCartItems(prev => prev.filter(item => item.id !== cartId));
      setSelectedIds(prev => prev.filter(id => id !== cartId));
      window.dispatchEvent(new Event('cart-updated'));
      showAlert("ลบสินค้าออกจากตะกร้าแล้ว", "warning");
    } catch (error) {
      console.error("Error removing item:", error);
      showAlert("เกิดข้อผิดพลาดในการลบสินค้า", "error");
    }
  };

  const handleUpdateQuantity = async (cartId, delta) => {
    const item = cartItems.find(i => i.id === cartId);
    if (!item) return;

    const newQty = item.quantity + delta;

    if (delta > 0) { 
        if (newQty > item.stock) {
            showAlert(`สินค้ามีจำกัด เพิ่มได้สูงสุด ${item.stock} ชิ้น`, "warning");
            return;
        }
    }

    if (newQty < 1) return;

    setCartItems(prev => prev.map(i => i.id === cartId ? { ...i, quantity: newQty } : i));

    try {
      await apiFetch(`/items/cart_detail/${cartId}`, {
        method: 'PATCH',
        body: JSON.stringify({ quantity: newQty })
      });
    } catch (error) {
      console.error("Error updating quantity:", error);
      fetchCart();
    }
  };

  const handleAddToCartRec = async (productRec) => {
    try {
      const checkRes = await apiFetch(`/items/cart_detail?filter[product][_eq]=${productRec.id}&filter[owner][_eq]=$CURRENT_USER`);
      const checkData = await checkRes.json();

      if (checkData.data && checkData.data.length > 0) {
        const existing = checkData.data[0];
        await apiFetch(`/items/cart_detail/${existing.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ quantity: existing.quantity + 1 })
        });
      } else {
        await apiFetch(`/items/cart_detail`, {
          method: 'POST',
          body: JSON.stringify({ product: productRec.id, quantity: 1 })
        });
      }
      showAlert(`เพิ่ม "${productRec.name}" ลงในตะกร้าแล้ว`, "success");
      fetchCart();
      window.dispatchEvent(new Event('cart-updated'));
    } catch (error) {
      console.error("Error adding recommendation:", error);
      showAlert("เกิดข้อผิดพลาดในการเพิ่มสินค้า", "error");
    }
  };

  useEffect(() => {
    if (loading || isInitialized || cartItems.length === 0) return;
    const availableItems = cartItems.filter(item => item.status !== 'inactive' && item.stock > 0);
    const availableIds = availableItems.map(item => item.id);
    setSelectedIds(availableIds);
    setIsInitialized(true);
  }, [loading, cartItems, isInitialized]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const availableItems = cartItems.filter(item => item.status !== 'inactive' && item.stock > 0);
      setSelectedIds(availableItems.map(item => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(itemId => itemId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const selectedItems = cartItems.filter(item => selectedIds.includes(item.id));
  const totalPrice = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const handleCheckout = () => {
    if (selectedIds.length === 0) {
        showAlert("กรุณาเลือกสินค้าอย่างน้อย 1 รายการ", "warning");
        return;
    }
    navigate('/checkout', { 
        state: { 
          selectedItems, 
          totalPrice 
        } 
    });
  };

  const goToProduct = (productId) => {
      navigate(`/product/${productId}`);
  };

  const availableItemsCount = cartItems.filter(item => item.status !== 'inactive' && item.stock > 0).length;
  const isAllSelected = availableItemsCount > 0 && selectedIds.length === availableItemsCount;

  if (loading) return <div className="cart-page-container">Loading...</div>;

  return (
    <div className="cart-page-container">
      
      {/* ✅ แสดง AlertBanner โดยส่งทั้ง message และ type */}
      {alertInfo && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999 }}>
          <AlertBanner 
            message={alertInfo.message} 
            type={alertInfo.type}
            onClose={() => setAlertInfo(null)} 
          />
        </div>
      )}

      <div className="cart-layout">
        <div className="cart-list-container">
          <div className="cart-header-row">
            <div className="col-checkbox-header">
              <input type="checkbox" checked={isAllSelected} onChange={handleSelectAll} className="custom-checkbox" />
              <span className="header-label">ทั้งหมด</span>
            </div>
            <div className="col-product">รายการสินค้า</div>
            <div className="col-price text-center">ราคา</div>
            <div className="col-qty text-center">จำนวน</div>
            <div className="col-action text-center">แก้ไข</div>
          </div>
          
          {cartItems.length === 0 && <div style={{padding: '40px', textAlign:'center'}}>ไม่มีสินค้าในตะกร้า</div>}

          {cartItems.map((item) => {
            const isOutOfStock = item.status === 'inactive' || item.stock <= 0;
            const itemRecs = recommendationsMap[item.productId] || [];

            return (
              <div key={item.id} className={`cart-item-group ${isOutOfStock ? 'group-out-of-stock' : ''}`}>
                <div className="cart-item-row">
                  <div className="col-checkbox">
                    <input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => handleSelectOne(item.id)} className="custom-checkbox" disabled={isOutOfStock}/>
                  </div>
                  
                  <div className="col-img" onClick={() => goToProduct(item.productId)} style={{cursor: 'pointer'}}>
                    <div className="img-wrapper">
                      <img src={item.image} alt={item.name} onError={(e) => e.target.src='https://via.placeholder.com/80'} />
                    </div>
                  </div>

                  <div className="col-info" onClick={() => goToProduct(item.productId)} style={{cursor: 'pointer'}}>
                    <span className="cart-item-brand">{item.brand}</span>
                    <span className="cart-item-name">{item.name}</span>
                    {!isOutOfStock && item.stock > 0 && (
                        <div style={{fontSize:'0.85rem', color:'#e67e22', marginTop:'4px', fontWeight:'500'}}>
                            เหลือสินค้า {item.stock} ชิ้น
                        </div>
                    )}
                  </div>

                  <div className="col-price">
                    <div className="price-group" style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
                        <span className="item-price">{item.price.toLocaleString('en-US', {minimumFractionDigits: 2})} Baht</span>
                        {isOutOfStock && <span className="stock-warning">สินค้าหมด</span>}
                    </div>
                  </div>
                  <div className="col-qty">
                    <div className={`qty-simple ${isOutOfStock ? 'hidden-qty' : ''}`}>
                      <button className="qty-btn" onClick={() => handleUpdateQuantity(item.id, -1)}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                      </button>
                      <span>{item.quantity}</span>
                      
                      <button 
                        className="qty-btn" 
                        onClick={() => handleUpdateQuantity(item.id, 1)}
                        style={{ cursor: 'pointer' }} 
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                      </button>
                    </div>
                  </div>
                  <div className="col-action">
                    <button className="delete-btn" onClick={() => handleRemoveItem(item.id)}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999"strokeWidth="2" strokeLinecap="round"  strokeLinejoin="round">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2V6"></path>
                        <path d="M8 6V4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                </div>

                {isOutOfStock && itemRecs.length > 0 && (
                  <div className="recommendation-section">
                    <h4 className="rec-header">สินค้าหมด! แนะนำสินค้าใกล้เคียงในหมวดเดียวกัน:</h4>
                    <div className="rec-grid">
                      {itemRecs.map(rec => (
                        <div 
                            key={rec.id} 
                            className="rec-card" 
                            onClick={() => goToProduct(rec.id)} 
                            style={{cursor: 'pointer'}}
                        >
                           <div className="rec-img-box">
                             <img src={rec.image} alt={rec.name} onError={(e) => e.target.src='https://via.placeholder.com/60'} />
                           </div>
                           <div className="rec-info-col">
                              <span className="rec-brand">{rec.brand}</span>
                              <span className="rec-name">{rec.name}</span>
                           </div>
                           <div className="rec-price-col">
                              <span className="rec-price">{rec.price.toLocaleString('en-US', {minimumFractionDigits: 2})} Baht</span>
                           </div>
                           <button 
                                className="rec-add-btn-black" 
                                onClick={(e) => {
                                    e.stopPropagation(); 
                                    handleAddToCartRec(rec);
                                }}
                           >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                           </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="cart-summary-container">
          <div className="summary-box">
            <h3 className="summary-title">รายการสินค้า</h3>
            <div className="summary-row">
              <span>สินค้าที่เลือก</span>
              <span>{selectedIds.length} รายการ</span>
            </div>
            <div className="summary-row total-row">
              <span>ยอดรวม</span>
              <div className="total-group">
                <span className="total-price">{totalPrice.toLocaleString('en-US', {minimumFractionDigits: 2})} Baht</span>
                <span className="tax-note">(ไม่รวมค่าจัดส่ง)</span>
              </div>
            </div>
            <button className="checkout-btn" onClick={handleCheckout}>ดำเนินการชำระเงิน</button>
          </div>
        </div>
      </div>
    </div>
  );
}