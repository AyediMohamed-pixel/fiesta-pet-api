const axios = require('axios');
require('dotenv').config();

async function testSirvCredentials() {
  const clientId = process.env.SIRV_CLIENT_ID;
  const clientSecret = process.env.SIRV_CLIENT_SECRET;
  const sirvDomain = process.env.SIRV_DOMAIN;

  console.log('Testing Sirv credentials...');
  console.log('Client ID:', clientId ? clientId.substring(0, 10) + '...' : 'NOT SET');
  console.log('Client Secret:', clientSecret ? 'SET (' + clientSecret.length + ' chars)' : 'NOT SET');
  console.log('Domain:', sirvDomain);

  try {
    // Step 1: Get token
    console.log('\n1. Getting token...');
    const tokenResponse = await axios.post('https://api.sirv.com/v2/token', {
      clientId: clientId,
      clientSecret: clientSecret
    });

    console.log('Token response status:', tokenResponse.status);
    const token = tokenResponse.data.token;
    console.log('Token received:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');

    // Step 2: Test account info
    console.log('\n2. Testing account info...');
    const accountResponse = await axios.get('https://api.sirv.com/v2/account', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Account response status:', accountResponse.status);
    console.log('Account data:', JSON.stringify(accountResponse.data, null, 2));

    // Step 3: Test file upload
    console.log('\n3. Testing file upload...');
    const testImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', 'base64');
    
    const uploadResponse = await axios.post(
      'https://api.sirv.com/v2/files/upload?filename=/test-upload.png',
      testImageBuffer,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'image/png',
          'Content-Length': testImageBuffer.length.toString(),
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    console.log('Upload response status:', uploadResponse.status);
    console.log('Upload response:', JSON.stringify(uploadResponse.data, null, 2));
    console.log('SUCCESS: File uploaded successfully!');

  } catch (error) {
    console.error('ERROR:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testSirvCredentials();