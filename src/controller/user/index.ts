import { RequestHandler } from "express";
import { ValidationError, validationResult } from 'express-validator';
import Room from "../../model/Room";
import User, { SchemaUser, User as UserModel } from "../../model/User";
import { ResponseEntity } from "../../response";
import { createToken, createUser, getUser, getUserById, getUserByQuery, isMatchPassword } from "../../services/user";
import { Id } from "../../types";
import { QuerySort, SORT } from "../../types/base";
import { RequestLogin, RequestParamsUser, RequestRegister, RequestValidateUser } from "../../types/response/user";
import { sendMail } from "../../utils/mail";
import { getFieldDataUser } from "../../utils/user";

export const loginController: RequestHandler<any, ResponseEntity, RequestLogin> = async (req, res, next) => {
  const { password, username } = req.body;
  try{
    const validate = validationResult(req);
    if (!validate.isEmpty()) {
      return res.status(422).json(new ResponseEntity(422, validate.array()[0].msg, validate.array()))
    };
    const user = await User.findOne({username: username}) as (SchemaUser & Id & {_doc: UserModel}) | null;
    if (!user) {
      return res.status(404).json(new ResponseEntity(404, 'Người dùng không tồn tại trong hệ thống'));
    }
    const isValidPassword = await isMatchPassword(user.password, password);

    if (!isValidPassword) {
      return res.status(422).json(new ResponseEntity(422, 'Thông tin đăng nhập không chính xác'));
    };
    user.last_active = 'Online';
    await user.save();

    const token = createToken(user);

    res.json(new ResponseEntity(200, 'OK', {
      token,
      user: getFieldDataUser(user._doc as any)
    }));
  }catch(err) {
    next(err);
  }
};


export const registerController: RequestHandler<any, ResponseEntity, RequestRegister> = async (req, res, next) => {
  const { email, password, username } = req.body;
  try{
    const validator = validationResult(req);
    const errors = validator.array();
    if (!validator.isEmpty()) {
      return res.status(422).json(new ResponseEntity<Array<ValidationError>>(422, (errors[0].msg) as string, errors));
    }
    const user = await createUser({
      email,
      password,
      username,
    }) as SchemaUser;

    const mail = await sendMail({
      to: email,
      html: `<p>OTP: ${user.otp}</p>`,
      subject: 'Validate account',
      text: 'Validate account'
    });
    res.json(new ResponseEntity(200, 'OK', `Mã xác thực OTP đã được gửi đến địa chỉ ${email}`));
  }catch(err) {
    next(err);
  }
}

export const validateUserController: RequestHandler<any, ResponseEntity, RequestValidateUser> = async (req, res, next) => {
  const { username, otp } = req.body;

  try{
    const validator = validationResult(req);
    if (!validator.isEmpty()) {
      const errors = validator.array();
      return res.status(422).json(new ResponseEntity(422, errors[0].msg, errors))
    }
    const user = await User.findOne({username: username})!;
    if (!user) {
      return res.status(404).json(new ResponseEntity(404, `Người dùng ${username} không tồn tại trong hệ thống`));
    }
    user.is_validate = undefined;
    user.otp = undefined;

    await user.save();
    
    res.json(new ResponseEntity(200, 'OK'));
  }catch(err) {
    next(err);
  }
}

export const getInfoUser: RequestHandler<any, ResponseEntity> = async (req, res, next) => {
  try{
    
    const userId = req.metaData?._id;
    if (!userId) {
      return res.status(403).json(new ResponseEntity(403, 'Người dùng không hợp lệ'));
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json(new ResponseEntity(404, 'Người dùng không tồn tại trong hệ thống'));
    }
    user.last_active = 'Online';
    const payload = await user.save();
    res.json(new ResponseEntity(200, 'OK', {
      token: req.token,
      user: getFieldDataUser(payload._doc as any)
    }));
  }catch(err) {
    next(err);
  }
}

export const searchUserController: RequestHandler<any, ResponseEntity, any, RequestParamsUser> = async (req, res, next) => {
  try{
    const { page, page_size , sort, username, ignore } = req.query;
    const data = await getUserByQuery({
      page,
      page_size,
      search: {
        username: {
          $regex: username,
          $options: 'i'
        },
        _id: {
          $ne: ignore
        }
      }
    }, {
      username: sort || SORT.ASCENDING
    });
    res.json(new ResponseEntity(200, 'OK', data));
  }catch(err) {
    next(err);
  }
}

export const searchUserAddRoom: RequestHandler<any, ResponseEntity, any, QuerySort & {value: string; roomId: string}> = async (req, res, next) => {
  try{
    const { page = 1, page_size = 10, sort = SORT.ASCENDING, value, roomId } = req.query;
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json(new ResponseEntity(404, 'Room is not existed!'));
    }
    const usersInRoom = room?.group as unknown as Array<string> || [];

    const user = await getUserByQuery({
      page,
      page_size,
      search: {
        username: {
          $regex: value,
          $options: 'i'
        },
        _id: {
          $nin: usersInRoom
        } 
      }
    });
    
    res.json(new ResponseEntity(200, "OK", user));
  }catch(err) {
    next(err);
  }
}

