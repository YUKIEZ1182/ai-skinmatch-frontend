import React from "react";
import ProductCard from "./ProductCard";

// ลบ import mockData ออกไปเลยครับ ไม่ต้องใช้แล้ว
// import { mockProducts } from "../data/mockData"; 

export default function ProductList({ title, products, onProductSelect, style }) {
  return (
    <div style={{ padding: "0 2rem", ...style }}>
      {title && <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>{title}</h2>}
      
      {/* เช็คว่ามีสินค้าส่งมาจริงไหม */}
      {products && products.length > 0 ? (
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", 
          gap: "1.5rem" 
        }}>
          {products.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onClick={() => onProductSelect && onProductSelect(product)} 
            />
          ))}
        </div>
      ) : (
        // ถ้าไม่มีสินค้าส่งมา หรือกำลังโหลด ให้แสดงข้อความนี้
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
           <p>ยังไม่มีรายการสินค้าในหมวดหมู่นี้</p>
        </div>
      )}
    </div>
  );
}