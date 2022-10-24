import { body } from "express-validator";
import User from "../../../model/User";
import { isContainUpperCase, isPasswordContainSpecialCharacter } from "../../../operator";
import { getUserByUsername } from "../../../services/user";

export const loginValidator = [
  body('username')
  .not()
  .isEmpty()
  .withMessage('Username không được để trống'),
  body('password')
  .not()
  .isEmpty()
  .withMessage('Mật khẩu không được để trống')
];

export const registerValidator = [
  body("username")
    .not()
    .isEmpty()
    .withMessage("Username không được phép để trống")
    .custom(async (username: string, { req }) => {
      const user = await getUserByUsername(username);
      if (user) {
        return Promise.reject('Username đã tồn tại trong hệ thống');
      }
      return true;
    }),
  body("email").isEmail().withMessage("Email không hợp lệ"),
  body("password")
    .not()
    .isEmpty()
    .withMessage("Mật khẩu không được để trống")
    .custom((password: string, { req }) => {
      const isValidPassword = isContainUpperCase(password) && isPasswordContainSpecialCharacter(password);

      if (!isValidPassword) {
        return Promise.reject('Mật khẩu phải có chứa 1 ký tự in hoa [A-Z] và 1 ký tự đặc biệt');
      }

      return true;
    }),
];

export const validateUserOTP = [
  body('otp')
  .not()
  .isEmpty()
  .withMessage('Mã xác thực không được để trống'),
  body('username')
  .not()
  .isEmpty()
  .withMessage('Username không hợp lệ')
  .custom(async (username, {req}) => {
    try{
      const otp = req.body?.['otp'];
      const user = await User.findOne({username: username});
      if (!user) {
        return Promise.reject('Người dùng không tồn tại trong hệ thống!');
      }

      const isValidate = user?.is_validate;
      const otpUser = user?.otp;
      if (isValidate || !otp || !otpUser) {
        return Promise.reject(`Người dùng ${username} đã được xác thực!`);
      }
      if (otp !== otpUser) {
        return Promise.reject('Mã xác thực không chính xác!');
      }
      return true;
    }catch(err) {
      return Promise.reject('Có lỗi xảy ra, xin thử lại sau')
    }
  })
]