import { Message } from "../types";

export const getMessage = <T = any>(data: string) => {
  try{
    const parse = JSON.parse(data);
    return parse;
  }catch(err) {
    return data;
  }
}

export const sendMessage = <T = any>(data: Message<T>) => {
  return JSON.stringify(data);
}