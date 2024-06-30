const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);
const io = new Server(server);

let onlineUsers = {};

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {
  let nickname = "";

  socket.on("set nickname", (name) => {
    nickname = name;
    onlineUsers[socket.id] = nickname;
    io.emit("user connected", { nickname, onlineUsers });
  });

  socket.on("disconnect", () => {
    delete onlineUsers[socket.id];
    io.emit("user disconnected", { nickname, onlineUsers });
  });

  socket.on("chat message", (msg) => {
    socket.broadcast.emit("chat message", { nickname, msg });
  });

  socket.on("typing", () => {
    socket.broadcast.emit("typing", { nickname });
  });

  socket.on("stop typing", () => {
    socket.broadcast.emit("stop typing", { nickname });
  });
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});
