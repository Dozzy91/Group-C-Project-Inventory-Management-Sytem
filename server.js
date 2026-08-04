/**
 * Entry point for our search API server.
 * This file boots up the Express application, mounts middleware (like body parsing),
 * and hooks up the search router to the '/api' prefix.
 */

// Import express
import express from 'express';

// Initialize the Express app
const app = express();

// Set the port we want our server to run on
const PORT = process.env.PORT || 3000;

/**
 * MIDDLEWARE: Express JSON Body Parser
 * By default, Express cannot read JSON payloads in the request body (req.body).
 * This middleware parses incoming requests with JSON payloads and makes
 * the parsed data available under req.body.
 * 
 * Without this, req.body would be undefined in our POST /api/search/advanced endpoint!
 */
app.use(express.json());

// Import the search router module (relative paths MUST end in .js in Node ES Modules)
import searchRouter from './searchRoutes.js';

/**
 * MOUNTING THE ROUTER:
 * We mount the search router under the '/api' path prefix.
 * This means:
 * - The route GET '/stores' in searchRoutes.js becomes GET '/api/stores'
 * - The route GET '/users/:id' in searchRoutes.js becomes GET '/api/users/:id'
 * - The route GET '/items' in searchRoutes.js becomes GET '/api/items'
 * - The route POST '/search/advanced' in searchRoutes.js becomes POST '/api/search/advanced'
 */
app.use('/api', searchRouter);

// Fallback route for undefined paths
app.use((req, res) => {
  // HTTP Status 404 Not Found: Used when the user requests an API endpoint that doesn't exist.
  res.status(404).json({
    success: false,
    count: 0,
    data: [],
    error: "Not Found",
    message: "The requested route does not exist. Did you mean to prefix with /api?"
  });
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`🚀 Search API Server is running on port ${PORT}`);
  console.log(`=================================================`);
  console.log(`Available endpoints:`);
  console.log(`👉 GET  http://localhost:${PORT}/api/stores?query=`);
  console.log(`👉 GET  http://localhost:${PORT}/api/users/:id`);
  console.log(`👉 GET  http://localhost:${PORT}/api/items?query=`);
  console.log(`👉 POST http://localhost:${PORT}/api/search/advanced`);
  console.log(`=================================================`);
});
