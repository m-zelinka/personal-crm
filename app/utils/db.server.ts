import { remember } from "@epic-web/remember";
import { PrismaClient } from "@prisma/client";

export const prisma = remember("db", () => {
  const client = new PrismaClient();
  client.$connect();

  return client;
});
