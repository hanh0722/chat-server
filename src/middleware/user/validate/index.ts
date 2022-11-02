import { RequestHandler } from "express";
import { verify } from "jsonwebtoken";
import { TOKEN_KEY } from "../../../constants/key";
import { ResponseEntity } from "../../../response";
import { TokenMiddleware } from "../../types";

export const validateUserMiddleware: RequestHandler = (req, res, next) => {
  try{
    const headers = req.headers;
    if (!headers) {
      return res.status(403).json(new ResponseEntity(403, 'Not Authentication'));
    };

    const authorization = headers.authorization;
    const token = authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(403).json(new ResponseEntity(403, 'Not Authentication'));
    }
    const verifyToken = verify(token, TOKEN_KEY) as TokenMiddleware;
    
    if (!verifyToken) {
      return res.status(403).json(new ResponseEntity(403, 'Not Authentication'));
    }
    req.metaData = {};
    req.metaData._id = verifyToken._id;
    req.metaData.username = verifyToken.username;
    next();
  }catch(err) {
    next(err);
  }
}