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

  private client: WebSocket | undefined;
  private subscription: Subscription = {};

  constructor(config: ServerOptions) {
    super();
    this.server = new Server(config);
    this.init();
    this.listenMessageFromClient();

    this.subscribe = this.subscribe.bind(this);
    this.dispatch = this.dispatch.bind(this);
    this.joinRoom = this.joinRoom.bind(this);
    this.toRoom = this.toRoom.bind(this);
    this.leaveRoom = this.leaveRoom.bind(this);
  }

  private destroy(socket: WebSocket) {
    this.leaveAll(socket);
    socket.close();
    this.client = undefined;
  }

  private listenMessageFromClient() {
    this.event.on("message", (client: WebSocket, data: Data) => {
      this.client = client;
      const message = getMessage<Message>(data.toString());
      const type = message.type;
      const payload = message?.payload || [];

      if (type in this.subscription) {
        this.subscription[type].forEach((cb) => {
          cb(...payload);
        });
      }
    });
  }

  private addMetaDataToClient(socket: WebSocket) {
    socket.id = v4();
    socket.subscribe = this.subscribe;
    socket.dispatch = this.dispatch;
    socket.join = this.joinRoom
    socket.to = this.toRoom;
    socket.leave = this.leaveRoom
    this.client = socket;
  }


  private init() {
    this.server.on("connection", (socket, request) => {
      this.client = socket;
      this.addMetaDataToClient(socket);
      this.event.emit("connection", socket, request);
      socket.on("message", (data) => {
        this.event.emit("message", socket, data);
      });

      socket.on("close", (code, reason) => {
        this.destroy(socket);
      });
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
    if (!this.client) {
      throw new Error('You must connect socket before dispatch');
    }
    let client = this.client;
    // @ts-ignore
    const isSpecificClient = args.length > 0 && (args[args.length - 1]._client);

    if (isSpecificClient) {
      client = isSpecificClient;
    }
    const message = sendMessage({
      type: eventName,
      payload: args
    });
    client.send(message);
  }

  public get clients() {
    return this.server.clients;
  }

  public joinRoom(roomId: string) {
    if (!this.client) {
      throw new Error('Please connect socket before join a room');
    }
    return this.join(this.client, roomId);
  }

  public toRoom(roomId: string) {
    if (!this.client) {
      throw new Error('Please connect socket before emit data to a room');
    }
    return this.to(roomId, this.client);
  }

  public leaveRoom(roomId: string) {
    if (!this.client) {
      throw new Error('Please connect socket before leave the room');
    }

    return this.leave(this.client, roomId);
  }
}
