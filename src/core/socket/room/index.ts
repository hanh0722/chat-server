import { isArray, isFunction } from "lodash";
import { WebSocket } from "ws";
import { Rooms } from "../types";

abstract class RoomController {
  protected abstract join(client: WebSocket, roomId: string): void
  protected abstract leaveAll(client: WebSocket): void;
  protected abstract leave(client: WebSocket, roomId: string): void
  protected abstract to(roomId: string, client: WebSocket): undefined | {
    dispatch: <T = any>(eventName: string, ...args: Array<T>) => void
  }
}

export class Room extends RoomController {
  private rooms: Rooms = {};

  constructor() {
    super();
    this.join = this.join.bind(this);
    this.to = this.to.bind(this);
    this.leave = this.leave.bind(this);
    this.leaveAll = this.leaveAll.bind(this);
  }

  
  public get getRooms() : Rooms {
    return this.rooms
  }

  private addRoomToClient(client: WebSocket, roomId: string) {
    const roomUser = client.joinedRooms;
    if (!isArray(roomUser)) {
      client.joinedRooms = [];
      client.joinedRooms.push(roomId.toString());
    }
    
    if (isArray(client.joinedRooms) && !client.joinedRooms.includes(roomId.toString())) {
      client.joinedRooms.push(roomId.toString());
    }
  } 

  protected join(client: WebSocket, roomId: string) {
    if (roomId in this.rooms) {
      const instances = this.rooms[roomId];
      if (instances.indexOf(client) > -1) {
        return;
      }
      if (!isArray(instances)) {
        this.rooms[roomId] = [client];
      } else {
        this.rooms[roomId].push(client);
      }
      this.addRoomToClient(client, roomId);
    } else {
      this.rooms[roomId] = [client];
      this.addRoomToClient(client, roomId)
    }
    

    const unsubscribe = () => {
      const clientIndex = this.rooms[roomId].indexOf(client);
      if (clientIndex > -1) {
        this.rooms[roomId].splice(clientIndex, 1);
        this.rooms[roomId].forEach(client => {
          client.dispatch('disconnect', client.clientData?._id);
        })
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

  protected leaveAll(client: WebSocket) {
    if (client._unsubscribeRoom) {
      client._unsubscribeRoom.forEach(func => {
        if (isFunction(func)) {
          func();
        }
      })
    }
  }

  protected leave(client: WebSocket, roomId: string): void {
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

  protected to(roomId: string, socket: WebSocket) {
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
    };

    const emit = (eventName: string, ...args: Array<any>) => {
      this.rooms[roomId].forEach(client => {
        client.dispatch(eventName, ...args, {
          _client: client
        });
      })
    }

    return {
      dispatch,
      emit
    }
  }
}