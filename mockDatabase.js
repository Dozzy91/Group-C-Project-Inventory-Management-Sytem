/**
 * Mock Database module.
 * This file serves as an in-memory database containing seed data for our search API.
 * It exposes arrays for stores, users, and items.
 */

// Sample dataset for Stores
const stores = [
  { id: "s1", name: "Tech Junction", location: "New York" },
  { id: "s2", name: "Green Grocers", location: "San Francisco" },
  { id: "s3", name: "Mega Mart", location: "New York" },
  { id: "s4", name: "Fashion Hub", location: "Los Angeles" },
  { id: "s5", name: "Book Haven", location: "San Francisco" }
];

// Sample dataset for Users
const users = [
  { id: "101", name: "Alice Johnson", email: "alice@example.com", role: "admin" },
  { id: "102", name: "Bob Smith", email: "bob@example.com", role: "user" },
  { id: "103", name: "Charlie Brown", email: "charlie@example.com", role: "moderator" },
  { id: "104", name: "Diana Prince", email: "diana@example.com", role: "user" }
];

// Sample dataset for Items
const items = [
  { id: "i1", title: "Wireless Mouse", category: "Electronics", price: 29.99 },
  { id: "i2", title: "Organic Apple juice", category: "Groceries", price: 4.99 },
  { id: "i3", title: "Bluetooth Keyboard", category: "Electronics", price: 49.99 },
  { id: "i4", title: "Denim Jacket", category: "Apparel", price: 59.99 },
  { id: "i5", title: "Mechanical Pencil Set", category: "Stationery", price: 9.99 },
  { id: "i6", title: "Introduction to JavaScript", category: "Books", price: 39.99 }
];

// Exporting the mock datasets so they can be loaded by other files (such as helpers or controllers)
export {
  stores,
  users,
  items
};
