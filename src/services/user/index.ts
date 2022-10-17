import User, { SchemaUser } from "../../model/User";
import bcrypt from "bcrypt";
import { CreateUserParams } from "../../types/response/user";
import { HASH_ROUND } from "../../constants/hash";
import { randomByRange } from "../../utils/random";
import { sendMail } from "../../utils/mail";

export const getUserByUsername = async (username: string) => {
  try {
    const user = await User.findOne({
      username: { $regex: new RegExp(`^${username}$`), $options: "i" },
    });
    return user;
  } catch (err) {
    return null;
  }
};

export const createUser = async (params: CreateUserParams) => {
  try {
    const { email, password, username } = params;
    const hash = await bcrypt.hash(password, HASH_ROUND);
    const random = randomByRange();

    const user = new User({
      username,
      email,
      password: hash,
      otp: random,
      is_validate: false
    });
    return user.save() as Promise<SchemaUser>;
  } catch (err) {
    return err;
  }
};
