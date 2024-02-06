import { type auth } from "@clerk/nextjs/server";
import { db } from "@/server/db";

export async function userTest(ctx: { auth: ReturnType<typeof auth> }) {
  const id = ctx.auth.userId!;
  const res = await db.user.findFirst({ where: { id } });
  return res ?? (await db.user.create({ data: { id } }));
}
