import express, { Router } from "express";
import { createUser } from "../controllers/users.js";

const userRoute = express.Router();

userRoute.post("/create_user", createUser);

export default userRoute;
