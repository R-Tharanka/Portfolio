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
  title = 'Ruchira Tharanka | Full-Stack Developer',
  description = 'Professional portfolio showcasing projects, skills and experience in web development, design and software engineering.',
  keywords = 'developer, portfolio, web developer, software engineer, frontend, backend, full stack, javascript, react, nodejs, typescript, html, css, web design, Ruchira Tharanka, personal website, Ruchira, Tharanka',
  ogImage = '/og-image.png', // You'll need to add this image to your public folder
  ogUrl = 'https://ruchira-portfolio.vercel.app/' // Replace with your actual domain
}) => {
  const siteTitle = title.includes('Portfolio') ? title : `${title} | Portfolio`;

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
