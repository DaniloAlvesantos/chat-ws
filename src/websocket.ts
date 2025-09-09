import { io } from "./http.js";
import cron from "node-cron";

interface Room {
  username: string;
  socketId: string;
  room: string;
}

interface Message {
  username: string;
  room: string;
  text: string;
  cratedAt: string;
}

const rooms: Room[] = [];
const messages: Message[] = [];

cron.schedule("0 0 * * *", () => {
  messages.length = 0;
  console.log("Messages cleared.");
  io.emit("messages-cleared");
});

io.on("connection", (socket) => {
  console.log("CONNECTED");

  // socket its individual
  socket.on("room", (data) => {
    socket.join(data.room);

    const user = rooms.find(
      (r) => r.username === data.username && r.room === data.room
    );

    if (user) {
      user.socketId = socket.id;
    } else {
      rooms.push({
        username: data.username,
        room: data.room,
        socketId: socket.id,
      });
    }

    const roomInfo = rooms.filter((r) => r.room === data.room);
    const roomMessages = messages.filter((m) => m.room === data.room);

    io.to(data.room).emit("room-info", {
      clients: roomInfo,
      messages: roomMessages,
    });
  });

  socket.on("message", (data) => {
    if (!data) return;

    if (messages.length > 1000) {
      messages.shift();
    }

    messages.push({
      ...data,
      createdAt: new Date().toLocaleTimeString(),
    });

    io.to(data.room).emit("message", data);
  });

  io.on("disconnect", () => {
    console.log("User disconected.");
  });
});
