import React, { useState } from "react";
import "../theme.css";

function Search({ onSearch }) {
  const [inputValue, setInputValue] = useState('');

  const handleSearchClick = () => {
    onSearch(inputValue);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSearchClick();
    }
  };

  return (
    <div className="search-container">
      <div className="search-wrapper">
        <input
          type="text"
          placeholder="คุณกำลังมองหาอะไรอยู่?"
          className="search-input"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="search-button" onClick={handleSearchClick}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85zm-5.242.656a5 5 0 1 1 0-10 5 5 0 0 1 0 10z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default Search;
