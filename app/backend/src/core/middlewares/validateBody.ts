import { NextFunction, Request, Response } from "express";
import { ZodError, ZodSchema } from "zod";
import { ValidationError } from "../errors/AppError.js";

export const validateBody = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const issues = err.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        }));
        return next(new ValidationError("Validation Error", issues));
      }
      next(err);
    }
  };
};
