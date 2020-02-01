const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io").listen(server);
const port = 3000;

let repairiSocket = null;
let motoristSocket = null;

io.on("connection", socket => {
  console.log("a user connected :D");
  socket.on("repairRequest", repairRoute => {
    motoristSocket = socket;
    console.log("Someone wants a repair!", repairRoute);
    if (repairSocket !== null) {
      repairSocket.emit("repairRequest", repairRoute);
    }
  });

  socket.on("MechanicRequest", repairRoute => {
    motoristSocket = socket;
    console.log("Someone wants a mechanic", repairRoute);
    if (repairSocket !== null) {
      repairSocket.emit("MechanicRequest", repairRoute);
    }
  });


  

  socket.on("mechanicLocation", mechanicLocation => {
    console.log(mechanicLocation);
    motoristSocket.emit("mechanicLocation", mechanicLocation);
  });

  socket.on("motoristRequest", () => {
    console.log("Someone wants a motorist!");
    repairSocket = socket;
  });



});

server.listen(port, () => console.log("server running on port:" + port));
