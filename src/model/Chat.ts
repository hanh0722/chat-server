import { Chat as ChatModel } from "./Room";

export class Chat {
  constructor(public message: string, public sender: string, public creation_time: number = Date.now()) {

  }
}