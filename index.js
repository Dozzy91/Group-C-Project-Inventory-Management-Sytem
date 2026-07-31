import http from "http";
import express from "express";

// Import Inventory Routes
import inventoryRoutes from "./routes/inventory.js";

const PORT = 3000;

const app = express();

// =====================================
// Middleware
// =====================================

// Allow Express to read JSON data
app.use(express.json());

// =====================================
// Home Route
// =====================================

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Welcome to the Inventory Management System API"
    });
});

// =====================================
// Inventory Routes
// =====================================

app.use("/inventory", inventoryRoutes);

// =====================================
// 404 Route
// =====================================

// Handles routes that don't exist
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found."
    });
});

// =====================================
// Start Server
// =====================================

const server = http.createServer(app);

server.listen(PORT, "127.0.0.1", () => {
    console.log(`Server is running on http://127.0.0.1:${PORT}`);
});