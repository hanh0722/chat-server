import { RequestHandler } from "express";
import { Types, ObjectId } from 'mongoose';
import { validationResult } from "express-validator";
import { WebSocket } from "ws";
import { Chat } from "../../../model/Chat";
import Room, { RoomSchema } from "../../../model/Room";
import { ResponseEntity } from "../../../response";
import { getServerSocket, getSocket } from "../../../socket";
import { getMessageCreateRoom } from "../../../utils/message";
import { CreateRoomRequest } from "../types";

export const createRoomChat: RequestHandler<
  any,
  ResponseEntity,
  CreateRoomRequest
> = async (req, res, next) => {
  const { from, message, to } = req.body;

  try {
    const validate = validationResult(req);
    if (!validate.isEmpty()) {
      return res
        .status(422)
        .json(
          new ResponseEntity(422, validate.array()[0].msg, validate.array())
        );
    }

    const isExist = await Room.exists({ from: from, to: to });

    if (isExist) {
      return res
        .status(422)
        .json(new ResponseEntity(422, "2 người dùng đã có phòng!"));
    }

    const room = new Room({
      from,
      to,
      chats: [new Chat(message, from, Date.now(), [new Types.ObjectId(from)])],
    });

    const serverSocket = getServerSocket();

    const data = await room.save();
    const response = await (await (await data.populate("from")).populate("to")).populate('chats.sender');
    const obj = response.toObject<RoomSchema>();
    const roomId = response._id.toString();
    let clientIgnore: WebSocket | undefined;
    serverSocket.clients.forEach((client) => {
      if (client.clientData?._id === from) {
        clientIgnore = client;
      }
      if (client.clientData?._id === to || client.clientData?._id === from) {
        client.setClient(client);
        client.join(roomId);
      }
    });

    const { messageSocket, response: payload } = getMessageCreateRoom(obj);

    getSocket()
      .to(roomId, clientIgnore)
      ?.dispatch("message-start-room", messageSocket);

    res.json(new ResponseEntity(200, "OK", payload));
  } catch (err) {
    console.log(err);
    next(err);
  }
};
