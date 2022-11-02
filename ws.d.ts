import WebSocketCore from 'ws';
import { IncomingMessage } from 'http';
import { TokenMiddleware } from './src/middleware/types';
declare module 'ws' {
  interface Events<T = any> {
    [eventName: string]: Array<(...args: Array<T>) => void>;
  }
  class WebSocket extends WebSocketCore {
    _unsubscribeRoom: Array<Function>;
    id: string;

    subscribe: <T = any>(eventName: string, callback: (...args: Array<T>) => void) => void;
    dispatch: <T = any>(eventName: string, ...args: Array<T>) => void;
    join: (roomId: string) => void;
    to: (roomId: string, ignoreClient?: WebSocket) => undefined | {
      dispatch: <T = any>(eventName: string, ...args: Array<T>) => void;
      emit: <T = any>(eventName: string, ...args: Array<T>) => void;
    }
    setClient: (client: WebSocket) => WebSocket;
    leave: (roomId: string) => void;
    token?: string | null;
    clientData?: TokenMiddleware;

    getClient: WebSocket | undefined;
    
  }
}