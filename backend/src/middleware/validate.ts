import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";
import { HttpError } from "../utils/httpError";

export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return next(
        new HttpError({
          status: 400,
          code: "VALIDATION_ERROR",
          message: "Request body validation failed",
          details: parsed.error.flatten(),
        })
      );
    }
    req.body = parsed.data;
    return next();
  };
}

