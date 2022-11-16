import { WebSocket } from "ws";
import { EVENTS } from "../../constants/events";
import { SocketEvent } from "./types";
import { addChatToRoom } from "../../services/chat";
import { fetchRooms } from "../../services/room";
import { forEach, isArray, isEmpty, isEqual, isNumber } from "lodash";
import { getServerSocket } from "../../socket";
import { getUserById } from "../../services/user";
import User from "../../model/User";
import Room, { Chat } from "../../model/Room";
import { Types } from "mongoose";

const messageEvent = async (socket: WebSocket, data: any) => {
  const roomId = data?.roomId;
  const sender_id = data?.sender_id;
  const message = data?.message;

  if (!sender_id || !roomId) {
    return;
  }

  const payload = await addChatToRoom({
    message,
    room_id: roomId,
    sender_id: sender_id,
  });

  if (!payload) {
    return;
  }
  socket?.getClient?.to(roomId)?.emit(EVENTS.MESSAGE, payload);
};

const typingEvent = async (socket: WebSocket, data: any) => {
  const roomId = data?.room_id;
  const userId = data?.user_id;

  if (!roomId || !userId) {
    return;
  }

  socket.to(roomId)?.dispatch(EVENTS.TYPING, data);
};

const finishTypingEvent = async (socket: WebSocket, data: any) => {
  const roomId = data?.room_id;
  const userId = data?.user_id;
  if (!roomId || !userId) {
    return;
  }

  socket.to(roomId)?.dispatch(EVENTS.FINISH_TYPING, data);
};

const reconnectSocket = async (_: WebSocket, userId: string) => {
  const socket = _.getClient;
  const id = userId || socket?.clientData?._id;
  const rooms = await fetchRooms({
    $or: [
      {
        from: id,
      },
      {
        to: id,
      },
    ],
  });
  forEach(rooms?.data, (room) => {
    const roomId = room?._id;
    if (roomId) {
      socket?.join(roomId);
    }
  });
  socket?.dispatch(EVENTS.UPDATE_ROOMS, rooms?.data);
};

export const disconnectSocket = async (socket: WebSocket) => {
  try {
    const rooms = getServerSocket().getRooms;
    const userId = socket.clientData?._id;
    if (!userId) {
      return;
    }
    const user = await User.findById(userId);
    if (!user) {
      return;
    }
    const lastActive = Date.now();
    user.last_active = lastActive;
    await user.save();

    if (isEmpty(rooms)) {
      return;
    }
    const roomClient = socket.joinedRooms;
    if (!isArray(roomClient) || isEmpty(roomClient)) {
      return;
    }
    roomClient.forEach((roomId) => {
      socket.setClient(socket);
      socket.to(roomId)?.dispatch(EVENTS.USER_OFFLINE, {
        roomId,
        userId,
      });
    });
  } catch (err) {
    console.log(err);
  }
};

const seenMessage = async (socket: WebSocket, data: { roomId?: string }) => {
  try {
    const client = socket.getClient;
    const userId = client?.clientData?._id;
    const roomId = data?.roomId;
    if (!roomId || !userId) {
      return;
    }
    const room = await Room.findById(roomId);

    if (!room) {
      return;
    }

    const chats = room.chats;
    const isExistUnSeenMessage = chats.some(
      (chat) => !chat.seen_users?.toString().includes(userId)
    );
    if (!isExistUnSeenMessage) {
      return;
    }

    room.chats.forEach(item => {
      const isExisted = item.seen_users?.includes(userId);
      if (!isExisted) {
        item.seen_users?.push(userId)
      }
    });

    await room.save();
  } catch (err) {
    console.log(err);
  }
};

export const events: SocketEvent = [
  {
    event: EVENTS.MESSAGE,
    listener: messageEvent,
  },
  {
    event: EVENTS.TYPING,
    listener: typingEvent,
  },
  {
    event: EVENTS.FINISH_TYPING,
    listener: finishTypingEvent,
  },
  {
    event: EVENTS.RECONNECT,
    listener: reconnectSocket,
  },
  {
    event: EVENTS.SEEN_MESSAGE,
    listener: seenMessage,
  },
];
