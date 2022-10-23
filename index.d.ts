import { ServerOptions, WebSocket } from "ws";

declare class SocketController {
  constructor(config: ServerOptions) {}
  on(event: 'connection', callback: (socket: WebSocket) => void): this;
  on<T = any>(event: string, callback: (...args: Array<T>) => void): this;
}

export = SocketController;