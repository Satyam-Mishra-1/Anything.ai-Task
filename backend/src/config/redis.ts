import Redis from "ioredis";
import { env } from "./env";

export const redis =
  env.REDIS_URL && env.REDIS_URL.length > 0 ? new Redis(env.REDIS_URL) : undefined;

