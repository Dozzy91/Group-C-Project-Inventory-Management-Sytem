import express, { Router } from "express";
import {
  createStore,
  createItem,
  getAllStores,
  getStore,
  searchStores,
  editStore,
  deleteStore,
  getAllStoreItems,
  searchItem,
  editItem,
  deleteItem,
  retrieveItems,
  getOrderHistory,
} from "../controllers/stocks.js";
import authMiddleware from "../middleware/authMiddleware.js";

const stockRoute = express.Router();

stockRoute.get("/get_all_stores", getAllStores);
stockRoute.get("/get_store/:storeName", getStore);
stockRoute.get("/search_store/:query", searchStores);
stockRoute.post("/create_store", authMiddleware, createStore);
stockRoute.patch("/edit_store/:oldStoreName", authMiddleware, editStore);
stockRoute.delete("/delete_store/:storeName", authMiddleware, deleteStore);


// items
stockRoute.get("/get_all_store_items/:storeName", getAllStoreItems);
stockRoute.get("/search_item/:storeName/:itemName", searchItem);
stockRoute.post("/create_item", authMiddleware, createItem);
stockRoute.patch("/edit_item/:storeName/:itemId", authMiddleware, editItem);
stockRoute.delete("/delete_item/:storeName/:itemId", authMiddleware, deleteItem);

// batch retrieval (withdraw/sell stock) + history
stockRoute.post("/retrieve_items/:storeName", authMiddleware, retrieveItems);
stockRoute.get("/order_history/:storeName", authMiddleware, getOrderHistory);


export default stockRoute;
