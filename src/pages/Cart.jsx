// src/pages/Cart.jsx
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Cart.css";
import AlertBanner from "../components/AlertBanner";
import { apiFetch, deleteCartDetail, getSimilarProducts } from "../utils/api";
import { mockProducts } from "../data/mockData";

const API_URL = import.meta.env.VITE_DIRECTUS_PUBLIC_URL;
const MOCK_KEY = "mock_cart";

/* -----------------------------
   MOCK CART STORAGE
----------------------------- */
const readMockCart = () => {
  try {
    const raw = localStorage.getItem(MOCK_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch (err) {
    console.error("readMockCart error:", err);
    return [];
  }
};

const writeMockCart = (arr) => {
  try {
    localStorage.setItem(MOCK_KEY, JSON.stringify(arr));
  } catch (err) {
    console.error("writeMockCart error:", err);
  }
};

const updateMockQtyStorage = (productId, newQty) => {
  const pid = String(productId);
  const arr = readMockCart();
  const idx = arr.findIndex((x) => String(x?.productId ?? x?.id) === pid);
  if (idx < 0) return;

  arr[idx] = { ...arr[idx], quantity: newQty };
  writeMockCart(arr);
  window.dispatchEvent(new Event("cart-updated"));
};

const removeMockItemStorage = (productId) => {
  const pid = String(productId);
  const next = readMockCart().filter((x) => String(x?.productId ?? x?.id) !== pid);
  writeMockCart(next);
  window.dispatchEvent(new Event("cart-updated"));
};

/* -----------------------------
   MOCK SIMILAR HELPERS
----------------------------- */
const normalizeTags = (arr) =>
  (Array.isArray(arr) ? arr : arr ? [arr] : [])
    .map((x) => String(x).trim().toLowerCase())
    .filter(Boolean);

const getMockSimilarForCart = (productId) => {
  const current = mockProducts.find((p) => String(p.id) === String(productId));
  if (!current) return [];

  const curTags = normalizeTags(current.skinType);
  const curIngs = normalizeTags(current.ingredients);

  return mockProducts
    .filter((p) => String(p.id) !== String(productId))
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
    .slice(0, 12)
    .map(({ p }) => ({
      id: p.id,
      name: p.name,
      brand: p.brand || "Brand",
      price: Number(p.price) || 0,
      thumbnail: null,
      image: p.image || "https://via.placeholder.com/60",
      source: "mock",
    }));
};

/* -----------------------------
   SVG ICON
----------------------------- */
const PlusIcon = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...props}>
    <path
      d="M12 5v14M5 12h14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
    />
  </svg>
);

