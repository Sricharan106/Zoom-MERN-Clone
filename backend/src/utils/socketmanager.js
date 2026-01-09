const { Server } = require("socket.io");

const connectToSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: true,
      methods: ["GET", "POST"],
      credentials: true,
    }, // not for production
  });

  let connections = {};
  let messages = {};
  let timeOnline = {};

  io.on("connection", (socket) => {
    console.log("SOMETHING CONNECTED");

    socket.on("joinCall", (path) => {
      if (connections[path] === undefined) {
        connections[path] = [];
      }
      connections[path].push(socket.id);
      timeOnline[socket.id] = new Date();
      for (let i = 0; i < connections[path].length; i++) {
        io.to(connections[path][i]).emit(
          "user-joined",
          socket.id,
          connections[path]
        );
      }
      if (messages[path] !== undefined) {
        for (let i = 0; i < messages[path].length; i++) {
          io.to(socket.id).emit(
            "chat-message",
            messages[path][i]["data"],
            messages[path][i]["sender"],
            messages[path][i]["socket-id-sender"]
          );
        }
      }
    });
    socket.on("signal", (toid, message) => {
      io.to(toid).emit("signal", socket.id, message);
    });
    socket.on("chat-message", (data, sender) => {
      const [matchingRoom, found] = Object.entries(connections).reduce(
        ([room, isFound], [roomKey, roomValue]) => {
          if (!isFound && roomValue.includes(socket.id)) {
            return [roomKey, true];
          }
          return [room, isFound];
        },
        ["", false]
      );

      if (found === true) {
        if (messages[matchingRoom] === undefined) {
          messages[matchingRoom] = [];
        }
        messages[matchingRoom].push({
          sender: sender,
          date: new Date(),
          "socket-id-sender": socket.id,
          data: data,
        });
        connections[matchingRoom].forEach((element) => {
          io.to(element).emit("chat-message", data, sender, socket.id);
        });
      }
    });
    socket.on("disconnect", () => {
      const [matchingRoom, found] = Object.entries(connections).reduce(
        ([room, isFound], [roomKey, roomValue]) => {
          if (!isFound && roomValue.includes(socket.id)) {
            return [roomKey, true];
          }
          return [room, isFound];
        },
        ["", false]
      );
      if (found == true) {
        const index = connections[matchingRoom].indexOf(socket.id);
        connections[matchingRoom].splice(index, 1);

        connections[matchingRoom].forEach((id) => {
          io.to(id).emit("user-left", socket.id);
        });

        if (connections[matchingRoom].length == 0) {
          delete connections[matchingRoom];
        }
      }
    });
  });
  return io;
};

module.exports = { connectToSocket };
