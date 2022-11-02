import { body } from "express-validator";
import User from "../../../model/User";

export const validateCreateRoomChat = [
  body('from').not()
  .isEmpty()
  .withMessage('Người gửi không được để trống')
  .custom(async (senderId, {req}) => {
    try{
      const isExistUser = await User.exists({_id: senderId});
      if (!isExistUser) {
        return Promise.reject('Người gửi không tồn tại trong hệ thống');
      }
      return true;
    }catch(err: any) {
      return Promise.reject(err?.message || 'Có lỗi xảy ra, xin thử lại sau');
    }
  }),
  body('to').not()
  .isEmpty()
  .withMessage('Người nhận không được để trống')
  .custom(async (receiverId, {req}) => {
    try{
      const isExistUser = await User.exists({_id: receiverId});
      if (!isExistUser) {
        return Promise.reject('Người nhận không tồn tại trong hệ thống');
      }
      return true;
    }catch(err: any) {
      return Promise.reject(err?.message || 'Có lỗi xảy ra, xin thử lại sau');
    }
  })
]