import Room from "../../model/Room";
import { SORT } from "../../types/base";
import { getFieldDataUser } from "../../utils/user";
import { CreateChatProps, FetchChatProps } from "./types";
import User, { SchemaUser } from "../../model/User";
import { LeanDocument, Types } from "mongoose";
import { Id } from "../../types";
import { SortModel } from "../../response";
import { Chat } from "../../model/Chat";

export const getChatPagination = async (props: FetchChatProps) => {
  try {
    const { roomId, page = 1, page_size = 10, sort = SORT.DESCENDING } = props;
    const query = Room.findById(roomId);

    const q = await query.clone().lean();

    if (!q) {
      return null;
    }

    const chats = await query
      .populate({
        path: "chats",
        populate: "sender",
        options: {
          skip: (page - 1) * page_size,
          limit: page_size,
          sort: {
            creation_time: sort,
          },
          lean: true,
        },
      })
      .lean();
    const totalChats = q?.chats.length || 0;
    const totalPage = Math.ceil(totalChats / page_size);

    const mapChats = chats?.chats.map((item) => {
      return {
        ...item,
        sender: getFieldDataUser((item.sender as SchemaUser)._doc as LeanDocument<SchemaUser> & Id),
      };
    });

    return new SortModel(mapChats, totalChats, totalPage < page, page);
  } catch (err) {
    return null;
  }
};

export const addChatToRoom = async (props: CreateChatProps) => {
  const { message, room_id, sender_id } = props;
  try{
    const room = await Room.findById(room_id);
    if (!room) {
      return null;
    }
    const chat = new Chat(message, sender_id, Date.now(), [new Types.ObjectId(sender_id)]);

    const chatData = Object.assign({}, chat, {
      _id: new Types.ObjectId()
    })
    room.chats.push(chatData);

    const user = await User.findById(sender_id).lean();

    if (!user) {
      return null;
    }
    
    const getUserData = getFieldDataUser(user);

    await room.save();

    const payload = Object.assign({}, chatData, {
      sender: getUserData
    });

    const msg = {
      room_id,
      data: payload
    };
    
    return msg;
    
  }catch(err) {
    return null;
  }
}