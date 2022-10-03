import mongoose from "mongoose"
import { DB_NAME, DB_PASSWORD, DB_USERNAME } from "../../constants/db";

export const connection = () => {
  return mongoose.connect(`mongodb+srv://${process.env[DB_USERNAME]}:${process.env[DB_PASSWORD]}@cluster0.bhp9h.mongodb.net/${process.env[DB_NAME]}?retryWrites=true&w=majority`);
}