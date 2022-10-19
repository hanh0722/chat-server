import { IncomingMessage } from 'http';
import { Server, ServerOptions, WebSocket } from 'ws';

export class Socket {
  private socket: Server;
  constructor() {
    this.socket = new Server({
      port: 2207,
    });
    this.emit();
  }

  private emit() {
    
  }
  

  get ws() {
    return this.socket;
  }
}

export enum SOCKET_EVENT {
  CONNECTION = 'connection',
}
export class SocketController {
  private serverSocket: Server;
  constructor(private config: ServerOptions) {
    this.serverSocket = new Server(config);
    this.on = this.on.bind(this);
    this.onHandleConnection = this.onHandleConnection.bind(this);
    this.onHandleReceiveMessage = this.onHandleReceiveMessage.bind(this);
  }

  private onHandleConnection(callback: (socket: WebSocket) => void) {
    this.serverSocket.on('connection', (socket) => {
      callback(socket);
      socket.on('close', (...args) => {
        console.log(args);
      })
    });
  }

  private onHandleReceiveMessage<T = any>(callback: (...args: Array<T>) => void) {

  }

  public on(eventName: 'connection', callback: (socket: WebSocket) => void): void;
  public on(eventName: string, callback: (...args: Array<any>) => void) {
    if (eventName === 'connection') {
      return this.onHandleConnection(callback);
    }
    this.onHandleReceiveMessage(callback);
  }

}
