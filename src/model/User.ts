import { Schema, model, Document } from "mongoose";

export interface User {
  username: string;
  password: string;
  email: string;
  creation_time: number,
  is_validate?: boolean,
  otp?: number;
  avatar?: string;
  description?: string;
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
  },
  avatar: {
    type: String
  },
  description: {
    type: String,
    default: 'Xin chào! Tôi đang sử dụng chat PTIT! Hãy cùng nhau trò chuyện nhé'
  }
}, {
  timestamps: true,
});

export default model<SchemaUser>('user', UserSchema);