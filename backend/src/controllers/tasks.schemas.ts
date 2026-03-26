import { z } from "zod";

const taskStatus = z.enum(["TODO", "IN_PROGRESS", "DONE"]);

const dueDateToDate = z.preprocess((val) => {
  if (val === undefined) return undefined;
  if (val === null) return null;
  if (typeof val !== "string") return val;
  const trimmed = val.trim();
  if (!trimmed) return null;

  // Accept either YYYY-MM-DD (from <input type="date">) or full ISO strings.
  const asDate = trimmed.length === 10 ? new Date(trimmed + "T00:00:00.000Z") : new Date(trimmed);
  return asDate;
}, z.date().nullable().optional());

export const createTaskSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(1000).optional(),
  status: taskStatus.optional().default("TODO"),
  dueDate: dueDateToDate.optional(),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  title: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().max(1000).optional(),
});

export const taskIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId format"),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

