// Console script to check JWT token status
// Copy and paste this into your browser console when on the admin page

function checkAdminJwtToken() {
  console.clear();
  console.log('%c Admin JWT Token Status Check ', 'background: #2563eb; color: white; padding: 4px; border-radius: 3px;');
  
  // Get token from localStorage
  const token = localStorage.getItem('adminToken');
  
  if (!token) {
    console.log('%c No admin token found in localStorage', 'color: #dc2626; font-weight: bold;');
    return;
  }
  
  // Function to decode JWT token
  const decodeToken = (token) => {
    try {
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
  
  // Decode the token and analyze
  const decoded = decodeToken(token);
  
  if (!decoded) {
    console.log('%c Token is invalid or malformed', 'color: #dc2626; font-weight: bold;');
    return;
  }
  
  // Calculate expiration status
  const currentTime = Math.floor(Date.now() / 1000); 
  const isExpired = decoded.exp <= currentTime;
  const remainingSeconds = decoded.exp - currentTime;
  
  // Format timestamps and durations
  const formatDate = (timestamp) => new Date(timestamp * 1000).toLocaleString();
  const formatDuration = (seconds) => {
    if (seconds <= 0) return 'Expired';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours}h ${minutes}m ${secs}s`;
  };
  
  // Calculate total duration
  const totalDurationSec = decoded.exp - decoded.iat;
  const totalDurationHours = (totalDurationSec / 3600).toFixed(2);
  
  // Display token information
  console.log(`%c Token Status: ${isExpired ? '⛔ EXPIRED' : '✅ VALID'}`, 
    `font-weight: bold; color: ${isExpired ? '#dc2626' : '#16a34a'}`);
  
  console.group('Token Details');
  console.log('🔑 User ID:', decoded.id);
  console.log('📆 Issued At:', formatDate(decoded.iat));
  console.log('⏰ Expires At:', formatDate(decoded.exp));
  console.log('⏳ Total Duration:', `${totalDurationHours} hours (${totalDurationSec} seconds)`);
  
  if (!isExpired) {
    console.log('🕒 Remaining Time:', formatDuration(remainingSeconds));
    console.log('📊 Progress:', `${Math.round((1 - remainingSeconds / totalDurationSec) * 100)}% elapsed`);
  }
  
  console.groupEnd();
  
  // Log the actual token for verification on jwt.io
  console.log('%c To verify your token, visit https://jwt.io/', 'font-style: italic;');
  console.log(token);
  
  return {
    isValid: !isExpired,
    expiresAt: new Date(decoded.exp * 1000),
    remainingSeconds,
    token
  };
}

// Run the check
const tokenStatus = checkAdminJwtToken();
