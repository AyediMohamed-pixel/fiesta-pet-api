const axios = require('axios');
require('dotenv').config();

async function testSirvCredentials() {
  const clientId = process.env.SIRV_CLIENT_ID;
  const clientSecret = process.env.SIRV_CLIENT_SECRET;
  
  console.log('Testing Sirv credentials...');
  console.log('Client ID:', clientId ? `${clientId.substring(0, 10)}...` : 'NOT SET');
  console.log('Client Secret:', clientSecret ? `${clientSecret.substring(0, 10)}...` : 'NOT SET');
  
  try {
    const response = await axios.post('https://api.sirv.com/v2/token', {
      clientId: clientId,
      clientSecret: clientSecret,
    });
    
    console.log('✅ Credentials are valid!');
    console.log('Token received:', response.data.token ? 'YES' : 'NO');
    console.log('Expires in:', response.data.expiresIn, 'seconds');
    
  } catch (error) {
    console.log('❌ Credentials test failed:');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data || error.message);
  }
}

testSirvCredentials();