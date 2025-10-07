//Import Prisma Client
import { PrismaClient } from '@prisma/client';
//Create ONE instance of Prisma Client to not waste resources - singleton pattern
export const prisma = new PrismaClient();
// Make this instance available to other files
