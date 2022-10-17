import { SchemaUser } from "../../../model/User";
import { omit } from "lodash";
import { FILTER } from "../../../constants/filter/user";

export const responseUser = (user: SchemaUser) => {
  const toObject = user.toObject();
  return omit(toObject, FILTER);
};
