import { RequestHandler } from "express";
import { ValidationError, validationResult } from 'express-validator';
import User, { SchemaUser } from "../../model/User";
import { ResponseEntity } from "../../response";
import { createUser } from "../../services/user";
import { RequestRegister, RequestValidateUser } from "../../types/response/user";
import { sendMail } from "../../utils/mail";

export const loginController: RequestHandler = async (req, res, next) => {
  
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