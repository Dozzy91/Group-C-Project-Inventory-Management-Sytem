/**
 * Search Helpers module.
 * This file contains pure helper functions that perform input cleaning, string normalization,
 * and single-pass array search operations using built-in JavaScript methods.
 */

/**
 * Safely converts any value to a string, removes leading/trailing whitespace, and forces lowercase.
 * This ensures strict case-insensitive comparisons and prevents runtime errors if a field is null or undefined.
 * 
 * @param {*} val - The input value to clean (could be a string, number, undefined, etc.)
 * @returns {string} - The cleaned lowercase string.
 */
function cleanString(val) {
  // 1. String(val ?? ''): Convert to string safely. If val is null or undefined, use an empty string.
  // 2. .trim(): Remove unwanted leading and trailing spaces.
  // 3. .toLowerCase(): Enforce case insensitivity.
  return String(val ?? '').trim().toLowerCase();
}

/**
 * Searches the stores list by name or location.
 * Uses a single-pass .filter() array method.
 * 
 * @param {Array} stores - Array of store objects.
 * @param {string} query - The search query term.
 * @returns {Array} - List of matching stores.
 */
function searchStores(stores, query) {
  const cleanedQuery = cleanString(query);

  // If query is empty after cleaning, we return all stores.
  if (!cleanedQuery) {
    return stores;
  }

  // Single-pass filter: Check if name or location matches the query
  return stores.filter(store => {
    const nameMatch = cleanString(store.name).includes(cleanedQuery);
    const locationMatch = cleanString(store.location).includes(cleanedQuery);
    return nameMatch || locationMatch;
  });
}

/**
 * Searches for a specific user by their ID.
 * Uses a single-pass .find() array method to return the first matching user.
 * 
 * @param {Array} users - Array of user objects.
 * @param {string|number} id - The user ID to search for.
 * @returns {Object|undefined} - The user object if found, otherwise undefined.
 */
function findUserById(users, id) {
  const cleanedId = cleanString(id);

  if (!cleanedId) {
    return undefined;
  }

  // Single-pass find: Match database ID string exactly with requested ID string
  return users.find(user => cleanString(user.id) === cleanedId);
}

/**
 * Searches the items list by title, category, or item ID.
 * Uses a single-pass .filter() array method.
 * 
 * @param {Array} items - Array of item objects.
 * @param {string} query - The search query term.
 * @returns {Array} - List of matching items.
 */
function searchItems(items, query) {
  const cleanedQuery = cleanString(query);

  if (!cleanedQuery) {
    return items;
  }

  return items.filter(item => {
    const titleMatch = cleanString(item.title).includes(cleanedQuery);
    const categoryMatch = cleanString(item.category).includes(cleanedQuery);
    const idMatch = cleanString(item.id) === cleanedQuery;
    
    return titleMatch || categoryMatch || idMatch;
  });
}

/**
 * Performs an advanced combined search on items using optional category and search term.
 * 
 * @param {Array} items - Array of item objects.
 * @param {string} category - Specific category filter (e.g. "Electronics").
 * @param {string} term - Search term for title or item ID.
 * @returns {Array} - List of matching items.
 */
function advancedSearch(items, category, term) {
  const cleanedCategory = cleanString(category);
  const cleanedTerm = cleanString(term);

  // Single-pass filter implementing logical matching
  return items.filter(item => {
    const itemCategory = cleanString(item.category);
    const itemTitle = cleanString(item.title);
    const itemId = cleanString(item.id);

    // If both category and term are specified: match category and (term in title or term matches ID)
    if (cleanedCategory && cleanedTerm) {
      return itemCategory === cleanedCategory && (itemTitle.includes(cleanedTerm) || itemId === cleanedTerm);
    }

    // If only category is specified: match category exactly
    if (cleanedCategory) {
      return itemCategory === cleanedCategory;
    }

    // If only term is specified: search title, category, or ID (similar to simple item search)
    if (cleanedTerm) {
      return itemTitle.includes(cleanedTerm) || itemCategory.includes(cleanedTerm) || itemId === cleanedTerm;
    }

    // If neither parameter is specified, match everything
    return true;
  });
}

// Export the utility functions so they can be imported in the route handlers file
export {
  cleanString,
  searchStores,
  findUserById,
  searchItems,
  advancedSearch
};
