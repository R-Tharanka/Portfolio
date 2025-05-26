# Deployment Guide

This document outlines the steps to deploy the Portfolio application to production environments.

## Frontend Deployment (Vercel)

### Prerequisites
- A Vercel account
- Git repository with your project

### Steps

1. **Prepare Environment Variables**

   Create a `.env.production` file in the client directory with the following variables:
   ```
   VITE_API_URL=https://your-backend-url.com/api
   VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
   ```

2. **Deploy to Vercel**

   ```bash
   # Install Vercel CLI (if not already installed)
   npm install -g vercel

   # Navigate to client directory
   cd client

   # Login to Vercel
   vercel login

   # Deploy to Vercel
   vercel
   ```

3. **Configure Production Deployment**

   - Set environment variables in the Vercel dashboard
   - Configure a custom domain (if needed)
   - Set up redirects for SPA routing

## Backend Deployment (Render)

### Prerequisites
- A Render account
- Git repository with your project

### Steps

1. **Prepare for Deployment**

   Create a `render.yaml` file in the root directory:

   ```yaml
   services:
     - type: web
       name: portfolio-api
       env: node
       buildCommand: cd server && npm install
       startCommand: cd server && node server.js
       envVars:
         - key: NODE_ENV
           value: production
         - key: MONGODB_URI
           sync: false
         - key: JWT_SECRET
           sync: false
         - key: RECAPTCHA_SECRET_KEY
           sync: false
   ```

2. **Deploy to Render**

   - Connect your repository to Render
   - Add required environment variables:
     - `MONGODB_URI`: Your MongoDB connection string
     - `JWT_SECRET`: Secret key for JWT authentication
     - `RECAPTCHA_SECRET_KEY`: Your reCAPTCHA secret key
   - Deploy the service

3. **Configure CORS for Production**

   Update the CORS configuration in `server.js` to allow requests from your frontend domain:

   ```javascript
   app.use(cors({
     origin: process.env.NODE_ENV === 'production' 
       ? 'https://your-frontend-domain.com' 
       : 'http://localhost:5173'
   }));
   ```

## Production Environment Variables

### Frontend (.env.production)
- `VITE_API_URL`: URL to your backend API
- `VITE_RECAPTCHA_SITE_KEY`: Your reCAPTCHA site key

### Backend (.env)
- `NODE_ENV`: Set to "production"
- `PORT`: Port to run the server on (default: 5000)
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: Secret for JWT token generation
- `JWT_EXPIRE`: JWT expiration time (e.g., "24h")
- `RECAPTCHA_SECRET_KEY`: Your reCAPTCHA secret key

## Post-Deployment Checks

1. Verify API connectivity between frontend and backend
2. Test the contact form with reCAPTCHA
3. Check admin authentication and dashboard functionality
4. Validate responsive design on different devices

## Troubleshooting

- **CORS issues**: Verify the CORS configuration in server.js
- **API connection problems**: Check environment variables and network settings
- **Database connectivity**: Ensure MongoDB connection string is correct
- **Authentication issues**: Validate JWT configuration

## Optimization Tips

- Enable caching for static assets
- Implement a CDN for global distribution
- Set up monitoring and error tracking
- Configure automatic backups for the database
