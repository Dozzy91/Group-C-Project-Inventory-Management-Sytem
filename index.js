import http from "http";
import express from "express";
import userRoute from "./routes/user.js";
import stockRoute from "./routes/stock.js";
import cors from 'cors';

const PORT = 3000;

const app = express();

app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
  res.send(`Welcome to the Inventory application`);
});

app.use("/user", userRoute);
app.use("/inventory", stockRoute);


http.createServer(app).listen(PORT, "127.0.0.1", () => {
  console.log("Server running on port: " + PORT);
});
