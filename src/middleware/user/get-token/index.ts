import { RequestHandler } from "express";
import { verify } from "jsonwebtoken";
import { TOKEN_KEY } from "../../../constants/key";
import { TokenMiddleware } from "../../types";

export const getTokenMiddleware: RequestHandler = (req, res, next) => {
  try {
    const headers = req.headers;
    const request = headers?.authorization;

    if (!request) {
      return next();
    }

    const token = request.split('Bearer ')[1];

    const tokenData = verify(token, TOKEN_KEY) as TokenMiddleware;

    if (!tokenData) {
      return next();
    }

    req.token = token;
    req.metaData = {}
    req.metaData._id = tokenData._id;
    req.metaData.username = tokenData.username;
    next();

  } catch (err) {
    console.log(err);
    next();
  }
};
