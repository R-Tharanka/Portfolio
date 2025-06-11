/**
 * Logger utility to handle application logging
 * Only logs in development mode to keep production clean
 */

// Check if we're in production mode
const isProduction = import.meta.env.PROD;

/**
 * Logger object with methods that only log in development environment
 */
const logger = {
    /**
     * Log info messages (only in development)
     * @param args Arguments to log
     */
    log: (...args: any[]) => {
        if (!isProduction) {
            console.log(...args);
        }
    },

    /**
     * Log warning messages (only in development)
     * @param args Arguments to log
     */
    warn: (...args: any[]) => {
        if (!isProduction) {
            console.warn(...args);
        }
    },

    /**
     * Log error messages (these will log in both dev and production for debugging critical issues)
     * @param args Arguments to log
     */
    error: (...args: any[]) => {
        console.error(...args);
    },

    /**
     * Log info messages with a tag (only in development)
     * @param tag The tag to prefix the log with
     * @param args Arguments to log
     */
    info: (tag: string, ...args: any[]) => {
        if (!isProduction) {
            console.log(`[${tag}]`, ...args);
        }
    }
};

export default logger;
