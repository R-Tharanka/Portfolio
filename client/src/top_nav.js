import React from "react";
import ThemeToggleButton from './components/ThemeToggleButton';
import './styles/top_nav.css'

const TopNav = () => {
  return (
    <nav className="">
      <div className="">My App</div>
      <ul className="flex space-x-6">
        <li>
          <a href="#" className="hover:underline">
            Home
          </a>
        </li>
        <li>
          <a href="#" className="hover:underline">
            About
          </a>
        </li>
        <li>
          <a href="#" className="hover:underline">
            Contact
          </a>
        </li>
      </ul>
      
      <ThemeToggleButton />
    </nav>
  );
};

export default TopNav;
