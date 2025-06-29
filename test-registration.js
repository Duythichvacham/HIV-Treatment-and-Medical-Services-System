const fetch = require('node-fetch');

async function testRegistration() {
  try {
    console.log('Testing registration endpoint...');
    console.log('Server URL: http://localhost:5000/api/auth/register/patient');
    
    const requestBody = {
      username: 'testuser123',
      password: '123456',
      fullName: 'Test User',
      dob: '1990-01-01',
      gender: 'male',
      email: 'test123@example.com',
      phone: '0123456789',
      address: 'Test Address'
    };
    
    console.log('Request body:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch('http://localhost:5000/api/auth/register/patient', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('Response status:', response.status);
    console.log('Response status text:', response.statusText);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log('Response data:', data);
    
  } catch (error) {
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
  }
}

testRegistration(); 