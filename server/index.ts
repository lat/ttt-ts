import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);  // Pass express app to createServer
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    allowedHeaders: ["Content-Type"],
    credentials: true
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

httpServer.listen(3000, () => {
  console.log("Server running on port 3000");
});