import { ObjectKey } from "../../types";

export const omit = (obj: ObjectKey, ...args: Array<string>) => {
  const entries = Object.entries(obj);
  return entries.reduce((acc, [key, value]) => {
    console.log(key, value);
    return acc;
  }, {});
}