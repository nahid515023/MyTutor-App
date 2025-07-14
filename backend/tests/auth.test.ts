
// Simple authentication tests
// To run these tests, you'll need to install Jest: npm install --save-dev jest @types/jest ts-jest
// For Node.js globals (require/module), add: npm install --save-dev @types/node
/// <reference types="node" />

const BASE_URL = 'http://localhost:3001/api/auth';

// Manual test functions (can be run with node)
export const manualTests = {
  async testPasswordStrength() {
    console.log('Testing password strength...');
    
    const weakPasswords = [
      'weak',
      'password',
      '12345678',
      'Password',
      'Password1'
    ];
    
    const strongPasswords = [
      'StrongPass123!',
      'MySecure@Pass1',
      'Test123!Strong'
    ];
    
    console.log('Weak passwords (should fail):');
    for (const password of weakPasswords) {
      try {
        const response = await fetch(`${BASE_URL}/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Test',
            email: `test${Math.random()}@example.com`,
            password,
            role: 'STUDENT'
          })
        });
        console.log(`Password "${password}": ${response.status === 400 ? 'REJECTED ✅' : 'ACCEPTED ❌'}`);
      } catch (error) {
        console.log(`Password "${password}": ERROR - ${error}`);
      }
    }
  },

  async testRateLimit() {
    console.log('Testing rate limiting...');
    
    try {
      const attempts = Array.from({ length: 6 }, (_, i) => 
        fetch(`${BASE_URL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'nonexistent@example.com',
            password: 'wrong',
            role: 'STUDENT'
          })
        })
      );
      
      const responses = await Promise.all(attempts);
      const statuses = responses.map(r => r.status);
      
      console.log('Response statuses:', statuses);
      console.log('Rate limiting:', statuses.includes(429) ? 'WORKING ✅' : 'NOT WORKING ❌');
    } catch (error) {
      console.log('Rate limit test error:', error);
    }
  },

  async testHealthCheck() {
    console.log('Testing health check...');
    
    try {
      const response = await fetch('http://localhost:3001/health');
      const data = await response.json();
      
      console.log('Health check:', response.status === 200 ? 'OK ✅' : 'FAILED ❌');
      console.log('Response:', data);
    } catch (error) {
      console.log('Health check error:', error);
    }
  },

  async testSecurityHeaders() {
    console.log('Testing security headers...');
    
    try {
      const response = await fetch('http://localhost:3001/');
      const headers = response.headers;
      
      const securityHeaders = [
        'x-content-type-options',
        'x-frame-options',
        'x-xss-protection',
        'referrer-policy'
      ];
      
      console.log('Security headers:');
      securityHeaders.forEach(header => {
        const value = headers.get(header);
        console.log(`${header}: ${value ? 'PRESENT ✅' : 'MISSING ❌'}`);
      });
    } catch (error) {
      console.log('Security headers test error:', error);
    }
  }
};

// Run manual tests if this file is executed directly
// Run manual tests if this file is executed directly
if (require.main === module) {
  (async () => {
    console.log('🧪 Running MyTutor Authentication Tests\n');
    try {
      await manualTests.testHealthCheck();
      console.log();
      await manualTests.testSecurityHeaders();
      console.log();
      await manualTests.testPasswordStrength();
      console.log();
      await manualTests.testRateLimit();
      console.log();
      console.log('✅ Tests completed!');
      console.log('\n📋 Manual Testing Checklist:');
      console.log('1. Start the server: npm run dev');
      console.log('2. Run tests: node tests/auth.test.js');
      console.log('3. Check logs: npm run logs:view');
      console.log('4. Test frontend integration');
    } catch (error) {
      console.error('❌ Test error:', error);
    }
  })();
}
