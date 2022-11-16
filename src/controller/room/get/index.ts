import { RequestHandler } from "express";
import { isEmpty } from "lodash";
import { Types } from "mongoose";
import { EVENTS } from "../../../constants/events";
import Room from "../../../model/Room";
import { ResponseEntity } from "../../../response";
import { fetchRooms } from "../../../services/room";
import { getServerSocket, getSocket } from "../../../socket";
import { QuerySort, SORT } from "../../../types/base";
import { getFieldDataUser } from "../../../utils/user";

export const getRoom: RequestHandler<
  any,
  ResponseEntity,
  any,
  QuerySort
> = async (req, res, next) => {
  try {
    if (isEmpty(req?.metaData)) {
      return res.status(403).json(new ResponseEntity(403, "Unauthenticated"));
    }
    const clientSocket = getSocket();
    const { page = 1, page_size = -1, sort = SORT.DESCENDING } = req.query;
    const userId = req.metaData._id;
    const payload = await fetchRooms(
      {
        $or: [
          {
            from: new Types.ObjectId(userId),
          },
          {
            to: new Types.ObjectId(userId),
          },
          {
            group: {
              $in: [new Types.ObjectId(userId)]
            }
          }
        ],
      },
      req.metaData,
      {
        page,
        page_size,
        sort,
      }
    );
    const client = clientSocket.getClient;
    payload?.data?.forEach(room => {
      const roomId = room?._id;
      if (roomId) {
        client?.join(roomId);
        client?.to(roomId)?.dispatch(EVENTS.USER_ONLINE, {
          userId,
          roomId
        });
      }
    })

    res.json(new ResponseEntity(200, "OK", payload));
  } catch (err) {
    next(err);
  }
};

export const getRoomDetail: RequestHandler<
  { id: string },
  ResponseEntity,
  any
> = async (req, res, next) => {
  try {
    const { id } = req.params;
    const serverSocket = getServerSocket();
    const socket = getSocket();
    const room = await Room.findById(id).select(['-chats']).populate({
      path: 'from',
      options: {
        lean: true,
      }
    }).populate({
      path: 'to',
      options: {
        lean: true,
      }
    }).lean();

    if (!room) {
      return res
        .status(404)
        .json(new ResponseEntity(404, "Phòng không tồn tại trong hệ thống"));
    }
    const payload = {
      ...room,
      from: getFieldDataUser(room?.from as any),
      to: getFieldDataUser(room?.to as any)
    };
    const fromId = payload.from?._id;
    const toId = payload.from?._id;
    const userId = req.metaData?._id;
    const roomId = payload._id.toString();

    serverSocket.clients.forEach(client => {
      const idClient = client.clientData?._id;
      if (idClient === userId || idClient === toId || idClient === fromId) {
        socket.setClient(client);
        socket.join(roomId);
      }
    });

    res.json(new ResponseEntity(200, 'OK', payload));
    
  } catch (err) {
    next(err);
  }
};
