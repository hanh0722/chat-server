import express from "express";
import { ExpressPeerServer } from "peer";
// import { Server } from "ws";
import { Socket } from "./core/socket";
import { corsController } from "./config/cors";
import { connection } from "./config/db";
import { ErrorHandling } from "./config/error";
import { RoutesController } from "./config/path";
import { PATHS } from "./constants/path";
import { Server } from "socket.io";

const app = express();

const server = app.listen(8000);

const peerServer = ExpressPeerServer(server, {
  path: PATHS.PEER_SERVER,
});

const socketServer = new Socket({
  port: 2207
});


socketServer.connection((socket, request) => {
  socket.subscribe('message', (a, b, c) => {
    
  });

  socket.subscribe('join-room', roomId => {
    socket.join(roomId);
  });

  socket.subscribe('send-message', (roomId, message) => {
    socket.to(roomId)?.dispatch('msg-callback', message);
  })
})

const io = new Server(server, {
  cors: {
    origin: "*",
    allowedHeaders: ["Content-Type", "authorization"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  // socket.on("join-room", (roomId) => {
  //   // socket.join(roomId);
  // });

  socket.on("message", (data) => {
    console.log(data);
    socket.to("1").emit("msg", data);
    socket.emit("data", data);
  });
});

// const serverSocket = new Socket({
//   port: 2207
// });

// serverSocket.event('connection', (socket, request) => {
//   socket.subscribe('click', (data) => {
//     socket.dispatch('listen-click', data);
//   });
//   socket.subscribe('join-room', roomId => {
//     socket.to(roomId);
//   });

//   socket.subscribe('message-to-room', data => {
//     // console.log(data);
//   })
// })

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(express.static(__dirname));

app.use(corsController);

app.use(PATHS.PEER_SERVER, peerServer);

RoutesController.forEach(({ path, controller }) => {
  app.use(path, controller);
});

app.use(ErrorHandling);

connection().then((response) => {});
