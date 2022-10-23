import { IncomingMessage } from "http";
import { EventEmitter } from "events";
import { Data, Server, ServerOptions, WebSocket } from "ws";
import { SocketController } from "./methods";
import { v4 } from "uuid";
import { getMessage, sendMessage } from "./utils/data";
import { Message, Subscription } from "./types";

export class Socket extends SocketController {
  private server: Server;
  private event = new EventEmitter();

  private subscription: Subscription = {};

  constructor(config: ServerOptions) {
    super();
    this.server = new Server(config);
    this.init();
    this.listenMessageFromClient();

    this.subscribe = this.subscribe.bind(this);
    this.dispatch = this.dispatch.bind(this);
  }

  private destroy(socket: WebSocket) {
    this.leaveAll(socket);
    socket.close();
  }

  private listenMessageFromClient() {
    this.event.on("message", (client: WebSocket, data: Data) => {
      const message = getMessage<Message>(data.toString());
      const type = message.type;
      const payload = message?.payload || [];

      if (type in this.subscription) {
        this.subscription[type].forEach((cb) => cb(...payload));
      }
    });
  }

  private addMetaDataToClient(socket: WebSocket) {
    socket.id = v4();
    socket.subscribe = this.subscribe;
    socket.dispatch = this.dispatch;
    socket.join = this.joinRoom.bind(this, socket);
    socket.to = this.toRoom.bind(this, socket);
  }

  private callbackDispatchMessage(socket: WebSocket, payload: any){
    const type = payload?.eventName;
    const data = payload?.data;
    socket.send(
      sendMessage({
        type,
        payload: data,
      })
    );
  }

  private listenDispatchMessage(socket: WebSocket) {
    this.event.on("send-message", (data) => {
      this.callbackDispatchMessage(socket, data);
      this.event.off('send-message', this.callbackDispatchMessage);
    });
  }

  private init() {
    this.server.on("connection", (socket, request) => {
      this.addMetaDataToClient(socket);
      this.event.emit("connection", socket, request);

      socket.on("message", (data) => {
        this.event.emit("message", socket, data);
      });

      socket.on("close", (code, reason) => {
        this.destroy(socket);
      });

      this.listenDispatchMessage(socket);
    });
  }

  public connection(
    callback: (socket: WebSocket, request: IncomingMessage) => void
  ): void {
    this.event.on("connection", callback);
  }

  public subscribe<T = any>(
    eventName: string,
    callback: (...args: T[]) => void
  ): void {
    this.subscription[eventName] = [callback];
  }

  public dispatch<T = any>(eventName: string, ...args: T[]): void {
    this.event.emit("send-message", {
      eventName,
      data: args,
    });
  }

  public get clients() {
    return this.server.clients;
  }

  public joinRoom(client: WebSocket, roomId: string) {
    return this.join(client, roomId);
  }

  public toRoom(client: WebSocket, roomId: string) {
    return this.to(roomId, client);
  }
}
