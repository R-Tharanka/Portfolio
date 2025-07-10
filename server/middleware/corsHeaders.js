// Custom middleware to handle and standardize CORS headers
module.exports = (req, res, next) => {
    // Set CORS headers on every response
    const origin = req.headers.origin;

    if (origin) {
        // Check if origin matches allowed origins
        const primaryDomain = process.env.CORS_ORIGIN || '';
        const allowedOriginsStr = process.env.ALLOWED_ORIGINS || '';
        const allowedOrigins = [
            primaryDomain,
            ...allowedOriginsStr.split(',').filter(Boolean)
        ].filter(Boolean);

        if (allowedOrigins.includes(origin)) {
            res.header('Access-Control-Allow-Origin', origin);
        } else if (primaryDomain) {
            // Default to configured primary domain if origin doesn't match
            res.header('Access-Control-Allow-Origin', primaryDomain);
        }
        
        // Log rejected origins in development
        if (process.env.NODE_ENV === 'development' && !allowedOrigins.includes(origin)) {
            console.log(`CORS headers: Unrecognized origin: ${origin}`);
            console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
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
