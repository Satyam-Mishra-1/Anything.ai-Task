import { prisma } from "../config/prisma";
import type { AuthUser, UserRole } from "../types/auth";
import { HttpError } from "../utils/httpError";
import { sanitizeText } from "../utils/sanitize";
import { redis } from "../config/redis";
import type { CreateTaskInput, UpdateTaskInput } from "../controllers/tasks.schemas";

const TASKS_LIST_CACHE_TTL_SECONDS = 30;

function tasksListCacheKey(user: AuthUser) {
  return user.role === "ADMIN" ? "tasks:list:admin" : `tasks:list:user:${user.id}`;
}

export class TaskService {
  static async list(user: AuthUser) {
    const cacheKey = tasksListCacheKey(user);
    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) return JSON.parse(cached);
    }

    const tasks =
      user.role === "ADMIN"
        ? await prisma.task.findMany({ orderBy: { createdAt: "desc" } })
        : await prisma.task.findMany({
            where: { ownerId: user.id },
            orderBy: { createdAt: "desc" },
          });

    if (redis) {
      // JSON serialization is sufficient for UI demonstration.
      await redis.set(cacheKey, JSON.stringify(tasks), "EX", TASKS_LIST_CACHE_TTL_SECONDS);
    }

    return tasks;
  }

  static async getById(user: AuthUser, taskId: string) {
    const task =
      user.role === "ADMIN"
        ? await prisma.task.findUnique({ where: { id: taskId } })
        : await prisma.task.findFirst({
            where: { id: taskId, ownerId: user.id },
          });

    if (!task) {
      throw new HttpError({
        status: 404,
        code: "TASK_NOT_FOUND",
        message: "Task not found",
      });
    }
    return task;
  }

  static async create(user: AuthUser, input: CreateTaskInput) {
    const title = sanitizeText(input.title, 120);
    const description =
      input.description !== undefined
        ? sanitizeText(input.description ?? "", 1000) || undefined
        : undefined;

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: input.status,
        dueDate: input.dueDate,
        ownerId: user.id,
      },
    });

    if (redis) {
      await redis.del(tasksListCacheKey(user));
      await redis.del("tasks:list:admin");
    }

    return task;
  }

  static async update(user: AuthUser, taskId: string, input: UpdateTaskInput) {
    // Ensure access (ownership enforced for USER).
    const existing = await this.getById(user, taskId);

    const updateData: Record<string, unknown> = {};
    if (input.title !== undefined) updateData.title = sanitizeText(input.title, 120);
    if (input.description !== undefined) {
      updateData.description =
        input.description === undefined ? undefined : sanitizeText(input.description ?? "", 1000) || null;
    }
    if (input.status !== undefined) updateData.status = input.status;
    if (input.dueDate !== undefined) updateData.dueDate = input.dueDate;

    const task = await prisma.task.update({
      where: { id: existing.id },
      data: updateData as any,
    });

    if (redis) {
      await redis.del(tasksListCacheKey(user));
      await redis.del("tasks:list:admin");
    }
    return task;
  }

  static async delete(user: AuthUser, taskId: string) {
    // Ensure access (ownership enforced for USER).
    const existing = await this.getById(user, taskId);

    await prisma.task.delete({ where: { id: existing.id } });

    if (redis) {
      await redis.del(tasksListCacheKey(user));
      await redis.del("tasks:list:admin");
    }

    return { id: existing.id };
  }
}

