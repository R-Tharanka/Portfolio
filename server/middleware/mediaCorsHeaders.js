// Custom middleware to handle CORS headers specifically for media files
module.exports = (req, res, next) => {
    // For media files, we want to be more permissive with CORS
    // This is needed especially for video files that might use partial content responses
    
    // Allow requests from any origin for media content
    res.header('Access-Control-Allow-Origin', '*');
    
    // Allow specific methods
    res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    
    // Allow specific headers
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Range');
    
    // For videos, explicitly disable credentials requirement
    // This helps with cross-origin video requests
    if (req.path.match(/\.(mp4|webm|ogg)$/i)) {
        res.header('Access-Control-Allow-Credentials', 'false');
    } else {
        res.header('Access-Control-Allow-Credentials', 'true');
    }
    
    // Set appropriate cache control
    // Videos can be cached longer as they rarely change
    if (req.path.match(/\.(mp4|webm|ogg)$/i)) {
        res.header('Cache-Control', 'public, max-age=604800'); // 7 days
    } else {
        res.header('Cache-Control', 'public, max-age=86400'); // 24 hours
    }
    
    // Set content disposition for media files
    if (req.path.match(/\.(jpg|jpeg|png|gif|webp|mp4|webm|ogg)$/i)) {
        res.header('Content-Disposition', 'inline');
    }
    
    // Expose range header and other important headers for video streaming
    res.header('Access-Control-Expose-Headers', 'Content-Range, Accept-Ranges, Content-Length, Content-Type');
    
    // Explicitly set cross-origin resource policy to cross-origin for videos
    if (req.path.match(/\.(mp4|webm|ogg)$/i)) {
        res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    }
    
    next();
};
