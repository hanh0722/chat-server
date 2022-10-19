import WebSocket from "ws";
import SocketProvider from "ws";

declare module 'ws' {
  export interface WebSocket extends SocketProvider {
    id: string;
    emit: <T = any>(eventName: string, ...args: Array<T>) => void
  } 
}