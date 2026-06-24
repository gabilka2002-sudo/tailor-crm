import { PrismaClient } from "@prisma/client";

// Один общий Prisma Client для всего backend.
// Через него backend будет обращаться к базе данных.
const prisma = new PrismaClient();

export default prisma;