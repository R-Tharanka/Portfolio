import React from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogUrl?: string;
}

const SEO: React.FC<SEOProps> = ({
  title = 'Ruchira Tharanka | Full-Stack Developer | Portfolio',
  description = 'I’m Ruchira Tharanka Full-Stack Developer. Explore my portfolio of dynamic React front-ends, secure Node.js back-ends, MongoDB databases, and innovative projects that solve real-world problems.',
  keywords = 'full-stack developer, frontend developer, backend developer, MERN stack, React, Node.js, JavaScript, TypeScript, HTML, CSS, UI/UX design, software engineer, freelance developer, portfolio, web applications, web development, web design, personal website, Ruchira Tharanka, portfolio, Ruchira, Tharanka, React TypeScript portfolio project',
  ogImage = '/og-image.png',
  ogUrl = import.meta.env.VITE_PORTFOLIO_URL || 'https://ruchira-portfolio.vercel.app/'
}) => {
  // Use the title as is, without modification
  const siteTitle = title;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{siteTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={ogUrl} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={ogUrl} />
      <meta property="twitter:title" content={siteTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={ogImage} />
    </Helmet>
  );
};

export default SEO;
