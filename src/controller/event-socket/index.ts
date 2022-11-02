import { WebSocket } from "ws";
import { EVENTS } from "../../constants/events"
import { SocketEvent } from "./types"
import { addChatToRoom } from "../../services/chat";

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
    sender_id: sender_id
  });

  if (!payload) {
    return;
  }

  socket.to(roomId)?.emit(EVENTS.MESSAGE, payload);
}

export const events: SocketEvent = [
  {
    event: EVENTS.MESSAGE,
    listener: messageEvent
  }
]