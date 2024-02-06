# 16chan: if imgur & danbooru made love

upload images, tag images, look at anime girls, what else could you want?

## get started

1. get the env file from kevin
2. `npm run dev`
3. **webhook setup**
   1. if you want webhooks to work, which are needed for db entries to be created on user signups, you first have to [install ngrok](https://ngrok.com/)
   2. get the auth token from kevin so you can host the domain and run this
      ```shell
      ngrok config add-authtoken <AUTH TOKEN HERE>
      ``` 
   3. and then just run this and you chillin (if you use a port other than 3000, put that there instead)
      ```shell
      ngrok http --domain=upright-quail-vaguely.ngrok-free.app 3000
      ```

## ok how does this actually work

ok let's see how this crappy t3 thing actually works

for trpc, [this](https://trpc.io/docs/client/nextjs/setup) link seems pretty handy

## `src` folder

* `env.mjs`- loads in env variables in a convenient manner w/ zod
* the others configure what their name says- `postcss.config.js` is just for tailwind tho

## `trpc` folder

* `react.tsx`- sets up trpc on _client_ side
* `server.ts`- sets up trpc on _server_ side
* `shared.ts`- just some utility functions i suppose

## `server` folder

* `db.ts` initializes the prisma db client from env variables(?)
* `auth.ts` contains the nextauth.js auth options
* **`api` subfolder**
   * `trpc.ts`- defines types of procedures, middleware, & context
   * `root.ts`- starts of the app router, uses the functions from the `routers` folder
   * the `routers` folder is where the procedure definitions actually are jesus christ

## `prisma` folder

contains the prisma schema for all our database shenanigans as well as migrations (later)

## `app/api` stuff

the `[trpc]` directory there sure does something, have yet to figure out what :skull:
