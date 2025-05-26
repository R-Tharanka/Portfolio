const fs = require('fs');
const path = require('path');

// Configuration
const SITE_URL = process.env.SITE_URL || 'https://yourportfolio.com';
const PUBLIC_DIR = path.join(__dirname, '../client/public');

// Define the site structure
const pages = [
  {
    url: '/',
    changefreq: 'weekly',
    priority: '1.0'
  },
  {
    url: '/about',
    changefreq: 'monthly',
    priority: '0.8'
  },
  {
    url: '/projects',
    changefreq: 'weekly',
    priority: '0.8'
  },
  {
    url: '/skills',
    changefreq: 'monthly',
    priority: '0.8'
  },
  {
    url: '/education',
    changefreq: 'monthly',
    priority: '0.7'
  },
  {
    url: '/contact',
    changefreq: 'monthly',
    priority: '0.7'
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
