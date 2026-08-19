import http from "http";
import express from "express";
import cookieParser from "cookie-parser";
import userRoute from "./routes/user.js";
import stockRoute from "./routes/stock.js";
import cors from 'cors';
import "dotenv/config";


const PORT = process.env.PORT;
// The frontend runs on a different origin (Vite dev server), and it must be
// this exact origin for the browser to accept/send the auth cookie - `*`
// cannot be combined with credentials: true.

const FRONTEND_URL = process.env.FRONTEND_URL;
const HOST_NAME = process.env.HOST_NAME;

const app = express();

app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send(`Welcome to the Inventory application`);
});

app.use("/user", userRoute);
app.use("/inventory", stockRoute);

http.createServer(app).listen(PORT, HOST_NAME, () => {
  console.log("Server running on port: " + PORT);
});