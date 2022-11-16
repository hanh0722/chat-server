import { RequestHandler } from "express";
import { validationResult } from "express-validator";
import { EVENTS } from "../../../constants/events";
import Room from "../../../model/Room";
import User from "../../../model/User";
import { ResponseEntity } from "../../../response";
import { getServerSocket, getSocket } from "../../../socket";

export const createGroup: RequestHandler<any, ResponseEntity, {name: string}> = async (req, res, next) => {
  const { name } = req.body;

  try{
    const validate = validationResult(req);
    if (!validate.isEmpty()) {
      return res.status(422).json(new ResponseEntity(422, validate.array()[0].msg));
    }
    const userId = req.metaData?._id;
    const serverSocket = getServerSocket();

    if (!userId) {
      return res.status(403).json(new ResponseEntity(403, 'User is not existed'));
    }
    
    const room = new Room({
      is_group: true,
      group: [
        userId
      ],
      group_info: {
        name_group: name,
        creator: userId
      }
    });

    const roomInfo = await (await (await room.save()).populate('group')).populate('group_info.creator');
    serverSocket.clients.forEach(client => {
      if (client.clientData?._id === userId) {
        client.setClient(client);
        client.join(roomInfo._id);
      }
    })
    res.json(new ResponseEntity(200, 'OK', roomInfo));
  }catch(err) {
    next(err);
  }
}

export const addUserToGroup: RequestHandler<{id: string; roomId: string}> = async (req, res, next) => {
  try{
    const socket = getServerSocket();
    const userId = req.params?.id;
    const roomId = req.params?.roomId;
    if (!userId) {
      return res.status(422).json(new ResponseEntity(422, 'Người dùng không tồn tại'));
    }
    if (!roomId) {
      return res.status(404).json(new ResponseEntity(404, 'Phòng không tồn tại'));
    }
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json(new ResponseEntity(404, 'Phòng không tồn tại trong hệ thống'));
    }
    room.group?.push(userId as any);
    const payload = await (await (await (await room.save()).populate({
      path: "chats",
      populate: "sender",
      options: {
        lean: true,
        sort: 'creation_time'
      },
    })).populate('group')).populate('group_info.creator');
    const user = await User.findById(userId).lean();

    socket.clients.forEach(client => {
      const clientData = client.clientData?._id;
      if (clientData === userId) {
        client.setClient(client);
        client.join(roomId.toString());
        client.dispatch(EVENTS.JOINED_ROOM_SUCCESS, {
          payload
        });
        client.to(roomId)?.dispatch(EVENTS.JOINED_ROOM, {
          user,
          roomId
        });
      }
    });
    res.json(new ResponseEntity(200, 'OK'));
  }catch(err) {
    next(err);
  }
}