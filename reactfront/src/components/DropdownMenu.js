// components/DropdownMenu.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const DropdownMenu = ({ title, options }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="dropdown-menu-container">
      <button onClick={toggleDropdown} className="dropdown-button">
        {title} <i className={`bi bi-chevron-${isOpen ? 'up' : 'down'}`}></i>
      </button>
      {isOpen && (
        <ul className="dropdown-list">
          {options.map((option, index) => (
            <li key={index} className="dropdown-item">
              <Link to={option.path}>{option.label}</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DropdownMenu;
