import { QuerySort } from "../../../types/base";

export interface FetchChatProps extends QuerySort {
  roomId: string;
}

export interface CreateChatProps {
  sender_id: string;
  message: string;
  room_id: string
}