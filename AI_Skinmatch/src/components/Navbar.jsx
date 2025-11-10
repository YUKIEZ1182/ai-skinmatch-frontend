import React from "react";
import { NavLink } from "react-router-dom";
import "../theme.css";

function Navbar() {
  const categories = [
    { name: "ใหม่!", path: "/new", highlight: true },
    { name: "เมคอัพ", path: "/makeup" },
    { name: "สกินแคร์", path: "/skincare" },
    { name: "ดูแลเส้นผม", path: "/haircare" },
    { name: "อุปกรณ์เสริมสวย", path: "/beauty-tools" },
    { name: "ดูแลผิวกาย", path: "/bodycare" },
    { name: "น้ำหอม", path: "/perfume" },
    { name: "ควีนบิวตี้", path: "/queenbeauty" },
    { name: "ของขวัญ", path: "/gift" },
    { name: "แบรนด์ดัง", path: "/brands" },
    { name: "สินค้าลดราคา", path: "/discount" },
  ];

  return (
    <nav className="category-nav">
      <ul>
        {categories.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                isActive
                  ? "active"
                  : item.highlight
                  ? "highlight-item"
                  : ""
              }
            >
              {item.name}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default Navbar;
