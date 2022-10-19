import express from "express";
import { ExpressPeerServer } from "peer";
import WebSocket from "ws";
import { corsController } from "./config/cors";
import { connection } from "./config/db";
import { ErrorHandling } from "./config/error";
import { RoutesController } from "./config/path";
import { Socket, SocketController, SOCKET_EVENT } from "./config/socket";
import { PATHS } from "./constants/path";

const app = express();

const server = app.listen(8000);

const peerServer = ExpressPeerServer(server, {
  path: PATHS.PEER_SERVER,
});

const a = new SocketController({
  port: 2207
})

a.on('connection', (socket) => {
  
})
// const { ws } = new Socket();

// ws.on('connection', (socket, request) => {
//   socket.on('message', (data) => {
//     socket.send(JSON.stringify({
//       type: 'hello',
//       payload: JSON.parse(data.toString())?.payload
//     }));
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
