import { body } from "express-validator";
import { isContainUpperCase, isPasswordContainSpecialCharacter } from "../../../operator";
import { getUserByUsername } from "../../../services/user";

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
