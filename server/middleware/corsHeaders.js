/**
 * Enhanced middleware to handle CORS headers and cache control 
 * This helps prevent CORS issues during service worker operations
 */
module.exports = (req, res, next) => {
    // Set CORS headers on every response
    const origin = req.headers.origin;

    // Get the request URL path for cache control decisions
    const urlPath = req.path || '';
    const isApiRequest = urlPath.startsWith('/api/');
    const isAssetRequest = /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/.test(urlPath);

    if (origin) {
        // Check if origin matches CORS_ORIGIN or is in ALLOWED_ORIGINS
        const allowedOriginsStr = process.env.ALLOWED_ORIGINS || '';
        const allowedOrigins = allowedOriginsStr.split(',').filter(Boolean);
        const primaryDomain = process.env.CORS_ORIGIN;

        // Enhanced CORS origin handling
        if (origin === primaryDomain || allowedOrigins.includes(origin)) {
            res.header('Access-Control-Allow-Origin', origin);

            // Add Vary header to ensure browsers cache responses correctly based on origin
            res.header('Vary', 'Origin');
        } else {
            // Default to configured primary domain if origin doesn't match
            res.header('Access-Control-Allow-Origin', primaryDomain);
        }
    }

    // Handle cache-related headers in all responses - expanded list
    res.header('Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma, Expires');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400'); // Cache preflight for 24 hours

    // Enhanced cache control based on request type
    if (isApiRequest) {
        // API requests should not be cached to prevent stale data
        res.header('Cache-Control', 'no-cache, no-store, must-revalidate, private');
        res.header('Pragma', 'no-cache');
        res.header('Expires', '0');
        res.header('Surrogate-Control', 'no-store'); // For CDNs
    } else if (isAssetRequest) {
        // Static assets can be cached but with validation
        const maxAge = 60 * 60 * 24; // 24 hours
        res.header('Cache-Control', `public, max-age=${maxAge}, must-revalidate`);
    } else {
        // Default cache control for other requests
        res.header('Cache-Control', 'no-cache, must-revalidate');
        res.header('Pragma', 'no-cache');
    }

    // Add Service Worker specific headers to prevent problems
    if (req.headers['service-worker'] === 'script') {
        res.header('Service-Worker-Allowed', '/');
    }

    // Handle preflight OPTIONS requests
    if (req.method === 'OPTIONS') {
        return res.sendStatus(204); // No Content for OPTIONS preflight
    }

    next();
};
