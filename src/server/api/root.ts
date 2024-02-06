import { postRouter } from "@/server/api/routers/post";
import { createTRPCRouter } from "@/server/api/trpc";

export const appRouter = createTRPCRouter({
  post: postRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