export default function CartPage() {
  const navigate = useNavigate();

  const [apiCartItems, setApiCartItems] = useState([]);
  const [mockCartItems, setMockCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [recommendationsMap, setRecommendationsMap] = useState({});
  const [selectedUiIds, setSelectedUiIds] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const [alertInfo, setAlertInfo] = useState(null);

  // delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [pendingDeleteItem, setPendingDeleteItem] = useState(null);

  const showAlert = (message, type = "warning") => setAlertInfo({ message, type });

  // กันยิงซ้ำ
  const requestedSimilarRef = useRef(new Set());
  const fetchingRef = useRef(false);

  /* -----------------------------
     OUT OF STOCK CHECKER
  ----------------------------- */
  const isItemOutOfStock = (item) => {
    const status = String(item?.status || "active").toLowerCase();
    const stock = item?.stock === null || item?.stock === undefined ? 999999 : Number(item.stock);

    const legacyInactive = status === "inactive";
    const statusOos = status === "out_of_stock";
    const stockZero = Number.isFinite(stock) ? stock <= 0 : false;
    return legacyInactive || statusOos || stockZero;
  };

  /* -----------------------------
     LOAD MOCK CART (sync กับ mockProducts)
  ----------------------------- */
  const loadMockCart = useCallback(() => {
    const raw = readMockCart()
      .filter((x) => x && (x.productId != null || x.id != null))
      .map((x) => {
        const productId = String(x.productId ?? x.id);
        const mp = mockProducts.find((p) => String(p.id) === productId);

        const liveStock = mp?.stock ?? x.stock ?? null;
        const liveStatus = mp?.status ?? (Number(liveStock ?? 999999) <= 0 ? "out_of_stock" : "active");

        return {
          uiId: `mock:${productId}`,
          source: "mock",
          rowId: null,
          productId,

          name: mp?.name ?? x.name ?? "Unknown",
          price: Number(mp?.price ?? x.price) || 0,
          originalPrice: mp?.originalPrice
            ? Number(mp.originalPrice)
            : x.originalPrice
            ? Number(x.originalPrice)
            : null,
          brand: mp?.brand ?? x.brand ?? "Brand",

          status: liveStatus,
          stock: liveStock,

          quantity: Number(x.quantity) || 1,
          image: mp?.image ?? x.image ?? "https://via.placeholder.com/80",
          date_created: null,
        };
      });

    setMockCartItems(raw);

    writeMockCart(
      raw.map((it) => ({
        productId: it.productId,
        id: it.productId,
        name: it.name,
        price: it.price,
        originalPrice: it.originalPrice,
        brand: it.brand,
        image: it.image,
        stock: it.stock,
        status: it.status,
        quantity: it.quantity,
      }))
    );
  }, []);

  /* -----------------------------
     FETCH API CART
  ----------------------------- */
  const fetchApiCart = useCallback(async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setApiCartItems([]);
      return;
    }

    try {
      const response = await apiFetch(
        "/items/cart_detail?fields=" +
          [
            "id",
            "quantity",
            "date_created",
            "product.id",
            "product.name",
            "product.price",
            "product.brand_name",
            "product.status",
            "product.stock",
            "product.quantity",
            "product.illustration.directus_files_id",
            "product.thumbnail",
            "product.originalPrice",
          ].join(",") +
          "&filter[owner][_eq]=$CURRENT_USER"
      );

      if (!response.ok) {
        setApiCartItems([]);
        return;
      }

      const json = await response.json();

      const items = (json.data || []).map((row) => {
        const p = row.product || {};
        const imgId = p.thumbnail || p.illustration?.[0]?.directus_files_id;

        const rowId = String(row.id);
        const productId = String(p.id);

        const rawStock = p.stock ?? p.quantity ?? null;
        const mappedStock =
          rawStock === null || rawStock === undefined || rawStock === "" ? null : Number(rawStock);

        return {
          uiId: `api:${rowId}`,
          source: "api",
          rowId,
          productId,

          name: p.name || "Unknown",
          price: Number(p.price) || 0,
          originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
          brand: p.brand_name || "Brand",

          status: p.status || "active",
          stock: Number.isFinite(mappedStock) ? mappedStock : null,

          quantity: Number(row.quantity) || 1,
          image: imgId ? `${API_URL}/assets/${imgId}` : "https://via.placeholder.com/80",
          date_created: row.date_created || null,
        };
      });

      // (ยัง sort ภายในฝั่ง API ได้ แต่สุดท้ายเราจะแยก OOS ไปท้ายอยู่ดี)
      items.sort((a, b) => {
        const ad = a.date_created ? new Date(a.date_created).getTime() : 0;
        const bd = b.date_created ? new Date(b.date_created).getTime() : 0;
        return bd - ad;
      });

      setApiCartItems(items);
    } catch (err) {
      console.error(err);
      setApiCartItems([]);
    }
  }, []);

  const fetchCart = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    setLoading(true);
    await fetchApiCart();
    loadMockCart();
    setLoading(false);

    fetchingRef.current = false;
  }, [fetchApiCart, loadMockCart]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    const onUpdate = () => {
      fetchApiCart();
      loadMockCart();
    };
    window.addEventListener("cart-updated", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("cart-updated", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, [fetchApiCart, loadMockCart]);

  /* -----------------------------
     MERGE CART ITEMS (รวมก่อน)
  ----------------------------- */
  const mergedItems = useMemo(() => {
    return [...mockCartItems, ...apiCartItems];
  }, [mockCartItems, apiCartItems]);

  /* -----------------------------
     ✅ แยกของมี/ของหมด เพื่อให้ของหมดอยู่ล่างสุดเสมอ
  ----------------------------- */
  const availableItems = useMemo(() => {
    return mergedItems.filter((x) => !isItemOutOfStock(x));
  }, [mergedItems]);

  const outOfStockItems = useMemo(() => {
    return mergedItems.filter((x) => isItemOutOfStock(x));
  }, [mergedItems]);

  /* -----------------------------
     FETCH SIMILAR FOR OOS (both)
  ----------------------------- */
  useEffect(() => {
    outOfStockItems.forEach((item) => {
      const pid = String(item.productId);
      if (recommendationsMap[pid] || requestedSimilarRef.current.has(pid)) return;
      requestedSimilarRef.current.add(pid);

      if (item.source === "mock") {
        const recs = getMockSimilarForCart(pid);
        setRecommendationsMap((prev) => ({ ...prev, [pid]: recs }));
      } else {
        fetchSimilarProducts(pid);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outOfStockItems, recommendationsMap]);

  const fetchSimilarProducts = async (productId) => {
    try {
      const json = await getSimilarProducts(productId);
      const list = Array.isArray(json?.data) ? json.data : [];

      if (list.length > 0) {
        const mapped = list.map((p) => ({
          id: p.id,
          name: p.name,
          brand: p.brand_name || "Brand",
          price: Number(p.price) || 0,
          thumbnail: p.thumbnail || null,
          image: null,
          source: "api",
        }));

        setRecommendationsMap((prev) => ({
          ...prev,
          [productId]: mapped.slice(0, 12),
        }));
      }
    } catch (err) {
      console.error("fetchSimilarProducts error:", err);
      requestedSimilarRef.current.delete(String(productId));
    }
  };

  /* -----------------------------
     ✅ ADD REC TO CART
     - login: ยิง API ถ้า fail -> fallback เข้า mock
     - not login: mock +1
  ----------------------------- */
  const addToMockCart = (rec) => {
    const pid = String(rec.id);
    const cart = readMockCart();
    const idx = cart.findIndex((x) => String(x?.productId ?? x?.id) === pid);

    if (idx >= 0) {
      cart[idx] = { ...cart[idx], quantity: Number(cart[idx].quantity || 0) + 1 };
    } else {
      cart.push({
        productId: rec.id,
        id: rec.id,
        name: rec.name,
        price: Number(rec.price) || 0,
        quantity: 1,
        brand: rec.brand || "Brand",
        image: rec.thumbnail ? `${API_URL}/assets/${rec.thumbnail}` : rec.image || "https://via.placeholder.com/80",
        status: "active",
        stock: null,
        originalPrice: null,
      });
    }

    writeMockCart(cart);
    loadMockCart();
    window.dispatchEvent(new Event("cart-updated"));
  };

  const handleAddToCartRec = async (rec) => {
    const token = localStorage.getItem("access_token");

    // not login
    if (!token) {
      addToMockCart(rec);
      showAlert(`เพิ่ม "${rec.name}" ลงในตะกร้าแล้ว`, "success");
      return;
    }

    // login -> API
    try {
      const checkRes = await apiFetch(
        `/items/cart_detail?filter[product][_eq]=${rec.id}&filter[owner][_eq]=$CURRENT_USER`
      );

      // ถ้าเช็คพัง => fallback mock
      if (!checkRes.ok) {
        addToMockCart(rec);
        showAlert(`API มีปัญหา เพิ่ม "${rec.name}" แบบชั่วคราวลงตะกร้าแล้ว`, "warning");
        return;
      }

      const checkData = await checkRes.json();

      if (checkData?.data?.length > 0) {
        const existing = checkData.data[0];
        const patchRes = await apiFetch(`/items/cart_detail/${existing.id}`, {
          method: "PATCH",
          body: JSON.stringify({ quantity: (Number(existing.quantity) || 0) + 1 }),
        });

        if (!patchRes.ok) {
          addToMockCart(rec);
          showAlert(`API มีปัญหา เพิ่ม "${rec.name}" แบบชั่วคราวลงตะกร้าแล้ว`, "warning");
          return;
        }
      } else {
        const postRes = await apiFetch("/items/cart_detail", {
          method: "POST",
          body: JSON.stringify({ product: rec.id, quantity: 1 }),
        });

        if (!postRes.ok) {
          addToMockCart(rec);
          showAlert(`API มีปัญหา เพิ่ม "${rec.name}" แบบชั่วคราวลงตะกร้าแล้ว`, "warning");
          return;
        }
      }

      await fetchApiCart();
      window.dispatchEvent(new Event("cart-updated"));
      showAlert(`เพิ่ม "${rec.name}" ลงในตะกร้าแล้ว`, "success");
    } catch (err) {
      console.error("add rec error:", err);
      addToMockCart(rec);
      showAlert(`API มีปัญหา เพิ่ม "${rec.name}" แบบชั่วคราวลงตะกร้าแล้ว`, "warning");
    }
  };

  /* -----------------------------
     DELETE
  ----------------------------- */
  const openDeleteModal = (item) => {
    setPendingDeleteItem(item);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setPendingDeleteItem(null);
  };

  const confirmDelete = async () => {
    const item = pendingDeleteItem;
    if (!item) return;

    try {
      if (item.source === "mock") {
        removeMockItemStorage(item.productId);
        showAlert("ลบสินค้าออกจากตะกร้าแล้ว", "success");
        setMockCartItems((prev) => prev.filter((x) => x.uiId !== item.uiId));
        setSelectedUiIds((prev) => prev.filter((id) => id !== item.uiId));
        closeDeleteModal();
        return;
      }

      await deleteCartDetail(item.rowId);
      setApiCartItems((prev) => prev.filter((x) => x.uiId !== item.uiId));
      setSelectedUiIds((prev) => prev.filter((id) => id !== item.uiId));
      window.dispatchEvent(new Event("cart-updated"));
      showAlert("ลบสินค้าออกจากตะกร้าแล้ว", "success");
      closeDeleteModal();
    } catch (err) {
      console.error("remove error:", err);
      showAlert("เกิดข้อผิดพลาดในการลบสินค้า", "error");
      closeDeleteModal();
    }
  };

  /* -----------------------------
     UPDATE QTY
  ----------------------------- */
  const handleUpdateQuantity = async (item, delta) => {
    if (!item) return;

    if (isItemOutOfStock(item)) {
      showAlert("สินค้าหมด ไม่สามารถปรับจำนวนได้", "warning");
      return;
    }

    const newQty = (Number(item.quantity) || 1) + delta;
    if (newQty < 1) return;

    if (delta > 0 && item.stock !== null && item.stock !== undefined) {
      const stockN = Number(item.stock);
      if (Number.isFinite(stockN) && newQty > stockN) {
        showAlert(`สินค้ามีจำกัด เพิ่มได้สูงสุด ${stockN} ชิ้น`, "warning");
        return;
      }
    }

    if (item.source === "mock") {
      setMockCartItems((prev) => prev.map((x) => (x.uiId === item.uiId ? { ...x, quantity: newQty } : x)));
      updateMockQtyStorage(item.productId, newQty);
      return;
    }

    setApiCartItems((prev) => prev.map((x) => (x.uiId === item.uiId ? { ...x, quantity: newQty } : x)));

    try {
      const res = await apiFetch(`/items/cart_detail/${item.rowId}`, {
        method: "PATCH",
        body: JSON.stringify({ quantity: newQty }),
      });
      if (!res.ok) throw new Error("update qty failed");
      window.dispatchEvent(new Event("cart-updated"));
    } catch (err) {
      console.error("update qty error:", err);
      showAlert("อัปเดตจำนวนไม่สำเร็จ ลองใหม่อีกครั้ง", "error");
      fetchApiCart();
    }
  };

  /* -----------------------------
     INIT SELECTED (auto select available)
  ----------------------------- */
  useEffect(() => {
    if (loading || isInitialized) return;

    if (mergedItems.length === 0) {
      setSelectedUiIds([]);
      setIsInitialized(true);
      return;
    }

    const available = mergedItems.filter((x) => !isItemOutOfStock(x));
    setSelectedUiIds(available.map((x) => x.uiId));
    setIsInitialized(true);
  }, [loading, mergedItems, isInitialized]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const available = mergedItems.filter((x) => !isItemOutOfStock(x));
      setSelectedUiIds(available.map((x) => x.uiId));
    } else {
      setSelectedUiIds([]);
    }
  };

  const handleSelectOne = (uiId) => {
    setSelectedUiIds((prev) => (prev.includes(uiId) ? prev.filter((x) => x !== uiId) : [...prev, uiId]));
  };

  const selectedItems = mergedItems.filter((x) => selectedUiIds.includes(x.uiId));
  const totalPrice = selectedItems.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
    0
  );

  const handleCheckout = () => {
    if (selectedUiIds.length === 0) {
      showAlert("กรุณาเลือกสินค้าอย่างน้อย 1 รายการ", "warning");
      return;
    }

    const hasOos = selectedItems.some((it) => isItemOutOfStock(it));
    if (hasOos) {
      showAlert("มีสินค้าหมดในรายการที่เลือก กรุณาเลือกใหม่", "warning");
      return;
    }

    navigate("/checkout", { state: { selectedItems, totalPrice } });
  };

  const goToProduct = (item) => navigate(`/product/${item.productId}`);

  const availableItemsCount = mergedItems.filter((x) => !isItemOutOfStock(x)).length;
  const isAllSelected = availableItemsCount > 0 && selectedUiIds.length === availableItemsCount;

  if (loading) return <div className="cart-page-container">Loading...</div>;

  return (
    <div className="cart-page-container">
      {alertInfo && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999 }}>
          <AlertBanner message={alertInfo.message} type={alertInfo.type} onClose={() => setAlertInfo(null)} />
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

          {mergedItems.length === 0 && <div style={{ padding: "40px", textAlign: "center" }}>ไม่มีสินค้าในตะกร้า</div>}

          {/* ✅ ของที่ยังมีสต๊อก (อยู่บนเสมอ) */}
          {availableItems.map((item) => {
            const out = isItemOutOfStock(item);
            const itemRecs = recommendationsMap[item.productId] || [];

            return (
              <div key={item.uiId} className={`cart-item-group ${out ? "group-out-of-stock" : ""}`}>
                <div className="cart-item-row">
                  <div className="col-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedUiIds.includes(item.uiId)}
                      onChange={() => handleSelectOne(item.uiId)}
                      className="custom-checkbox"
                      disabled={out}
                    />
                  </div>

                  <div className="col-img" onClick={() => goToProduct(item)} style={{ cursor: "pointer" }}>
                    <div className="img-wrapper">
                      <img src={item.image} alt={item.name} onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/80")} />
                    </div>
                  </div>

                  <div className="col-info" onClick={() => goToProduct(item)} style={{ cursor: "pointer" }}>
                    <span className="cart-item-brand">{item.brand}</span>
                    <span className="cart-item-name">{item.name}</span>

                    {!out && Number.isFinite(Number(item.stock)) && Number(item.stock) > 0 && (
                      <div className="stock-left">เหลือสินค้า {Number(item.stock)} ชิ้น</div>
                    )}
                  </div>

                  <div className="col-price">
                    <div className="price-group">
                      <span className="item-price">
                        ฿{Number(item.price).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </span>
                      {out && <span className="stock-warning">สินค้าหมด</span>}
                    </div>
                  </div>

                  <div className="col-qty">
                    <div className={`qty-simple ${out ? "hidden-qty" : ""}`}>
                      <button className="qty-btn" onClick={() => handleUpdateQuantity(item, -1)} type="button" aria-label="ลดจำนวน">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                      </button>

                      <span>{item.quantity}</span>

                      <button className="qty-btn" onClick={() => handleUpdateQuantity(item, 1)} type="button" aria-label="เพิ่มจำนวน">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="5" x2="12" y2="19"></line>
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="col-action">
                    <button className="delete-btn" onClick={() => openDeleteModal(item)} type="button" aria-label="ลบสินค้า">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2V6"></path>
                        <path d="M8 6V4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* RECOMMEND (ปกติของยังไม่หมดจะไม่เข้าเงื่อนไขนี้อยู่แล้ว แต่เผื่อ status มั่ว) */}
                {out && itemRecs.length > 0 && (
                  <div className="rec-wrap">
                    <div className="rec-title-row">
                      <h4 className="rec-title">สินค้าหมด! แนะนำสินค้าที่มีส่วนผสมใกล้เคียงกัน</h4>
                    </div>

                    <div className="rec-scroll">
                      {itemRecs.map((rec) => (
                        <div key={rec.id} className="rec-card" role="button" tabIndex={0} onClick={() => navigate(`/product/${rec.id}`)}>
                          <div className="rec-img">
                            <img
                              src={rec.thumbnail ? `${API_URL}/assets/${rec.thumbnail}` : rec.image || "https://via.placeholder.com/60"}
                              alt={rec.name}
                              onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/60")}
                            />
                          </div>

                          <div className="rec-info">
                            <div className="rec-brand">{rec.brand}</div>
                            <div className="rec-name">{rec.name}</div>
                            <div className="rec-price">฿{Number(rec.price).toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
                          </div>

                          <button
                            className="rec-add"
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCartRec(rec);
                            }}
                            aria-label="เพิ่มสินค้า"
                          >
                            <PlusIcon />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {outOfStockItems.map((item) => {
            const out = isItemOutOfStock(item);
            const itemRecs = recommendationsMap[item.productId] || [];

            return (
              <div key={item.uiId} className={`cart-item-group ${out ? "group-out-of-stock" : ""}`}>
                <div className="cart-item-row">
                  <div className="col-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedUiIds.includes(item.uiId)}
                      onChange={() => handleSelectOne(item.uiId)}
                      className="custom-checkbox"
                      disabled={out}
                    />
                  </div>

                  <div className="col-img" onClick={() => goToProduct(item)} style={{ cursor: "pointer" }}>
                    <div className="img-wrapper">
                      <img src={item.image} alt={item.name} onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/80")} />
                    </div>
                  </div>

                  <div className="col-info" onClick={() => goToProduct(item)} style={{ cursor: "pointer" }}>
                    <span className="cart-item-brand">{item.brand}</span>
                    <span className="cart-item-name">{item.name}</span>
                  </div>

                  <div className="col-price">
                    <div className="price-group">
                      <span className="item-price">
                        ฿{Number(item.price).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </span>
                      <span className="stock-warning">สินค้าหมด</span>
                    </div>
                  </div>

                  <div className="col-qty">
                    <div className="qty-simple hidden-qty">
                      <span>{item.quantity}</span>
                    </div>
                  </div>

                  <div className="col-action">
                    <button className="delete-btn" onClick={() => openDeleteModal(item)} type="button" aria-label="ลบสินค้า">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2V6"></path>
                        <path d="M8 6V4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* RECOMMEND */}
                {itemRecs.length > 0 && (
                  <div className="rec-wrap">
                    <div className="rec-title-row">
                      <h4 className="rec-title">สินค้าหมด! แนะนำสินค้าที่มีส่วนผสมใกล้เคียงกัน</h4>
                    </div>

                    <div className="rec-scroll">
                      {itemRecs.map((rec) => (
                        <div key={rec.id} className="rec-card" role="button" tabIndex={0} onClick={() => navigate(`/product/${rec.id}`)}>
                          <div className="rec-img">
                            <img
                              src={rec.thumbnail ? `${API_URL}/assets/${rec.thumbnail}` : rec.image || "https://via.placeholder.com/60"}
                              alt={rec.name}
                              onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/60")}
                            />
                          </div>

                          <div className="rec-info">
                            <div className="rec-brand">{rec.brand}</div>
                            <div className="rec-name">{rec.name}</div>
                            <div className="rec-price">฿{Number(rec.price).toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
                          </div>

                          <button
                            className="rec-add"
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCartRec(rec);
                            }}
                            aria-label="เพิ่มสินค้า"
                          >
                            <PlusIcon />
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
              <span>{selectedUiIds.length} รายการ</span>
            </div>

            <div className="summary-row total-row">
              <span>ยอดรวม</span>
              <div className="total-group">
                <span className="total-price">
                  ฿{totalPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
                <span className="tax-note">(ไม่รวมค่าจัดส่ง)</span>
              </div>
            </div>

            <button className="checkout-btn" onClick={handleCheckout} type="button">
              ดำเนินการชำระเงิน
            </button>
          </div>
        </div>
      </div>

      {/* DELETE MODAL */}
      {deleteModalOpen && (
        <div className="skin-modal-overlay" onClick={closeDeleteModal} style={{ zIndex: 9999 }}>
          <div className="skin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="skin-modal-icon-container">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18"></path>
                <path d="M19 6v14c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2V6"></path>
                <path d="M8 6V4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v2"></path>
              </svg>
            </div>

            <h3 className="skin-modal-title">ลบสินค้าออกจากตะกร้า?</h3>
            <p className="skin-modal-desc">
              ต้องการลบ <strong>"{pendingDeleteItem?.name || "-"}"</strong> ใช่หรือไม่?
            </p>

            <div className="skin-modal-actions">
              <button className="btn-modal-cancel" onClick={closeDeleteModal} type="button">
                ยกเลิก
              </button>
              <button
                className="btn-modal-confirm"
                onClick={confirmDelete}
                type="button"
                style={{ background: "#ff2d55", borderColor: "#ff2d55" }}
              >
                ยืนยันการลบ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
