import express, { Router } from "express";
import { createUser, getAllUsers, searchUser, deleteUser, editUser } from "../controllers/users.js";
import authMiddleware from "../middleware/authMiddleware";

const userRoute = express.Router();

userRoute.post("/create", createUser);
userRoute.get("/get", getAllUsers);
userRoute.get("/search/:id", searchUser);
userRoute.patch("/edit/:id/:password", authMiddleware, editUser)
userRoute.delete("/delete/:id/:password", authMiddleware, deleteUser);

export default userRoute;
