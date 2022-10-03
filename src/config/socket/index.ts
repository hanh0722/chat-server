import { Server } from 'socket.io';

let io: Server;

export const init = (appServer: any) => {
  const server = new Server(appServer, {
    cors: {
      origin: '*',
      allowedHeaders: '*'
    }
  });
  io = server;
  return io;
}

export const getSocket = () => {
  if (!io) {
    throw new Error('Socket is not connected');
  }
  return io;
}


