import { postRouter } from "@/server/api/routers/post";
import { createTRPCRouter } from "@/server/api/trpc";
import { userRouter } from "@/server/api/routers/user";
import { albumRouter } from "@/server/api/routers/albums";

export const appRouter = createTRPCRouter({
  post: postRouter,
  user: userRouter,
  album: albumRouter,
});

export type AppRouter = typeof appRouter;
