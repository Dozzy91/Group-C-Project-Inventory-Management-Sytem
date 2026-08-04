/**
 * Search Routes module.
 * This file registers the Express routes for the Search API.
 * It imports the mock database and utility search helpers, then uses them
 * to process incoming requests and send back standardized JSON responses.
 */

// Import Express to use its Router class
import express from 'express';

// Create a new router instance. This allows us to define routes in this file
// and easily mount/register them in our main server file using app.use().
const router = express.Router();

// Import the mock database arrays (relative paths MUST end in .js in Node ES Modules)
import { stores, users, items } from './mockDatabase.js';

// Import the search helper functions (relative paths MUST end in .js in Node ES Modules)
import {
  searchStores,
  findUserById,
  searchItems,
  advancedSearch
} from './searchHelpers.js';

/**
 * -----------------------------------------------------------------------------
 * 1. SEARCH STORES
 * ROUTE: GET /api/stores?query=
 * -----------------------------------------------------------------------------
 * 
 * CONCEPT - req.query:
 * In Express, `req.query` is an object that contains a property for each query
 * parameter in the URL. For example, in the URL:
 *   http://localhost:3000/api/stores?query=San+Francisco
 * Express automatically parses the query and sets:
 *   req.query.query = "San Francisco"
 */
router.get('/stores', (req, res) => {
  try {
    // Extract the 'query' parameter from the URL query string
    const query = req.query.query;

    // Use our clean, single-pass helper to filter the mock database
    const results = searchStores(stores, query);

    /**
     * HTTP Status 200 OK:
     * This status code indicates that the request succeeded. The server has found the
     * requested resources (if any) and is returning them in the response.
     */
    res.status(200).json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    /**
     * HTTP Status 500 Internal Server Error:
     * This status code indicates that the server encountered an unexpected error
     * that prevented it from fulfilling the request (e.g., database crash or code error).
     */
    res.status(500).json({
      success: false,
      count: 0,
      data: [],
      error: "Internal Server Error",
      message: "An unexpected error occurred while searching stores."
    });
  }
});

/**
 * -----------------------------------------------------------------------------
 * 2. SEARCH USER BY ID
 * ROUTE: GET /api/users/:id
 * -----------------------------------------------------------------------------
 * 
 * CONCEPT - req.params:
 * In Express, `req.params` contains properties mapped to the named route "parameters"
 * or placeholders defined in the path. In our route path `/users/:id`, the colon (:) 
 * denotes a parameter named "id".
 * If a user sends a request to:
 *   http://localhost:3000/api/users/102
 * Express will parse the path and set:
 *   req.params.id = "102"
 */
router.get('/users/:id', (req, res) => {
  try {
    // Extract the 'id' parameter from the URL path
    const { id } = req.params;

    // Check if ID is provided and is not just empty spaces
    if (!id || id.trim() === '') {
      /**
       * HTTP Status 400 Bad Request:
       * This status code indicates that the server cannot or will not process the
       * request because of a client-side error (e.g., missing parameter or malformed syntax).
       */
      return res.status(400).json({
        success: false,
        count: 0,
        data: [],
        error: "Bad Request",
        message: "A valid User ID route parameter must be provided."
      });
    }

    // Call helper to find the user in the mock database
    const user = findUserById(users, id);

    // If no user matches the ID, return a 404 error response
    if (!user) {
      /**
       * HTTP Status 404 Not Found:
       * This status code indicates that the server could not find the requested resource.
       * This is the standard response when the URL is valid, but the target record doesn't exist.
       */
      return res.status(404).json({
        success: false,
        count: 0,
        data: [],
        error: "Not Found",
        message: `User with ID '${id}' was not found in our database.`
      });
    }

    /**
     * HTTP Status 200 OK:
     * Request completed successfully.
     * Note: We wrap the single user object inside an array [user] to satisfy the
     * requirement of returning a standardized array data format: data: [...]
     */
    res.status(200).json({
      success: true,
      count: 1,
      data: [user]
    });
  } catch (error) {
    /**
     * HTTP Status 500 Internal Server Error:
     * Handles any unexpected coding errors during execution.
     */
    res.status(500).json({
      success: false,
      count: 0,
      data: [],
      error: "Internal Server Error",
      message: "An unexpected error occurred while retrieving the user."
    });
  }
});

/**
 * -----------------------------------------------------------------------------
 * 3. SEARCH ITEMS
 * ROUTE: GET /api/items?query=
 * -----------------------------------------------------------------------------
 */
router.get('/items', (req, res) => {
  try {
    // Extract search query from URL parameters
    const query = req.query.query;

    // Perform item search using helper function
    const results = searchItems(items, query);

    /**
     * HTTP Status 200 OK:
     * Request successfully processed. Returns list of matches.
     */
    res.status(200).json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    /**
     * HTTP Status 500 Internal Server Error:
     * Catches and reports backend errors.
     */
    res.status(500).json({
      success: false,
      count: 0,
      data: [],
      error: "Internal Server Error",
      message: "An unexpected error occurred while searching items."
    });
  }
});

/**
 * -----------------------------------------------------------------------------
 * 4. ADVANCED MULTI-FIELD SEARCH
 * ROUTE: POST /api/search/advanced
 * -----------------------------------------------------------------------------
 * 
 * CONCEPT - req.body:
 * In Express, `req.body` contains key-value pairs of data submitted in the
 * request body. By default, it is undefined, and must be populated using a body-parsing
 * middleware such as `express.json()`.
 * For a POST request sending JSON:
 *   {
 *     "category": "Electronics",
 *     "term": "Keyboard"
 *   }
 * Express parses the JSON payload and populates:
 *   req.body.category = "Electronics"
 *   req.body.term = "Keyboard"
 */
router.post('/search/advanced', (req, res) => {
  try {
    // Extract category and term from JSON body
    const { category, term } = req.body;

    // Perform combined advanced search on items
    const results = advancedSearch(items, category, term);

    /**
     * HTTP Status 200 OK:
     * Request completed successfully. Returning search matches.
     */
    res.status(200).json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    /**
     * HTTP Status 500 Internal Server Error:
     * Catches issues parsing body or filtering items.
     */
    res.status(500).json({
      success: false,
      count: 0,
      data: [],
      error: "Internal Server Error",
      message: "An unexpected error occurred during the advanced search."
    });
  }
});

// Export the router module so that it can be imported and mounted by team members
// in their main application server (e.g., using `app.use('/api', searchRouter)`)
export default router;
