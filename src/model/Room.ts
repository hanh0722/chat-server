import { Document, Schema, Types, model } from 'mongoose';
import { User } from './User';

export interface Chat {
  message: string;
  sender: User | Types.ObjectId | string;
  creation_time: number;
}
export interface Room {
  from?: User;
  to?: User;
  group?: Array<User>;
  creation_time: number;
  chats: Array<Chat>;
  is_group: boolean
}

export interface RoomSchema extends Room, Document {
  _doc: Room
}

const roomSchema = new Schema<RoomSchema>({
  from: {
    type: Types.ObjectId,
    ref: 'user'
  },
  to: {
    type: Types.ObjectId,
    ref: 'user'
  },
  group: [
    {
      type: Types.ObjectId
    }
  ],
  creation_time: {
    type: Number,
    required: true,
    default: Date.now()
  },
  is_group: {
    type: Boolean,
    required: true,
    default: false
  },
  chats: [
    {
      message: {
        type: String,
        required: true
      },
      sender: {
        type: Types.ObjectId,
        required: true,
        ref: 'user'
      },
      creation_time: {
        type: Number,
        required: true,
        default: Date.now()
      }
    }
  ]
}, {
  timestamps: true,
});

export default model<RoomSchema>('room', roomSchema);