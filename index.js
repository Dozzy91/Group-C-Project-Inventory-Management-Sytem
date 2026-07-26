import http from "http";
import express from "express";
import userRoute from "./routes/user.js";

const PORT = 3000;

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send(`Welcome to the Inventory application`);
});

app.use("/user", userRoute);

http.createServer(app).listen(PORT, "127.0.0.1", () => {
  console.log("Server running on port: " + PORT);
});
