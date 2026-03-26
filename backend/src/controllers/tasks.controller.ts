import type { Request, Response } from "express";
import { TaskService } from "../services/task.service";
import { HttpError } from "../utils/httpError";
import { taskIdParamSchema } from "./tasks.schemas";
import type { CreateTaskInput, UpdateTaskInput } from "./tasks.schemas";

export class TasksController {
  static async list(req: Request, res: Response) {
    if (!req.user) {
      throw new HttpError({
        status: 401,
        code: "UNAUTHORIZED",
        message: "Authentication required",
      });
    }
    const tasks = await TaskService.list(req.user);
    return res.status(200).json({ tasks });
  }

  static async getById(req: Request, res: Response) {
    if (!req.user) {
      throw new HttpError({
        status: 401,
        code: "UNAUTHORIZED",
        message: "Authentication required",
      });
    }

    const parsed = taskIdParamSchema.safeParse(req.params);
    if (!parsed.success) {
      throw new HttpError({
        status: 400,
        code: "VALIDATION_ERROR",
        message: "Invalid task id",
        details: parsed.error.flatten(),
      });
    }

    const task = await TaskService.getById(req.user, parsed.data.id);
    return res.status(200).json({ task });
  }

  static async create(req: Request, res: Response) {
    if (!req.user) {
      throw new HttpError({
        status: 401,
        code: "UNAUTHORIZED",
        message: "Authentication required",
      });
    }
    const input = req.body as CreateTaskInput;
    const task = await TaskService.create(req.user, input);
    return res.status(201).json({ task });
  }

  static async update(req: Request, res: Response) {
    if (!req.user) {
      throw new HttpError({
        status: 401,
        code: "UNAUTHORIZED",
        message: "Authentication required",
      });
    }

    const parsed = taskIdParamSchema.safeParse(req.params);
    if (!parsed.success) {
      throw new HttpError({
        status: 400,
        code: "VALIDATION_ERROR",
        message: "Invalid task id",
        details: parsed.error.flatten(),
      });
    }

    const input = req.body as UpdateTaskInput;
    const task = await TaskService.update(req.user, parsed.data.id, input);
    return res.status(200).json({ task });
  }

  static async delete(req: Request, res: Response) {
    if (!req.user) {
      throw new HttpError({
        status: 401,
        code: "UNAUTHORIZED",
        message: "Authentication required",
      });
    }

    const parsed = taskIdParamSchema.safeParse(req.params);
    if (!parsed.success) {
      throw new HttpError({
        status: 400,
        code: "VALIDATION_ERROR",
        message: "Invalid task id",
        details: parsed.error.flatten(),
      });
    }

    const result = await TaskService.delete(req.user, parsed.data.id);
    return res.status(200).json({ deleted: result });
  }
}

