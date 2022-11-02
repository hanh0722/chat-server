import express from "express";
import { ExpressPeerServer } from "peer";
import { corsController } from "./config/cors";
import { connection } from "./config/db";
import { ErrorHandling } from "./config/error";
import { RoutesController } from "./config/path";
import { PATHS } from "./constants/path";
import { events } from "./controller/event-socket";
import { initSocket } from "./socket";


const app = express();

const server = app.listen(8000);

const peerServer = ExpressPeerServer(server, {
  path: PATHS.PEER_SERVER,
});

initSocket((socket, request) => {
  events.forEach(({event, listener}) => {
    socket.subscribe(event, (...args) => {
      listener(socket, ...args);
    })
  })
});


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
