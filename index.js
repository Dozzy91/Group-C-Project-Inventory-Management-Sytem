import http from 'http';
import express from 'express';

const PORT = 3000;

const app = express();

app.use(express.json());


http.createServer(app).listen(PORT, "127.0.0.1", () => {
    console.log("Server running on port: " + PORT);
});