const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL;
const MAKE_WEBHOOK_SECRET = process.env.MAKE_WEBHOOK_SECRET;

async function testMake() {
  console.log('Testing Make.com Webhook...');
  console.log('URL:', MAKE_WEBHOOK_URL);
  
  const payload = {
    api_secret: MAKE_WEBHOOK_SECRET,
    post_id: 'test_manual_' + Date.now(),
    text: 'Test message from Antigravity debugger',
    media_url: null,
    media_urls: [],
    platforms: ['facebook'],
    metadata: {
      test: true
    }
  };

  try {
    const response = await fetch(MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    console.log('Status:', response.status);
    const text = await response.text();
    console.log('Response:', text);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testMake();
