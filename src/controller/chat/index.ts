import { RequestHandler } from "express";
import { ResponseEntity } from "../../response";
import { getChatPagination } from "../../services/chat";
import { QuerySort } from "../../types/base";

export const getChat: RequestHandler<{roomId: string}, ResponseEntity, any, QuerySort> = async (req, res, next) => {
  const { roomId } = req.params;
  const { page, page_size, sort } = req.query;
  try{
    const chats = await getChatPagination({
      roomId,
      page,
      page_size,
      sort
    });

    if (!chats) {
      return res.status(404).json(new ResponseEntity(404, 'Resource not found!'));
    }
    res.json(new ResponseEntity(200, 'OK', chats));
  }catch(err) {
    next(err);
  }
}