import { postCrudRouter } from "@/server/api/routers/post-crud";
import { createRouter, mergeRouter } from "@/server/api/trpc";
import { userRouter } from "@/server/api/routers/user";
import { albumRouter } from "@/server/api/routers/albums";
import { postInteractRouter } from "@/server/api/routers/post-interact";

export const appRouter = createRouter({
  post: mergeRouter(postCrudRouter, postInteractRouter),
  user: userRouter,
  album: albumRouter,
});

export type AppRouter = typeof appRouter;
