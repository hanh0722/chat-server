import { IncomingMessage } from "http";
import { EventEmitter } from "events";
import { decode } from "jsonwebtoken";
import { Data, Server, ServerOptions, WebSocket } from "ws";
import { SocketController } from "./methods";
import { v4 } from "uuid";
import { getMessage, sendMessage } from "./utils/data";
import { Message, Subscription } from "./types";
import { Cookie } from "../../utils/cookie";
import { TOKEN_COOKIE_KEY } from "../../constants/key";
import { TokenMiddleware } from "../../middleware/types";

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
    this.setClient = this.setClient.bind(this);
  }

  private destroy(socket: WebSocket) {
    this.leaveAll(socket);
    socket.close();
    this.client = undefined;
  }

  
  public get getClient(): WebSocket | undefined {
    return this.client
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

  private addMetaDataToClient(socket: WebSocket, request: IncomingMessage) {
    const token = Cookie.getCookie(
      request.headers.cookie || "",
      TOKEN_COOKIE_KEY
    );
    let dataClientToken: TokenMiddleware | undefined;
    if (token) {
      try{
        const dataInToken = decode(token) as TokenMiddleware;
        if (dataInToken) {
          dataClientToken = dataInToken;
        }
      }catch(err) {
        console.log(err);
      }
    }

    socket.clientData = dataClientToken;
    socket.token = token;
    socket.id = v4();
    socket.subscribe = this.subscribe;
    socket.dispatch = this.dispatch;
    socket.join = this.joinRoom;
    socket.to = this.toRoom;
    socket.leave = this.leaveRoom;
    socket.setClient = this.setClient;
    socket.getClient = this.getClient;
    this.client = socket;
  }

  private init() {
    this.server.on("connection", (socket, request) => {
      this.client = socket;
      this.addMetaDataToClient(socket, request);
      this.event.emit("connection", socket, request);
      socket.on("message", (data) => {
        this.event.emit("message", socket, data);
      });

      socket.on("close", (code, reason) => {
        this.destroy(socket);
      });
    });
  }

  
  public setClient(value: WebSocket) {
    this.client = value;
    return value;
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
      throw new Error("You must connect socket before dispatch");
    }
    let client = this.client;
    // @ts-ignore
    const isSpecificClient = args.length > 0 && args[args.length - 1]._client;

    if (isSpecificClient) {
      client = isSpecificClient;
       // @ts-ignore
      delete args[args.length - 1]._client;
    }
    const message = sendMessage({
      type: eventName,
      payload: args,
    });
    client.send(message);
  }

  public get clients() {
    return this.server.clients;
  }

  public joinRoom(roomId: string) {
    if (!this.client) {
      throw new Error("Please connect socket before join a room");
    }
    return this.join(this.client, roomId);
  }

  public toRoom(roomId: string, client?: WebSocket) {
    let c = client;
    if (!c) {
      c = this.client;
    }
    if (!c) {
      throw new Error("Please connect socket before emit data to a room");
    }
    return this.to(roomId, c);
  }

  public leaveRoom(roomId: string) {
    if (!this.client) {
      throw new Error("Please connect socket before leave the room");
    }

    return this.leave(this.client, roomId);
  }
}
