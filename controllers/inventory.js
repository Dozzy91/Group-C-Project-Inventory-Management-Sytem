import { readData, writeData } from "../utils/fileOperations.js";

// Path to the inventory database
const pathToInventoryDb = new URL("../data/inventory.json", import.meta.url);

/**
 * ==========================================
 * Create Product
 * POST /inventory
 * ==========================================
 */
export function createProduct(req, res) {
    try {

        // Get request body
        const {
            productName,
            category,
            price,
            quantity,
            description
        } = req.body;

        // ============================
        // Validate request body
        // ============================
        if (
            !productName ||
            !category ||
            price === undefined ||
            quantity === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "Product Name, Category, Price and Quantity are required."
            });
        }

        // Price must be greater than zero
        if (price <= 0) {
            return res.status(400).json({
                success: false,
                message: "Price must be greater than zero."
            });
        }

        // Quantity cannot be negative
        if (quantity < 0) {
            return res.status(400).json({
                success: false,
                message: "Quantity cannot be negative."
            });
        }

        // Read inventory database
        const inventory = readData(pathToInventoryDb);

        // ============================
        // BONUS:
        // Check duplicate product
        // ============================
       const existingProduct = inventory.find(
    product =>
        product.productName.trim().toLowerCase() ===
        productName.trim().toLowerCase()
);


        if (existingProduct) {
            return res.status(409).json({
                success: false,
                message: "Product already exists."
            });
        }

        // ============================
        // BONUS:
        // Generate Product ID
        // ============================
        const productId = `PROD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // Current date
        const currentDate = new Date().toISOString();

        // Create new product object
        const newProduct = {
            productId,
            productName,
            category,
            price: Number(price),
            quantity: Number(quantity),
            description: description || "",
            createdAt: currentDate,
            updatedAt: currentDate
        };

        // Save product
        inventory.push(newProduct);

        writeData(pathToInventoryDb, inventory);

        // Success response
        return res.status(201).json({
            success: true,
            message: "Product created successfully.",
            data: newProduct
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error."
        });

    }
}

/**
 * ==========================================
 * Get Single Product
 * GET /inventory/:id
 * ==========================================
 */
export function getSingleProduct(req, res) {

    try {

        // Get Product ID from URL
        const productId = req.params.id;

        // Read inventory database
        const inventory = readData(pathToInventoryDb);

        // Find product
        const product = inventory.find(
            item => item.productId === productId
        );

        // Product not found
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found."
            });
        }

        // Return product
        return res.status(200).json({
            success: true,
            message: "Product retrieved successfully.",
            data: product
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error."
        });

    }

}