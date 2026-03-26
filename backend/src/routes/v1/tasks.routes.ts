import { Router } from "express";
import { validateBody } from "../../middleware/validate";
import { requireAuth } from "../../middleware/auth.middleware";
import { TasksController } from "../../controllers/tasks.controller";
import { createTaskSchema, updateTaskSchema } from "../../controllers/tasks.schemas";

export const tasksRouter = Router();

/**
 * @openapi
 * /api/v1/tasks:
 *   get:
 *     tags:
 *       - Tasks
 *     summary: List tasks visible to the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tasks list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tasks:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Task'
 *       401:
 *         description: Unauthorized
 */
tasksRouter.get("/", requireAuth, TasksController.list);

/**
 * @openapi
 * /api/v1/tasks:
 *   post:
 *     tags:
 *       - Tasks
 *     summary: Create a new task for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 120
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *               status:
 *                 type: string
 *                 enum: [TODO, IN_PROGRESS, DONE]
 *               dueDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Task created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 task:
 *                   $ref: '#/components/schemas/Task'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
tasksRouter.post("/", requireAuth, validateBody(createTaskSchema), TasksController.create);

/**
 * @openapi
 * /api/v1/tasks/{id}:
 *   get:
 *     tags:
 *       - Tasks
 *     summary: Get a single task by id (ownership enforced for USER)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *           description: MongoDB ObjectId
 *     responses:
 *       200:
 *         description: Task found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 task:
 *                   $ref: '#/components/schemas/Task'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
tasksRouter.get("/:id", requireAuth, TasksController.getById);

/**
 * @openapi
 * /api/v1/tasks/{id}:
 *   put:
 *     tags:
 *       - Tasks
 *     summary: Update a task (ownership enforced for USER)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *           description: MongoDB ObjectId
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 120
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *               status:
 *                 type: string
 *                 enum: [TODO, IN_PROGRESS, DONE]
 *               dueDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Task updated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
tasksRouter.put(
  "/:id",
  requireAuth,
  validateBody(updateTaskSchema),
  TasksController.update
);

/**
 * @openapi
 * /api/v1/tasks/{id}:
 *   delete:
 *     tags:
 *       - Tasks
 *     summary: Delete a task (ownership enforced for USER)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *           description: MongoDB ObjectId
 *     responses:
 *       200:
 *         description: Task deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 deleted:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       pattern: '^[0-9a-fA-F]{24}$'
 *                       description: MongoDB ObjectId
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
tasksRouter.delete("/:id", requireAuth, TasksController.delete);

