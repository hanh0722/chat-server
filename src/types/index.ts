import { Types } from "mongoose";

export interface ObjectKey {
  [key: string]: any;
}

export interface Id {
  _id: Types.ObjectId;
}

export interface UserMetaData {
  username?: string;
  _id?: string;
}
