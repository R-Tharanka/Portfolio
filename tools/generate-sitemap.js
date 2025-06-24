const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../client/.env') });

// Configuration
const SITE_URL = process.env.VITE_PORTFOLIO_URL || 'https://ruchira-portfolio.vercel.app';
const PUBLIC_DIR = path.join(__dirname, '../client/public');

// Define the site structure
// Single page application - only the homepage and admin page
const pages = [
  {
    url: '/',
    changefreq: 'daily', // Set to daily since you're making frequent changes during development
    priority: '1.0'
  },
  {
    url: '/admin',
    changefreq: 'daily',
    priority: '0.5'
  }
];

// Generate sitemap XML
const generateSitemap = () => {
  const today = new Date().toISOString();
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  // Add each page to the sitemap
  pages.forEach(page => {
    xml += '  <url>\n';
    xml += `    <loc>${SITE_URL}${page.url}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += '  </url>\n';
  });
  
  xml += '</urlset>';
  
  return xml;
};

// Write sitemap to file
const writeSitemap = () => {
  try {
    // Ensure public directory exists
    if (!fs.existsSync(PUBLIC_DIR)) {
      fs.mkdirSync(PUBLIC_DIR, { recursive: true });
    }
    
    const sitemap = generateSitemap();
    fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), sitemap);
    console.log('✓ Sitemap generated successfully!');
  } catch (error) {
    console.error('✗ Failed to generate sitemap:', error);
  }
};

// Execute sitemap generation
writeSitemap();
