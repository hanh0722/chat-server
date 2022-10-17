import { Schema, model, Document } from "mongoose";

export interface User {
  username: string;
  password: string;
  email: string;
  creation_time: number,
  is_validate?: boolean,
  otp?: number;
}

export interface SchemaUser extends User, Document {
  _doc: User
}

const UserSchema = new Schema<SchemaUser>({
  username: {
    type: String,
    required: true,
    index: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  creation_time: {
    type: Number,
    required: true,
    default: Date.now(),
  },
  is_validate: {
    type: Boolean,
    default: false
  },
  otp: {
    type: Number
  }
}, {
  timestamps: true,
});

export default model<SchemaUser>('user', UserSchema);