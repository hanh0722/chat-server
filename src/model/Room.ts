import { Document, Schema, Types, model } from 'mongoose';
import { User } from './User';

export interface Chat {
  message: string;
  sender: User | Types.ObjectId | string;
  creation_time: number;
  seen_users?: Array<string | Types.ObjectId | User>
}
export interface Room {
  from?: User;
  to?: User;
  group?: Array<User>;
  creation_time: number;
  chats: Array<Chat>;
  is_group: boolean;
  group_info?: RoomInfo
}

export interface RoomSchema extends Room, Document {
  _doc: Room
}

export interface RoomInfo {
  name_group: string;
  creator: string
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
      type: Types.ObjectId,
      ref: 'user'
    }
  ],
  creation_time: {
    type: Number,
    required: true,
    default: Date.now()
  },
  group_info: {
    name_group: {
      type: String,
    },
    creator: {
      type: Types.ObjectId,
      ref: 'user'
    }
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
      },
      seen_users: [
        {
          type: Types.ObjectId,
          ref: 'user'
        }
      ]
    }
  ]
}, {
  timestamps: true,
});

export default model<RoomSchema>('room', roomSchema);