import express, { Router } from "express";
import { createUser, getAllUsers, searchUser, deleteUser, editUser, getAllUserInfo } from "../controllers/users.js";
import authMiddleware from "../middleware/authMiddleware.js";

const userRoute = express.Router();

userRoute.post("/create", createUser);
userRoute.get("/get", getAllUsers);
userRoute.get("/search/:id", searchUser);
userRoute.get("/get_all/:id/:userName", getAllUserInfo);
userRoute.patch("/edit/:id/:password", authMiddleware, editUser)
userRoute.delete("/delete/:id/:password", authMiddleware, deleteUser);

export default userRoute;
