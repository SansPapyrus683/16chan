import { PrismaClient as BasePrismaClient } from "@prisma/client";

import { env } from "@/env";
import { s3Delete } from "@/lib/s3";

/** sauce: https://www.answeroverflow.com/m/1122213580608131163 */
function getPrisma() {
  return new BasePrismaClient({
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  }).$extends({
    name: "s3 delete",
    query: {
      post: {
        async delete({ args, query }) {
          const deleted = await query({
            ...args,
            include: { ...args.include, images: true },
          });
          for (const img of deleted.images ?? []) {
            void s3Delete(img.img!);
          }
          return deleted;
        },
      },
    },
  });
}

export type PrismaClient = ReturnType<typeof getPrisma>;
// not sure why this type is needed tbh, but the answer included it so
export type TransactionClient = Parameters<
  Parameters<PrismaClient["$transaction"]>[0]
>[0];

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? getPrisma();

if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
