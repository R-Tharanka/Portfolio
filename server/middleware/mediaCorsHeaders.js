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
    
    // Allow credentials
    res.header('Access-Control-Allow-Credentials', 'true');
    
    // Allow browser to cache for 24 hours
    res.header('Cache-Control', 'public, max-age=86400');
    
    // Set content disposition for media files
    if (req.path.match(/\.(jpg|jpeg|png|gif|webp|mp4|webm|ogg)$/i)) {
        res.header('Content-Disposition', 'inline');
    }
    
    // Expose range header
    res.header('Access-Control-Expose-Headers', 'Content-Range, Accept-Ranges, Content-Length');
    
    next();
};
