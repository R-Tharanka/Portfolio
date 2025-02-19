import { Link } from "react-router-dom";
import React from 'react';
import ThemeToggleButton from './components/ThemeToggleButton';

function App() {
  return (
    <div>
      <h1>Welcome to My Portfolio</h1>
      <p>Building something awesome with MERN!</p>
      <p>This is a simple React app with theme toggle functionality.</p>
      <ThemeToggleButton />
    </div>
  );
}

export default App;

