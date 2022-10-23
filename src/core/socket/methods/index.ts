import { WebSocket } from "ws";
import { IncomingMessage } from 'http';
import { Room } from "../room";

export abstract class SocketController extends Room {
  abstract connection(callback: (socket: WebSocket, request: IncomingMessage) => void): void
  abstract subscribe<T = any>(eventName: string, callback: (...args: Array<T>) => void): void
  abstract dispatch<T = any>(eventName: string, ...args: Array<T>): void;
}
