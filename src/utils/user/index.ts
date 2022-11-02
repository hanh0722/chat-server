import { omit } from "lodash";
import { LeanDocument } from "mongoose";
import { IGNORE_FIELD } from "../../constants/user";
import { SchemaUser } from "../../model/User";
import { Id } from "../../types";

export const getFieldDataUser = (user?: LeanDocument<SchemaUser> & Id) => {
  return omit(user, IGNORE_FIELD);
}