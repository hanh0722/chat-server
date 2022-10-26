import { Document, Schema, Types, model } from 'mongoose';
import { User } from './User';

export interface Room {
  from?: User;
  to?: User;
  group?: Array<User>;
  creation_time: number;
}

export interface RoomSchema extends Room, Document {

}

const roomSchema = new Schema<RoomSchema>({
  from: {
    type: Types.ObjectId
  },
  to: {
    type: Types.ObjectId
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
  }
}, {
  timestamps: true,
});

export default model<RoomSchema>('room', roomSchema);