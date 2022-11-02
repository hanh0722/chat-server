import { WebSocket } from "ws";
import { isFunction } from 'lodash';
import { IncomingMessage } from 'http';
import { Socket } from "../core/socket";

let io: WebSocket;
let clientRequest: IncomingMessage;
let serverSocket: Socket;

export const initSocket = (cb?: (socket: WebSocket, request: IncomingMessage) => void) => {
  const server = new Socket({
    port: 2207,
  });
  serverSocket = server;

  server.connection((socket, request) => {
    if (isFunction(cb)) {
      cb(socket, request);
    }
    io = socket;
    clientRequest = request
  });
};

export const getSocket = () => {
  if (!io) {
    throw new Error('You must connect socket before get socket');
  } 
  return io;
}

export const getServerSocket = () => {
  if (!serverSocket) {
    throw new Error('You must connect socket before get socket');
  }
  return serverSocket;
}

