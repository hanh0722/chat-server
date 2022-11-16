import { ObjectId, Types } from "mongoose";
import { Chat as ChatModel } from "./Room";
import { User } from "./User";

export class Chat {
  constructor(public message: string, public sender: string, public creation_time: number = Date.now(), public seen_users?: Array<User | Types.ObjectId | string>) {

  }
}