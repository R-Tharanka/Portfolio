import React from 'react';
import { useTheme } from './ThemeContext';
import moonIcon from '../assets/img/icon/moon.png';
import sunIcon from '../assets/img/icon/sun.png';

const ThemeToggleButton = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button className="theme-toggle-btn" onClick={toggleTheme}>
      <img 
        src={theme === 'light' ? moonIcon : sunIcon} 
        alt={theme === 'light' ? 'Moon Icon' : 'Sun Icon'}
        width="24"
        height="24"
      />
    </button>
  );
};

export default ThemeToggleButton;
