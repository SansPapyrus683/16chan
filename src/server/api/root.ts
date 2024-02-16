import { postCrudRouter } from "@/server/api/routers/post-crud";
import { createRouter, mergeRouter } from "@/server/api/trpc";
import { userProfileRouter } from "@/server/api/routers/user-profile";
import { albumRouter } from "@/server/api/routers/albums";
import { postInteractRouter } from "@/server/api/routers/post-interact";
import { userInteractionRouter } from "@/server/api/routers/user-interaction";
import { browseRouter } from "@/server/api/routers/browse";

export const appRouter = createRouter({
  post: mergeRouter(postCrudRouter, postInteractRouter),
  user: mergeRouter(userProfileRouter, userInteractionRouter),
  album: albumRouter,
  browse: browseRouter,
});

export type AppRouter = typeof appRouter;
