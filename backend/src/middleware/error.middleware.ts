import type { ErrorRequestHandler } from "express";
import { HttpError } from "../utils/httpError";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  // Normalize unknown errors.
  const isHttpError = err instanceof HttpError;

  const status = isHttpError ? err.status : 500;
  const code = isHttpError ? err.code : "INTERNAL_SERVER_ERROR";
  const message = isHttpError ? err.message : "Unexpected error";

  // Avoid leaking sensitive details in production.
  const details =
    isHttpError && err.details !== undefined
      ? err.details
      : process.env.NODE_ENV === "development"
        ? err
        : undefined;

  return res.status(status).json({
    error: {
      code,
      message,
      ...(details !== undefined ? { details } : {}),
    },
  });
};

