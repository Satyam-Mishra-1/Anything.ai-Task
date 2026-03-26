import path from "path";
import swaggerJsdoc from "swagger-jsdoc";
import { env } from "../config/env";

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Project P3 Backend API",
      version: "1.0.0",
      description: "Secure REST API with JWT authentication and Role-Based Access Control (RBAC).",
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}/api/v1`,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            email: { type: "string", format: "email" },
            role: { type: "string", enum: ["USER", "ADMIN"] },
          },
        },
        Task: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            title: { type: "string", maxLength: 120 },
            description: { type: "string", maxLength: 1000, nullable: true },
            status: { type: "string", enum: ["TODO", "IN_PROGRESS", "DONE"] },
            dueDate: { type: "string", format: "date", nullable: true },
            ownerId: { type: "string", format: "uuid" },
            createdAt: { type: "string" },
            updatedAt: { type: "string" },
          },
        },
      },
    },
  },
  apis: [
    path.join(process.cwd(), "src/routes/**/*.ts"),
    path.join(process.cwd(), "src/controllers/**/*.ts"),
  ],
});

