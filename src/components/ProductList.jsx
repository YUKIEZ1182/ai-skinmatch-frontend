import React from "react";
import ProductCard from "./ProductCard";
import { mockProducts } from "../data/mockData"; // ดึงข้อมูลมาจาก mockData

export { mockProducts };
export default function ProductList({ title, products, onProductSelect, style }) {
  return (
    <div style={{ padding: "0 2rem", ...style }}>
      {title && <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>{title}</h2>}
      {products && products.length > 0 ? (
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", 
          gap: "1.5rem" 
        }}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} onClick={() => onProductSelect && onProductSelect(product)} />
          ))}
        </div>
      ) : (
        <p style={{ color: "#888" }}>ไม่พบสินค้า</p>
      )}
    </div>
  );
}