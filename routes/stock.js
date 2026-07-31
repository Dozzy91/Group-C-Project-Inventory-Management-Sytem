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
  deleteItem
} from "../controllers/stocks.js";
import authMiddleware from "../middleware/authMiddleware.js";

const stockRoute = express.Router();

stockRoute.get("/get_all_stores", getAllStores);
stockRoute.get("/get_store/:storeName", getStore);
stockRoute.get("/search_store/:query", searchStores);
stockRoute.post("/create_store/:id/:password", authMiddleware, createStore);
stockRoute.patch("/edit_store/:id/:password/:oldStoreName", authMiddleware, editStore);
stockRoute.delete("/delete_store/:id/:password/:storeName", authMiddleware, deleteStore);


// items
stockRoute.get("/get_all_store_items/:storeName", getAllStoreItems);
stockRoute.get("/search_item/:storeName/:itemName", searchItem);
stockRoute.post("/create_item/:id/:password", authMiddleware, createItem);
stockRoute.patch("/edit_item/:id/:password/:storeName/:itemId", authMiddleware, editItem);
stockRoute.delete("/delete_item/:id/:password/:storeName/:itemId", authMiddleware, deleteItem);


export default stockRoute;
