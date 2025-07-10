import { headers } from "next/headers";
import { cache } from "react";

import { appRouter } from "@/server/api/root";
import { createCallerFactory, createTRPCContext } from "@/server/api/trpc";

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = cache(async () => {
  const heads = new Headers(await headers());
  heads.set("x-trpc-source", "rsc");

  return createTRPCContext({
    headers: heads,
  });
});

const callerFactory = createCallerFactory(appRouter);
export const api = callerFactory(createContext);

// DON'T DELETE THIS- NEED TO MAKE SURE THE ABOVE WAY IS BETTER ~KS
// export const api = createTRPCClient<AppRouter>({
//   links: [
//     loggerLink({
//       enabled: (op) =>
//         process.env.NODE_ENV === "development" ||
//         (op.direction === "down" && op.result instanceof Error),
//     }),
//     httpBatchLink({
//       url: getUrl(),
//       transformer,
//     }),
//     /**
//      * Custom RSC link that lets us invoke procedures without using http requests. Since Server
//      * Components always run on the server, we can just call the procedure as a function.
//      */
//     () =>
//       ({ op }) =>
//         observable((observer) => {
//           createContext()
//             .then((ctx) => {
//               return callProcedure({
//                 procedures: appRouter._def.procedures,
//                 path: op.path,
//                 getRawInput: async () => op.input,
//                 ctx,
//                 type: op.type,
//               });
//             })
//             .then((data) => {
//               observer.next({ result: { data } });
//               observer.complete();
//             })
//             .catch((cause: TRPCErrorResponse) => {
//               observer.error(TRPCClientError.from(cause));
//             });
//         }),
//   ],
// });
