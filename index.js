const express = require("express");
const cors = require("cors");
const app = express();
const http = require("http");
const socketIO = require("socket.io");

const server = http.Server(app);

const users = [{}];

const port = 5000 || process.env.PORT;

app.get("/", (req, res) => {
  res.send("Hello its working");
});

app.use(
  cors({
    origin: "*",
  })
);

const io = socketIO(server);

io.on("connection", (socket) => {
  console.log("New connection");

  socket.on("joined", ({ user }) => {
    users[socket.id] = user;
    console.log(`${user} has joined`);
    socket.broadcast.emit("userJoined", {
      user: "Admin",
      message: `${users[socket.id]} has joined`,
    });
    socket.emit("welcome", {
      user: "Admin",
      message: `Welcome to the Chat, ${users[socket.id]}`,
    });
  });

  socket.on("message", ({ message, id }) => {
    io.emit("sendMessage", { user: users[id], message, id });
  });

  socket.on("disconnect", () => {
    socket.broadcast.emit("leave", {
      user: "Admin",
      message: `${users[socket.id]} has left`,
    });
    console.log(`User left`);
  });
});

server.listen(port, () => {
  console.log(`server is working on http://localhost:${port}`);
});
