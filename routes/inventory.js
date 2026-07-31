import express from "express";

// Import the controller functions
import {
    createProduct,
    getSingleProduct
} from "../controllers/inventory.js";

// Create a router
const router = express.Router();

/**
 * ===================================
 * Inventory Routes
 * ===================================
 */

// Create Product
// POST /inventory
router.post("/", createProduct);

// Get Single Product
// GET /inventory/:id
router.get("/:id", getSingleProduct);

// Export router
export default router;