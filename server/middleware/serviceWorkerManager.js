/**
 * Enhanced middleware for service worker management
 * This middleware handles special routes and headers for service worker management
 */
module.exports = function serviceWorkerManagement(req, res, next) {
    // Get the path from the request
    const path = req.path;

    // Check if this is a service worker related request
    const isServiceWorker = req.headers['service-worker'] === 'script';
    const isServiceWorkerRoute = path.includes('service-worker.js') || path.includes('sw.js');

    // Apply special headers for service worker scripts
    if (isServiceWorker || isServiceWorkerRoute) {
        // Important headers for service worker scripts
        res.header('Service-Worker-Allowed', '/');
        res.header('Cache-Control', 'no-cache, no-store, must-revalidate, private');
        res.header('Pragma', 'no-cache');
        res.header('Expires', '0');

        // Log service worker requests for debugging
        console.log(`Service Worker request: ${path} (${isServiceWorker ? 'with SW header' : 'based on path'})`);
    }

    // Check if this is the unregister service worker endpoint
    if (path === '/api/unregister-service-worker') {
        // Special headers to help browsers clear service workers
        res.header('Service-Worker-Allowed', '/');
        res.header('Clear-Site-Data', '"cache", "cookies", "storage"');
        res.header('Cache-Control', 'no-cache, no-store, must-revalidate, private');

        console.log('Service Worker unregistration request received');

        // Respond with success message
        return res.json({
            success: true,
            message: 'Service worker unregistration headers sent',
            timestamp: new Date().toISOString()
        });
    }

    // Handle the special service worker diagnostics route
    if (path === '/api/service-worker-diagnostics') {
        // Headers already handled in the main route
        // Just log the request for debugging
        console.log(`Service worker diagnostics request from: ${req.headers['user-agent']}`);
    }

    // Continue to the next middleware/route handler
    next();
};
