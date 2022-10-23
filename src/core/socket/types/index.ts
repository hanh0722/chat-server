import { WebSocket } from "ws";

export interface Message<T = any> {
  readonly type: string;
  payload?: Array<T>;
}

export interface Rooms {
  [roomId: string]: Array<WebSocket>;
}

export interface Subscription {
  [eventName: string]: Array<(...args: Array<any>) => void>
}