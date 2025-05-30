// Token Health Checker 
// Run with: node token-health-checker.js <token>

// Import required packages
const crypto = require('crypto');

// Check if token is provided
const token = process.argv[2];
if (!token) {
  console.error('Error: No token provided.');
  console.log('Usage: node token-health-checker.js <token>');
  process.exit(1);
}

console.log('JWT Token Health Checker');
console.log('=======================\n');

try {
  // Function to decode token without verifying signature
  function decodeToken(token) {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }
    
    const payload = parts[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = Buffer.from(base64, 'base64').toString('utf8');
    
    return JSON.parse(jsonPayload);
  }
  
  // Decode the token
  const decoded = decodeToken(token);
  console.log('Token decoded successfully.');
  console.log('\nToken Payload:');
  console.log(decoded);
  
  // Check token expiration
  const now = Math.floor(Date.now() / 1000);
  const expiry = decoded.exp;
  const issuedAt = decoded.iat;
  
  console.log('\nToken Timing:');
  console.log(`Issued at:     ${new Date(issuedAt * 1000).toLocaleString()} (${issuedAt})`);
  console.log(`Current time:  ${new Date(now * 1000).toLocaleString()} (${now})`);
  console.log(`Expires at:    ${new Date(expiry * 1000).toLocaleString()} (${expiry})`);
  
  const remainingSeconds = expiry - now;
  const remainingMinutes = Math.floor(remainingSeconds / 60);
  const remainingHours = Math.floor(remainingMinutes / 60);
  
  console.log('\nToken Status:');
  if (remainingSeconds <= 0) {
    console.log('❌ EXPIRED - Token has expired');
    console.log(`   Expired ${Math.abs(remainingMinutes)} minutes ago`);
  } else {
    console.log('✅ VALID - Token has not yet expired');
    if (remainingHours > 0) {
      console.log(`   Expires in ${remainingHours} hours and ${remainingMinutes % 60} minutes`);
    } else {
      console.log(`   Expires in ${remainingMinutes} minutes`);
    }
  }
  
  // Token duration
  const durationSeconds = expiry - issuedAt;
  const durationHours = Math.floor(durationSeconds / 3600);
  const durationMinutes = Math.floor((durationSeconds % 3600) / 60);
  
  console.log('\nToken Duration:');
  console.log(`Total duration: ${durationHours} hours and ${durationMinutes} minutes`);
  
  if (durationHours !== 1 || durationMinutes > 1) {
    console.log('⚠️ WARNING: Token duration is not approximately 1 hour.');
    console.log('   Check your JWT_EXPIRE environment variable.');
  }
  
  console.log('\nRecommendation:');
  if (remainingSeconds <= 0) {
    console.log('Login again to get a new token. Your current token has expired.');
  } else if (remainingMinutes < 5) {
    console.log('Login again soon. Your token will expire in less than 5 minutes.');
  } else {
    console.log('Token is valid and not near expiration.');
  }
  
} catch (error) {
  console.error('\n❌ Error processing token:', error.message);
  console.log('\nInvalid or malformed token. Please check the token and try again.');
}
