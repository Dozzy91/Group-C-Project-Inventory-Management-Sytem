/**
 * Test runner script for the Search API.
 * Spins up a test instance of the Express server on a temporary port,
 * executes HTTP requests against each endpoint to verify behavior,
 * and outputs results.
 */

import express from 'express';
const app = express();

// Set up middleware
app.use(express.json());

// Import and mount the search router (relative paths MUST end in .js in Node ES Modules)
import searchRouter from './searchRoutes.js';
app.use('/api', searchRouter);

const PORT = 4567; // Use a different port to avoid conflict with standard running app

// Start temporary test server
const server = app.listen(PORT, async () => {
  console.log(`🧪 Starting Search API Integration Tests on port ${PORT}...\n`);
  
  let failed = false;

  const assertTest = (testName, condition, actualResponse) => {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
    } else {
      console.error(`❌ FAIL: ${testName}`);
      console.error(`   Actual Response:`, JSON.stringify(actualResponse, null, 2));
      failed = true;
    }
  };

  try {
    // -------------------------------------------------------------------------
    // TEST 1: GET /api/stores?query=  NEW york (whitespace + case insensitivity)
    // -------------------------------------------------------------------------
    const res1 = await fetch(`http://localhost:${PORT}/api/stores?query=%20%20NEW%20york%20`);
    const body1 = await res1.json();
    assertTest(
      'GET /api/stores?query=  NEW york ',
      res1.status === 200 &&
      body1.success === true &&
      body1.count === 2 &&
      body1.data.length === 2 &&
      body1.data.some(s => s.name === 'Tech Junction') &&
      body1.data.some(s => s.name === 'Mega Mart'),
      body1
    );

    // -------------------------------------------------------------------------
    // TEST 2: GET /api/users/:id (valid ID 102)
    // -------------------------------------------------------------------------
    const res2 = await fetch(`http://localhost:${PORT}/api/users/102`);
    const body2 = await res2.json();
    assertTest(
      'GET /api/users/102 (Valid User)',
      res2.status === 200 &&
      body2.success === true &&
      body2.count === 1 &&
      body2.data.length === 1 &&
      body2.data[0].id === '102' &&
      body2.data[0].name === 'Bob Smith',
      body2
    );

    // -------------------------------------------------------------------------
    // TEST 3: GET /api/users/:id (invalid ID 999 - 404 Not Found check)
    // -------------------------------------------------------------------------
    const res3 = await fetch(`http://localhost:${PORT}/api/users/999`);
    const body3 = await res3.json();
    assertTest(
      'GET /api/users/999 (User Not Found)',
      res3.status === 404 &&
      body3.success === false &&
      body3.count === 0 &&
      body3.error === 'Not Found',
      body3
    );

    // -------------------------------------------------------------------------
    // TEST 4: GET /api/items?query=electronics (case insensitivity)
    // -------------------------------------------------------------------------
    const res4 = await fetch(`http://localhost:${PORT}/api/items?query=electronics`);
    const body4 = await res4.json();
    assertTest(
      'GET /api/items?query=electronics',
      res4.status === 200 &&
      body4.success === true &&
      body4.count === 2 &&
      body4.data.every(item => item.category === 'Electronics'),
      body4
    );

    // -------------------------------------------------------------------------
    // TEST 5: GET /api/items?query=i5 (search by item ID)
    // -------------------------------------------------------------------------
    const res5 = await fetch(`http://localhost:${PORT}/api/items?query=i5`);
    const body5 = await res5.json();
    assertTest(
      'GET /api/items?query=i5 (Search by ID)',
      res5.status === 200 &&
      body5.success === true &&
      body5.count === 1 &&
      body5.data[0].id === 'i5' &&
      body5.data[0].title === 'Mechanical Pencil Set',
      body5
    );

    // -------------------------------------------------------------------------
    // TEST 6: POST /api/search/advanced (combining category + term)
    // -------------------------------------------------------------------------
    const res6 = await fetch(`http://localhost:${PORT}/api/search/advanced`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: '  ELECTRONICS ', term: '  mOuSe  ' })
    });
    const body6 = await res6.json();
    assertTest(
      'POST /api/search/advanced (category & term combined)',
      res6.status === 200 &&
      body6.success === true &&
      body6.count === 1 &&
      body6.data[0].id === 'i1' &&
      body6.data[0].title === 'Wireless Mouse',
      body6
    );

    console.log('\n-------------------------------------------------');
    if (failed) {
      console.error('❌ Some tests failed. Please review logs above.');
      process.exitCode = 1;
    } else {
      console.log('🎉 All test cases passed successfully!');
      process.exitCode = 0;
    }
    console.log('-------------------------------------------------\n');

  } catch (error) {
    console.error('❌ Unexpected test runner error:', error);
    process.exitCode = 1;
  } finally {
    server.close(() => {
      console.log('Test server shut down.');
    });
  }
});
