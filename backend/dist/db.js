"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
//Import Prisma Client
const client_1 = require("@prisma/client");
//Create ONE instance of Prisma Client to not waste resources - singleton pattern
exports.prisma = new client_1.PrismaClient();
// Make this instance available to other files
//# sourceMappingURL=db.js.map