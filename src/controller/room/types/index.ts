import { QuerySort } from "../../../types/base";

export interface CreateRoomRequest {
  from: string;
  to: string;
  message: string;
}

export interface GetRoomDetailRequest extends QuerySort {
  
}