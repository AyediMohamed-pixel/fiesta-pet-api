const axios = require('axios');
require('dotenv').config();

async function testSirvUpload() {
  const clientId = process.env.SIRV_CLIENT_ID;
  const clientSecret = process.env.SIRV_CLIENT_SECRET;
  const sirvDomain = process.env.SIRV_DOMAIN;
  
  console.log('Testing Sirv upload...');
  console.log('Client ID:', clientId ? `${clientId.substring(0, 10)}...` : 'NOT SET');
  console.log('Client Secret:', clientSecret ? `${clientSecret.substring(0, 10)}...` : 'NOT SET');
  console.log('Sirv Domain:', sirvDomain);
  
  try {
    // Step 1: Get token
    console.log('\n1. Getting token...');
    const tokenResponse = await axios.post('https://api.sirv.com/v2/token', {
      clientId: clientId,
      clientSecret: clientSecret,
    });
    
    const token = tokenResponse.data.token;
    console.log('✅ Token received:', token ? `${token.substring(0, 20)}...` : 'NO');
    console.log('Token length:', token ? token.length : 'NO TOKEN');
    console.log('Expires in:', tokenResponse.data.expiresIn, 'seconds');
    
    // Step 2: Prepare test image (1x1 red pixel PNG)
    const base64Data = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
    const buffer = Buffer.from(base64Data, 'base64');
    const filename = 'uploads/test/test-upload.png';
    
    console.log('\n2. Uploading image...');
    console.log('Buffer size:', buffer.length, 'bytes');
    console.log('Filename:', filename);
    
    const uploadUrl = `https://api.sirv.com/v2/files/upload?filename=/${filename}`;
    console.log('Upload URL:', uploadUrl);
    
    // Step 3: Test account info first
    console.log('\n2.5. Testing account info...');
    try {
      const accountResponse = await axios.get('https://api.sirv.com/v2/account', {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      console.log('✅ Account info retrieved:', accountResponse.data);
    } catch (accountError) {
      console.log('❌ Account info failed:', accountError.response?.status, accountError.response?.data);
    }
    
    // Step 4: Upload
    const uploadResponse = await axios.post(
      uploadUrl,
      buffer,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'image/png',
          'Content-Length': buffer.length.toString(),
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );
    
    console.log('✅ Upload successful!');
    console.log('Status:', uploadResponse.status);
    console.log('Response:', uploadResponse.data);
    console.log('Image URL:', `https://${sirvDomain}/${filename}`);
    
  } catch (error) {
    console.log('❌ Upload test failed:');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data || error.message);
    if (error.response?.headers) {
      console.log('Response headers:', error.response.headers);
    }
  }
}

testSirvUpload();