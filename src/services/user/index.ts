import User, { SchemaUser, User as UserModel } from "../../model/User";
import bcrypt from "bcrypt";
import { pick } from 'lodash';
import jwt, { SignOptions } from "jsonwebtoken";
import { CreateUserParams } from "../../types/response/user";
import { HASH_ROUND } from "../../constants/hash";
import { randomByRange } from "../../utils/random";
import { sendMail } from "../../utils/mail";
import { Id } from "../../types";
import { TOKEN_FIELD } from "../../constants/user";
import { TOKEN_KEY } from "../../constants/key";
import { LeanDocument } from "mongoose";

export const isMatchPassword = async (hash: string, password: string) => {
  try {
    const isMatch = await bcrypt.compare(password, hash);
    return isMatch;
  } catch (err) {
    return false;
  }
};

export const createToken = (user: LeanDocument<SchemaUser> & Id | SchemaUser & Id, options?: SignOptions) => {
  try{
    const payload = pick(user, TOKEN_FIELD);
    const token = jwt.sign(payload, TOKEN_KEY, {
      expiresIn: '24h',
      ...(options || {})
    });

    return token;
  }catch(err) {
    return null;
  }
};

export const getUser = async <T = any>(field: string, value: T) => {
  try {
    const user = await User.findOne({ [field]: value }).lean();
    return user;
  } catch (err) {
    return null;
  }
};

export const getUserById = async (userId: string) => {
  try{
    const user = await User.findById(userId).lean();
    return user;
  }catch(err) {
    return null;
  }
}
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
      is_validate: false,
    });
    return user.save() as Promise<SchemaUser>;
  } catch (err) {
    return err;
  }
};