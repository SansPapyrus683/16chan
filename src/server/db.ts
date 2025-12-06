import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient as BasePrismaClient } from "@prisma/client";

import { env } from "@/env";
import { s3Delete } from "@/lib/s3";

/** sauce: https://www.answeroverflow.com/m/1122213580608131163 */
function getPrisma() {
  // what???
  const adapter = new PrismaNeon({ connectionString: env.DB_URL });
  const prisma = new BasePrismaClient({
    adapter,
    log: env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
  return prisma
    .$extends({
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
    })
    .$extends({
      name: "post image urls",
      result: {
        image: {
          miniImg: {
            needs: { img: true },
            compute(img) {
              return new URL(img.img, env.MINI_CDN).href;
            },
          },
          rawImg: {
            needs: { img: true },
            compute(img) {
              return new URL(img.img, env.RAW_CDN).href;
            },
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
