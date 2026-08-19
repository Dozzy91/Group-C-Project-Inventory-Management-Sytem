import express, { Router } from "express";
import { createUser, getAllUsers, searchUser, deleteUser, editUser, getAllUserInfo, getMe } from "../controllers/users.js";
import { login, logout } from "../controllers/auth.js";
import authMiddleware from "../middleware/authMiddleware.js";

const userRoute = express.Router();

// auth
userRoute.post("/login", login);
userRoute.post("/logout", logout);
userRoute.get("/me", authMiddleware, getMe);

userRoute.post("/create", createUser);
userRoute.get("/get", getAllUsers);
userRoute.get("/search/:id", searchUser);
userRoute.get("/get_all/:id/:userName", getAllUserInfo);
userRoute.patch("/edit", authMiddleware, editUser);
userRoute.delete("/delete", authMiddleware, deleteUser);

export default userRoute;
