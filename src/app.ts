import express from "express";
import { ExpressPeerServer } from "peer";
import { Socket } from "./core/socket";
import { corsController } from "./config/cors";
import { connection } from "./config/db";
import { ErrorHandling } from "./config/error";
import { RoutesController } from "./config/path";
import { PATHS } from "./constants/path";

const app = express();

const server = app.listen(8000);

const peerServer = ExpressPeerServer(server, {
  path: PATHS.PEER_SERVER,
});

const socketServer = new Socket({
  port: 2207
});


socketServer.connection((socket, request) => {
  socket.subscribe('message', (a) => {
    socket.dispatch('msg', a);
  });

  socket.subscribe('join-room', roomId => {
    socket.join(roomId);
  });

  socket.subscribe('send-message', (roomId, message) => {
    socket.to(roomId)?.dispatch('msg-callback', roomId);
  });

  socket.subscribe('leave-room', roomId => {
    socket.leave(roomId);
  });
})

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
