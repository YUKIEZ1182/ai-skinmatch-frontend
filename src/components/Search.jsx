import React, { useState } from "react";

export default function Search({ onSearch }) {
  const [term, setTerm] = useState("");

  const handleKeyDown = (e) => {
    if (e.key === "Enter") onSearch(term);
  };

  return (
    <div style={{ padding: "1rem 2rem", display: "flex", justifyContent: "center" }}>
      <input
        type="text"
        placeholder="ค้นหาสินค้า..."
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        onKeyDown={handleKeyDown}
        style={{
          width: "100%",
          maxWidth: "500px",
          padding: "10px 15px",
          borderRadius: "25px",
          border: "1px solid #ddd",
          outline: "none"
        }}
      />
      <button 
        onClick={() => onSearch(term)}
        style={{
          marginLeft: "-40px",
          background: "none",
          border: "none",
          cursor: "pointer"
        }}
      >
        🔍
      </button>
    </div>
  );
}