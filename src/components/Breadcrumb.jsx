import React from "react";
import "./styles/Breadcrumb.css";

function Breadcrumb({ items = [] }) {
  console.log('--- LOG: Breadcrumb items received:', items);
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <nav className="breadcrumb-nav">
      <ul>
        {items.map((item, index) => (
          <li key={index}>
            {item.isLink && item.onClick ? (
              <button onClick={item.onClick} className="breadcrumb-link">
                {item.label}
              </button>
            ) : (
              <span className={index === items.length - 1 ? 'breadcrumb-current' : 'breadcrumb-item'}>
                {item.label}
              </span>
            )}
            {index < items.length - 1 && <span className="breadcrumb-separator"> &gt; </span>}
          </li>
        ))}
      </ul>
    </nav>
  );

}
export default Breadcrumb;
