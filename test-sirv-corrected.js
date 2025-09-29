const axios = require('axios');
const fs = require('fs');

async function testSirvUpload() {
  try {
    console.log('=== Testing Corrected Sirv Upload ===');
    
    // Step 1: Get token
    console.log('1. Getting token...');
    const tokenResponse = await axios.post('https://api.sirv.com/v2/token', {
      clientId: process.env.SIRV_CLIENT_ID,
      clientSecret: process.env.SIRV_CLIENT_SECRET
    }, {
      headers: {
        'content-type': 'application/json'
      }
    });
    
    const token = tokenResponse.data.token;
    console.log('✓ Token received, length:', token.length);
    console.log('✓ Token expires in:', tokenResponse.data.expiresIn, 'seconds');
    
    // Step 2: Test account info (to verify token works)
    console.log('\n2. Testing account info...');
    const accountResponse = await axios.get('https://api.sirv.com/v2/account', {
      headers: {
        'authorization': `Bearer ${token}`,
        'content-type': 'application/json'
      }
    });
    
    console.log('✓ Account info retrieved successfully');
    console.log('✓ Account alias:', accountResponse.data.alias);
    
    // Step 3: Upload image using corrected format
    console.log('\n3. Testing image upload...');
    
    // Create a simple test image (1x1 pixel PNG)
    const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAHGbKdMDgAAAABJRU5ErkJggg==';
    const imageBuffer = Buffer.from(testImageBase64, 'base64');
    
    const uploadUrl = 'https://api.sirv.com/v2/files/upload?filename=/test-upload.png';
    console.log('Upload URL:', uploadUrl);
    console.log('Image buffer size:', imageBuffer.length);
    
    const uploadResponse = await axios.post(uploadUrl, imageBuffer, {
      headers: {
        'authorization': `Bearer ${token}`,
        'content-type': 'image/png'
      }
    });
    
    console.log('✓ Upload successful!');
    console.log('Response:', uploadResponse.data);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    }
  }
}

testSirvUpload();