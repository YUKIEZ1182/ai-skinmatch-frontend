import React from "react";
import "../components/styles/ProductList.css";
import ProductCard from "./ProductCard";

import ceraveFoamImage from "../assets/Cerave_Foaming.png";
import lorealGlycolicImage1 from "../assets/Loreal_Glycolic.jpg";
import lorealGlycolicImage2 from "../assets/Loreal_Glycolic_Model.jpg";
import lorealGlycolicImage3 from "../assets/Loreal_Glycolic_Detail.jpg";
import bioreUvImage from "../assets/BioreUV.png";
import ceraveMoistImage from "../assets/Cerave_Mois.png";

export const mockProducts = [
  {
    id: 1,
    brand: 'CeraVe',
    name: 'Foaming Facial Cleanser',
    price: '420.00',
    images: [ceraveFoamImage],
    imageUrl: ceraveFoamImage,
    isOutOfStock: true,
    skinType: ['ผิวมัน', 'ผิวผสม'],
    description: 'คลีนเซอร์ทำความสะอาดผิวหน้าสูตรอ่อนโยน สำหรับผิวมัน ผิวผสม และผิวที่เป็นสิวง่าย ช่วยขจัดสิ่งสกปรกและความมันส่วนเกินได้อย่างหมดจด',
    ingredients: 'Aqua/Water, Glycerin, Sodium Cocoyl Glycinate, Coco-Betaine, Sodium Lauroyl Sarcosinate...',
  },
  {
    id: 2,
    brand: 'Loreal',
    name: 'Glycolic Bright Serum',
    price: '799.00',
    images: [
        lorealGlycolicImage1,
        lorealGlycolicImage2,
        lorealGlycolicImage3
    ],
    imageUrl: lorealGlycolicImage1,
    isOutOfStock: false,
    skinType: 'ผิวแห้ง',
    description: 'เซรั่มเพื่อผิวดูกระจ่างใส ลดเลือนจุดด่างดำ ด้วยไกลโคลิค แอซิด',
    ingredients: 'Aqua/Water, Glycolic Acid, Niacinamide...',
  },
  {
    id: 3,
    brand: 'Biore',
    name: 'UV Aqua Rich',
    price: '450.00',
    images: [bioreUvImage],
    imageUrl: bioreUvImage,
    skinType: ['ผิวมัน', 'ผิวผสม'],
  },
   {
    id: 4,
    brand: 'CeraVe',
    name: 'Moisturising Cream',
    price: '720.00',
    images: [ceraveMoistImage],
    imageUrl: ceraveMoistImage,
    isOutOfStock: false,
    skinType: ['ผิวแห้ง'],
  },
  {
    id: 5,
    brand: 'Biore',
    name: 'UV Aqua Rich',
    price: '450.00',
    images: [bioreUvImage],
    imageUrl: bioreUvImage,
    isOutOfStock: false,
    skinType: ['ผิวแห้ง'],
  },
  {
    id: 6,
    brand: 'Loreal',
    name: 'Glycolic Bright Serum',
    price: '799.00',
    images: [ lorealGlycolicImage1, lorealGlycolicImage2, lorealGlycolicImage3 ],
    imageUrl: lorealGlycolicImage1,
    isOutOfStock: false,
    skinType: ['ผิวแห้ง'],
  },
  {
    id: 7,
    brand: 'CeraVe',
    name: 'Foaming Facial Cleanser',
    price: '420.00',
    images: [ceraveFoamImage],
    imageUrl: ceraveFoamImage,
    isOutOfStock: false,
    skinType: ['ผิวแห้ง'],
  },
  {
    id: 8,
    brand: 'CeraVe',
    name: 'Moisturising Cream',
    price: '720.00',
    images: [ceraveMoistImage],
    imageUrl: ceraveMoistImage,
    isOutOfStock: false,
    skinType: ['ผิวแห้ง'],
  },
];

function ProductList({ title = "สินค้า", products = [], onProductSelect, style }) {
  if (!products || products.length === 0) {
    return (
        <div className="product-list-container" style={style}>
            <h2>{title}</h2>
            <p>ยังไม่มีสินค้าแนะนำสำหรับคุณในขณะนี้</p>
        </div>
    );
  }
  return (
    <div className="product-list-container" style={style}>
      <h2>{title}</h2>
      <div className="product-grid">
        {products.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onSelect={onProductSelect}
          />
        ))}
      </div>
    </div>
  );
}

export default ProductList;
