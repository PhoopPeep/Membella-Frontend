/**
 * Debug script to test Omise integration
 * Run this in browser console to debug Omise issues
 */

// Test Omise library loading
function testOmiseLibrary() {
  console.log('🔍 Testing Omise Library...');

  if (typeof window.Omise === 'undefined') {
    console.error('❌ Omise library not loaded');
    return false;
  }

  console.log('✅ Omise library loaded');
  console.log('Omise object:', window.Omise);
  return true;
}

// Test Omise public key
function testOmisePublicKey() {
  console.log('🔍 Testing Omise Public Key...');

  if (!window.Omise) {
    console.error('❌ Omise library not loaded');
    return false;
  }

  const publicKey = window.Omise.getPublicKey();
  console.log('Public Key:', publicKey);

  if (!publicKey) {
    console.error('❌ No public key set');
    return false;
  }

  if (!publicKey.startsWith('pkey_')) {
    console.error('❌ Invalid public key format');
    return false;
  }

  console.log('✅ Public key is valid');
  return true;
}

// Test PromptPay source creation
function testPromptPaySource() {
  console.log('🔍 Testing PromptPay Source Creation...');

  if (!window.Omise) {
    console.error('❌ Omise library not loaded');
    return false;
  }

  const amount = 2000; // 20 THB in satang

  return new Promise((resolve) => {
    window.Omise.createSource('promptpay', {
      amount: amount,
      currency: 'thb'
    }, (statusCode, response) => {
      console.log('Status Code:', statusCode);
      console.log('Response:', response);

      if (statusCode === 200) {
        console.log('✅ PromptPay source created successfully');
        console.log('Source ID:', response.id);
        console.log('Amount:', response.amount);
        console.log('Currency:', response.currency);
        console.log('Type:', response.type);

        if (response.scannable_code) {
          console.log('✅ Scannable code exists');
          console.log('Scannable code type:', response.scannable_code.type);

          if (response.scannable_code.image) {
            console.log('✅ Image exists');
            console.log('Image URI:', response.scannable_code.image.download_uri);
            resolve(true);
          } else {
            console.error('❌ Image object is null or missing');
            console.log('Scannable code structure:', response.scannable_code);
            resolve(false);
          }
        } else {
          console.error('❌ Scannable code is null or missing');
          resolve(false);
        }
      } else {
        console.error('❌ PromptPay source creation failed');
        console.error('Error:', response.message || 'Unknown error');
        resolve(false);
      }
    });
  });
}

// Test card token creation
function testCardToken() {
  console.log('🔍 Testing Card Token Creation...');

  if (!window.Omise) {
    console.error('❌ Omise library not loaded');
    return false;
  }

  const cardData = {
    name: 'Test User',
    number: '4242424242424242',
    expiration_month: '12',
    expiration_year: '2025',
    security_code: '123'
  };

  return new Promise((resolve) => {
    window.Omise.createToken('card', cardData, (statusCode, response) => {
      console.log('Status Code:', statusCode);
      console.log('Response:', response);

      if (statusCode === 200) {
        console.log('✅ Card token created successfully');
        console.log('Token ID:', response.id);
        console.log('Card Brand:', response.card.brand);
        console.log('Last 4 digits:', response.card.last_digits);
        resolve(true);
      } else {
        console.error('❌ Card token creation failed');
        console.error('Error:', response.message || 'Unknown error');
        resolve(false);
      }
    });
  });
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Omise Debug Tests...\n');

  const tests = [
    { name: 'Omise Library', test: testOmiseLibrary },
    { name: 'Public Key', test: testOmisePublicKey },
    { name: 'PromptPay Source', test: testPromptPaySource },
    { name: 'Card Token', test: testCardToken }
  ];

  const results = {};

  for (const { name, test } of tests) {
    console.log(`\n--- ${name} Test ---`);
    try {
      const result = await test();
      results[name] = result;
      console.log(`${result ? '✅' : '❌'} ${name} test ${result ? 'passed' : 'failed'}`);
    } catch (error) {
      console.error(`❌ ${name} test error:`, error);
      results[name] = false;
    }
  }

  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  Object.entries(results).forEach(([name, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${name}: ${passed ? 'PASS' : 'FAIL'}`);
  });

  const allPassed = Object.values(results).every(result => result);
  console.log(`\n${allPassed ? '🎉 All tests passed!' : '⚠️ Some tests failed. Check the logs above.'}`);

  return results;
}

// Export functions for manual testing
window.omiseDebug = {
  testOmiseLibrary,
  testOmisePublicKey,
  testPromptPaySource,
  testCardToken,
  runAllTests
};

console.log('🔧 Omise Debug Tools loaded!');
console.log('Available functions:');
console.log('- omiseDebug.testOmiseLibrary()');
console.log('- omiseDebug.testOmisePublicKey()');
console.log('- omiseDebug.testPromptPaySource()');
console.log('- omiseDebug.testCardToken()');
console.log('- omiseDebug.runAllTests()');
console.log('\nRun omiseDebug.runAllTests() to test everything!');
