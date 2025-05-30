// JWT token utility functions

/**
 * Decodes a JWT token
 * @param token The JWT token to decode
 * @returns The decoded token payload or null if invalid
 */
export interface DecodedToken {
  id: string;
  iat: number;
  exp: number;
}

export const decodeToken = (token: string): DecodedToken | null => {
  try {
    // Token structure: header.payload.signature
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Checks if a token is expired
 * @param token The JWT token to check
 * @returns True if the token is expired or invalid, false otherwise
 */
export const isTokenExpired = (token: string): boolean => {
  if (!token) return true;
  
  const decodedToken = decodeToken(token);
  if (!decodedToken) return true;
  
  const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
  return decodedToken.exp < currentTime;
};

/**
 * Gets remaining time for token in seconds
 * @param token The JWT token
 * @returns Remaining seconds or 0 if expired/invalid
 */
export const getTokenRemainingTime = (token: string): number => {
  if (!token) return 0;
  
  const decodedToken = decodeToken(token);
  if (!decodedToken) return 0;
  
  const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
  return Math.max(0, decodedToken.exp - currentTime);
};
