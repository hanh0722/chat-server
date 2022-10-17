import { ErrorRequestHandler } from "express";
import { ResponseEntity } from "../../response";

export const ErrorHandling: ErrorRequestHandler = (err: ResponseEntity, req, res, next) => {
  const code = err?.code || 500;
  const message = err?.message;
  const data = err?.data;

  res.status(code).json(new ResponseEntity(code, message, data));
}