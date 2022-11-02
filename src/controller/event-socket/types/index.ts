import { WebSocket } from "ws";
import { EVENTS } from "../../../constants/events"

export interface EventListenerSocket {
  event: EVENTS;
  listener: (socket: WebSocket, ...args: Array<any>) => any
}

export type SocketEvent = Array<EventListenerSocket>;