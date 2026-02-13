export const mockProducts = [
  {
    id: 1,
    name: "Niacinamide 10% + Zinc 1%",
    brand: "The Ordinary",
    price: 350.00,
    image: "/assets/The_Ordinary.webp",
    category: "เซรั่มบำรุงผิว",
    //type: "discount",
    skinType: ["ผิวผสม"],
    stock: 10,
    description: "เซรั่มลดการอุดตันและความมันส่วนเกิน ฟื้นฟูผิวให้เรียบเนียนกระจ่างใส",
  },
  {
    id: 2,
    name: "Galactomyces 95 Tone Balancing Essence",
    brand: "COSRX",
    price: 700.00,
    originalPrice: 1000.00, // ลด 30% เป๊ะ
    image: "/assets/cosrx_galctomyces_essence-1.png",
    category: "เอสเซนส์บำรุงผิวหน้า",
    //type: "discount",
    skinType: ["ผิวแห้ง"],
    stock: 0,                 // ✅ สำคัญ
    //status: "out_of_stock",   // ✅ สำคัญ
    description: "เอสเซนส์เข้มข้นด้วย Galactomyces 95% ช่วยปรับสีผิวให้กระจ่างใส ลดรอยแดง และทำให้ผิวเรียบเนียนดูสุขภาพดี",
  },
  {
    id: 3,
    name: "Foaming Facial Cleanser",
    brand: "CeraVe",
    price: 420.00,
    image: "/assets/CeraVe-Foaming-Facial-Cleanser.webp",
    category: "คลีนเซอร์",
    type: "",
    skinType: ["ผิวมัน"],
    stock: 0,                 // ✅ สำคัญ
    //status: "out_of_stock",   // ✅ สำคัญ
    description: "คลีนเซอร์เนื้อโฟม ทำความสะอาดผิวหน้าอย่างอ่อนโยน ไม่ทำให้ผิวแห้งตึง",
  },
  {
    id: 4,
    name: "Hydrating Cleanser Normal to Dry Skin",
    brand: "CeraVe",
    price: 400.00,
    originalPrice: 500.00, // ลด 20% เป๊ะ
    image: "/assets/cerave-hydrating-cleanser-normal-to-dry-skin.webp",
    category: "คลีนเซอร์",
    type: "discount",
    skinType: ["ผิวแพ้ง่าย"],
    stock: 0,   
    description: "สูตรไม่มีฟอง ช่วยรักษาสมดุลผิว ให้ผิวสะอาดและคงความชุ่มชื้นยาวนาน",
  },
  {
    id: 5,
    name: "Moisturizing Cream 453g",
    brand: "CeraVe",
    price: 750.00,
    image: "/assets/cerave-moisturizing-cream-453-g.png",
    category: "มอยส์เจอร์ไรเซอร์",
    type: "",
    skinType: ["ผิวแห้ง"],
    stock: 0,   
    description: "ครีมบำรุงผิวเข้มข้น เติมความชุ่มชื้นยาวนาน 24 ชั่วโมง",
  },
  {
    id: 6,
    name: "CeraVe SA Smoothing Cleanser | Salicylic Acid facewash in Nepal (236ml)",
    brand: "CeraVe",
    price: 490.00,
    originalPrice: 700.00, // ลด 30% เป๊ะ
    image: "/assets/cerave-salicylic-acid.jpg",
    category: "คลีนเซอร์ผลัดเซลล์ผิว",
    type: "discount",
    skinType: ["ผิวมัน"],
    stock: 0,   
    description: "ช่วยผลัดเซลล์ผิวและลดการอุดตันรูขุมขน ผิวเรียบเนียนกระจ่างใสขึ้น",
  },
  {
    id: 7,
    name: "BIORÉ - UV Aqua Rich Watery Essence SPF50+ PA++++",
    brand: "Biore",
    price: 350.00,
    originalPrice: 500.00, // ลด 30% เป๊ะ
    image: "/assets/BIORÉ - UV Aqua Rich Watery Essence SPF50+ PA++++.png",
    category: "กันแดด",
    type: "discount",
    skinType: ["ผิวมัน"],
    stock: 10,
    description: "กันแดดเนื้อเอสเซนส์บางเบา ไม่เหนียวเหนอะหนะ ปกป้องผิวจากแสงแดดอย่างอ่อนโยน",
  },
  {
    id: 8,
    name: "Revitalift classic anti-wrinkle serum 30ml",
    brand: "L’Oréal Paris",
    price: 800.00,
    originalPrice: 1000.00, // ลด 20% เป๊ะ
    image: "/assets/classic-anti-wrinkle-serum-30ml.webp",
    category: "เซรั่มผลัดเซลล์ผิว",
    type: "discount",
    skinType: ["ผิวมัน"],
    stock: 10,
    description: "เซรั่มสูตรไกลโคลิก ช่วยให้ผิวดูใสเรียบเนียนขึ้นอย่างอ่อนโยน",
  },
  {
    id: 9,
    name: "Revitalift Hyaluronic Acid Serum",
    brand: "L’Oréal Paris",
    price: 840.00,
    originalPrice: 1200.00, // ลด 30% เป๊ะ
    image: "/assets/Revitalift Hyaluronic Acid Serum.webp",
    category: "ผิวมัน",
    type: "discount",
    skinType: ["ผิวแห้ง"],
    stock: 0,
    description: "เซรั่มเข้มข้นเติมน้ำให้ผิวอิ่มฟูใน 1 วัน พร้อมลดเลือนริ้วรอย",
  },
  {
    id: 10,
    name: "Vitamin C Brightening Essence",
    brand: "Innisfree",
    price: 560.00,
    originalPrice: 800.00, // ลด 30% เป๊ะ
    image: "/assets/InnisfreeVitaminCGreenTeaEnzymeBrighteningSerum3.webp",
    category: "เอสเซนส์บำรุงผิว",
    type: "discount",
    skinType: ["ผิวมัน"],
    stock: 10,
    description: "เอสเซนส์วิตามินซี ช่วยให้ผิวกระจ่างใส เรียบเนียนดูสุขภาพดี",
  },
  {
    id: 11,
    name: "Multi-Peptide Serum for Hair Density",
    brand: "The Ordinary",
    price: 700.00,
    originalPrice: 1000.00, // ลด 30% เป๊ะ
    image: "/assets/sample-new2.webp",
    category: "เซรั่มกระชับผิว",
    type: "discount",
    skinType: ["ผิวมัน"],
    stock: 10,
    description: "เซรั่มเข้มข้นลดเลือนริ้วรอย คืนความยืดหยุ่นให้ผิว",
  },

  {
    id: 12,
    name: "Foaming Facial Cleanser (New)",
    brand: "CeraVe",
    price: 420.00,
    originalPrice: 600.00, // ลด 30% เป๊ะ
    image: "/assets/Foaming Facial Cleanser.webp",
    category: "คลีนเซอร์",
    type: "discount",
    skinType: ["ผิวมัน"],
    stock: 10,
    description: "คลีนเซอร์ทำความสะอาดผิวหน้าอย่างอ่อนโยน",
  },
  {
    id: 13,
    name: "Revitalift Hyaluronic Acid Serum",
    brand: "L'Oréal",
    price: 800.00,
    originalPrice: 1000.00, // ลด 20% เป๊ะ
    image: "/assets/loreal-paris-revitalift-hyaluronic-acid-serum.webp",
    category: "เซรั่มบำรุงผิว",
    type: "discount",
    skinType: ["ผิวแห้ง"],
    stock: 10,
    description: "เซรั่มเติมน้ำให้ผิวอิ่มฟูใน 1 วัน พร้อมลดริ้วรอย",
  },
  {
    id: 14,
    name: "Glycolic Bright Serum (New)",
    brand: "L’Oréal Paris",
    price: 750.00,
    originalPrice: 1000.00, // ลด 25% เป๊ะ
    image: "/assets/Glycolic Bright Serum (New).jpg",
    category: "เซรั่มผลัดเซลล์ผิว",
    type: "discount",
    skinType: ["ผิวมัน"],
    stock: 10,
    description: "เซรั่มสูตรไกลโคลิก ช่วยให้ผิวดูใสเรียบเนียนขึ้นอย่างอ่อนโยน",
  },
  {
    id: 15,
    name: "Royal Radiance Serum",
    brand: "Royal Cells Radiance",
    price: 900.00,
    originalPrice: 1500.00, // ลด 40% เป๊ะ
    image: "/assets/sample-queen1.webp",
    category: "เซรั่มเพื่อผิวกระจ่างใส",
    type: "discount",
    skinType: ["ผิวมัน"],
    stock: 10,
    description: "บำรุงล้ำลึกให้ผิดูกระจ่างใส มีออร่า",
  },

  {
    id: 16,
    name: "Advanced Night Repair",
    brand: "Estée Lauder",
    price: 4200.00,
    originalPrice: 6000.00, // ลด 30% เป๊ะ
    image: "/assets/sample-brand1.webp",
    category: "เซรั่มบำรุงผิวหน้า",
    type: "discount",
    skinType: ["ผิวมัน"],
    stock: 10,
    description: "เซรั่มไอคอนระดับโลก บำรุงผิวให้ชุ่มชื้นและเปล่งปลั่ง",
  },
  {
    id: 17,
    name: "La Mer Crème de la Mer",
    
    brand: "La Mer",
    price: 10000.00,
    originalPrice: 12500.00, // ลด 20% เป๊ะ
    image: "/assets/sample-brand2.jpg",
    category: "ครีมบำรุงผิว",
    type: "discount",
    skinType: ["ผิวแห้ง"],
    stock: 10,
    description: "ครีมระดับลักซ์ชัวรี คืนความชุ่มชื้นและฟื้นฟูผิวอย่างล้ำลึก",
  },
  {
    id: 18,
    name: "Perfect UV Sunscreen Milk SPF50",
    brand: "Anessa",
    price: 700.00,
    originalPrice: 1000.00, // ลด 30% เป๊ะ
    image: "/assets/sample-discount1.jpg",
    category: "กันแดด",
    type: "discount",
    skinType: ["ผิวมัน"],
    stock: 10,
    description: "ลดพิเศษ! กันแดดสูตรน้ำนมยอดนิยมจากญี่ปุ่น",
  },
  {
    id: 19,
    name: "Hydro Boost Water Gel",
    brand: "Neutrogena",
    price: 500.00,
    originalPrice: 1000.00, // ลด 50% เป๊ะ
    image: "/assets/sample-discount2.webp",
    category: "มอยส์เจอร์ไรเซอร์",
    type: "discount",
    skinType: ["ผิวแห้ง", "ผิวผสม"],
    //stock: 0,                 // ✅ สำคัญ
    //status: "out_of_stock",
    description: `
      เจลบำรุงผิวเนื้อบางเบา เหมาะสำหรับผิวแห้งและผิวผสม
      ช่วยดูแลความชุ่มชื้นของผิว ให้ผิวรู้สึกสบาย ไม่เหนียวเหนอะหนะ

      วิธีการใช้งาน:
      ทาหลังล้างหน้าให้ทั่วใบหน้า ใช้เป็นประจำเช้าและก่อนนอน

      ส่วนประกอบ:
      Water, Glycerin, Sodium Hyaluronate, Niacinamide, Panthenol
      `,
      

  },
];