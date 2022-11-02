import { FilterQuery, Types } from "mongoose";
import Room, { RoomSchema } from "../../model/Room";
import { SortModel } from "../../response";
import { UserMetaData } from "../../types";
import { QuerySort, SORT } from "../../types/base";
import { getRoomsData } from "../../utils/message";

export const fetchRooms = async (filter: FilterQuery<RoomSchema>, user?: UserMetaData, pagination?: QuerySort) => {
  try{
    const page = pagination?.page || 1;
    const page_size = pagination?.page_size || -1;
    const sort = pagination?.sort || SORT.DESCENDING
    const request = Room.find(filter || {}).populate({
      path: 'chats',
      populate: 'sender',
      options: {
        sort: {
          'chats.creation_time': sort
        },
        limit: 1,
        lean: true,
      }
    }).populate('from').populate('to');

    const countDocument = await request.clone().countDocuments().lean();
    const totalPage = Math.ceil(countDocument / page_size);
    let rooms: Omit<RoomSchema & {
      _id: Types.ObjectId;
  }, never>[];
    if (page_size === -1) {
      rooms = await request.clone().lean()
    } else {
      rooms = await request.clone().skip((page - 1) * page_size).limit(page_size).lean();
    }

    const payload = rooms.map(room => getRoomsData(room, user));
    
    return new SortModel(payload, countDocument, page_size === -1 ? false : totalPage < page, page);
  }catch(err) {
    return null;
  }
}

export const getChatInRoom = async (roomId: string, userMetaData?: UserMetaData, sortParams?: QuerySort) => {
  const page = sortParams?.page || 1;
  const page_size = sortParams?.page_size || 10;
  const sort = sortParams?.sort || SORT.DESCENDING;
  try{
    const query = Room.findById(roomId).populate({
      path: 'chats',
      select: 'sender',
      options: {
        sort: {
          'chats.creation_time': sort
        },
        skip: (page - 1) * page_size,
        limit: page_size,
        lean: true
      }
    });

    console.log(query);
    
  }catch(err) {
    return null;
  }
}