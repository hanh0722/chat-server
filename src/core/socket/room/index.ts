import { isArray, isFunction } from "lodash";
import { WebSocket } from "ws";
import { Rooms } from "../types";

abstract class RoomController {
  abstract join(client: WebSocket, roomId: string): void
  abstract leaveAll(client: WebSocket): void;
  abstract leave(client: WebSocket, roomId: string): void
}

export class Room extends RoomController {
  private rooms: Rooms = {};

  constructor() {
    super();
    this.join = this.join.bind(this);
    this.to = this.to.bind(this);
  }

  public join(client: WebSocket, roomId: string) {
    if (roomId in this.rooms) {
      const instances = this.rooms[roomId];
      if (!isArray(instances)) {
        this.rooms[roomId] = [client];
      } else {
        this.rooms[roomId].push(client);
      }
    } else {
      this.rooms[roomId] = [client];
    }

    const unsubscribe = () => {
      const clientIndex = this.rooms[roomId].indexOf(client);
      if (clientIndex > -1) {
        this.rooms[roomId].splice(clientIndex, 1);
      }

      if (this.rooms[roomId].length === 0) {
        delete this.rooms[roomId]
      };
    };

    if (isArray(client._unsubscribeRoom)) {
      client._unsubscribeRoom.push(unsubscribe);
    } else {
      client._unsubscribeRoom = [];
      client._unsubscribeRoom.push(unsubscribe);
    }
  }

  public leaveAll(client: WebSocket) {
    if (client._unsubscribeRoom) {
      client._unsubscribeRoom.forEach(func => {
        if (isFunction(func)) {
          func();
        }
      })
    }
  }

  public leave(client: WebSocket, roomId: string): void {
    if (!(roomId in this.rooms)) {
      return;
    }
    const idxClient = this.rooms[roomId].indexOf(client);
    if (idxClient === -1) {
      const index = this.rooms[roomId].findIndex(socket => socket.id === client.id);
      if (index === -1) {
        return;
      }
      this.rooms[roomId].splice(index, 1);
    } else {
      this.rooms[roomId].splice(idxClient, 1);
    }
  }

  public to(roomId: string, socket: WebSocket) {
    if (!(roomId in this.rooms)) {
      return;
    }
    const dispatch = <T = any>(eventName: string, ...args: Array<T>) => {
      this.rooms[roomId].forEach(client => {
        if (socket.id !== client.id) {
          client.dispatch(eventName, ...args, {
            _client: client
          } as any);
        }
      })
    }

    return {
      dispatch
    }
  }
}