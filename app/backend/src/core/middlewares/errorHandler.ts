import { NextFunction, Request, Response } from "express";
import { AppError, ValidationError } from "../errors/AppError.js";
import { Logger } from "../utils/logger.js";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  Logger.error("Unhandled Application Exception", err);

  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
};
