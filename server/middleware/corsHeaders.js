// Custom middleware to handle and standardize CORS headers
module.exports = (req, res, next) => {
    // Set CORS headers on every response
    const origin = req.headers.origin;

    if (origin) {
        // Check if origin matches CORS_ORIGIN or is in ALLOWED_ORIGINS
        const allowedOriginsStr = process.env.ALLOWED_ORIGINS || '';
        const allowedOrigins = allowedOriginsStr.split(',').filter(Boolean);
        const primaryDomain = process.env.CORS_ORIGIN;

        if (origin === primaryDomain || allowedOrigins.includes(origin)) {
            res.header('Access-Control-Allow-Origin', origin);
        } else {
            // Default to configured primary domain if origin doesn't match
            res.header('Access-Control-Allow-Origin', primaryDomain);
        }
    }

    // Handle cache-related headers in all responses - expanded list
    res.header('Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma, Expires');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400'); // Cache preflight for 24 hours

    // Add headers to disable caching for API responses
    res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.header('Pragma', 'no-cache');
    res.header('Expires', '0');

    // Handle preflight OPTIONS requests
    if (req.method === 'OPTIONS') {
        return res.sendStatus(204); // No Content for OPTIONS preflight
    }

    next();
};
