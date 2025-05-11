import { Link } from "react-router-dom";
import React from 'react';
import Topnav from './top_nav.js';
import Hero from './hero.js';
import About from './about.js';

function App() {
  return (
    <div>
      <Topnav/>
      <h1>Welcome to My Portfolio</h1>
      <p>Building something awesome with MERN!</p>
      <p>This is a simple React app with theme toggle functionality.</p>
    </div>
  );
}

export default App;

