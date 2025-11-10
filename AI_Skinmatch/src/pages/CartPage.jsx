// 🧱 src/pages/CartPage.jsx
import React, { useState } from "react";
import "../pages/styles/CartPage.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Breadcrumb from "../components/Breadcrumb";
import { productData } from "../data/products";

function CartPage() {
  const [cartItems, setCartItems] = useState([
    {
      id: "p1",
      name: "Hyaluronic Acid 2% + B5",
      price: 350,
      quantity: 1,
    },
    {
      id: "p2",
      name: "Revitalift Hyaluronic Acid Serum",
      price: 899,
      quantity: 1,
      outOfStock: true,
    },
  ]);

  const total = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const increaseQty = (id) =>
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );

  const decreaseQty = (id) =>
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );

  const removeItem = (id) =>
    setCartItems((prev) => prev.filter((item) => item.id !== id));

  return (
    <>
      <Header />
      <Breadcrumb
        items={[
          { label: "หน้าหลัก", onClick: () => (window.location.href = "/"), isLink: true },
          { label: "ถุงช้อปปิ้งของฉัน" },
        ]}
      />

      <div className="cart-page page-transition">
        <div className="cart-items">
          <h2>ถุงช้อปปิ้งของคุณ</h2>

          {cartItems.length === 0 ? (
            <p className="empty-cart">ไม่มีสินค้าในถุงช้อปปิ้งของคุณ</p>
          ) : (
            <>
              <table className="cart-table">
                <thead>
                  <tr>
                    <th>สินค้า</th>
                    <th>ราคา</th>
                    <th>จำนวน</th>
                    <th>ลบ</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => (
                    <tr
                      key={item.id}
                      className={item.outOfStock ? "out-of-stock" : ""}
                    >
                      <td className="product-name">{item.name}</td>
                      <td>{item.price.toFixed(2)} ฿</td>
                      <td>
                        <div className="qty-controls">
                          <button onClick={() => decreaseQty(item.id)}>-</button>
                          <span>{item.quantity}</span>
                          <button onClick={() => increaseQty(item.id)}>+</button>
                        </div>
                      </td>
                      <td>
                        <button
                          className="delete-btn"
                          onClick={() => removeItem(item.id)}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="related-products">
                <div className="related-grid">
                  {productData.map((p) => (
                    <div className="related-item" key={p.id}>
                      <img src={p.image} alt={p.name} />
                      <p>{p.name}</p>
                      <span>฿{p.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="cart-summary">
          <h3>สรุปคำสั่งซื้อ</h3>
          <div className="cart-total">
            <span>จำนวนสินค้า</span>
            <span>{cartItems.length} รายการ</span>
          </div>
          <div className="cart-total total-line">
            <span>ยอดรวมทั้งหมด</span>
            <span className="total-price">฿{total.toFixed(2)}</span>
          </div>
          <button
            className="checkout-button"
            disabled={cartItems.length === 0}
          >
            ดำเนินการชำระเงิน
          </button>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default CartPage;
