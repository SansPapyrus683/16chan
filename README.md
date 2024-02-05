# 16chan: if imgur & danbooru made love

upload images, tag images, look at anime girls, what else could you want?

## get started

1. get the env file from kevin
2. `npm run dev`
3. that's literally it

## mysql/sqlite

planetscale has row read/write limits so if you wanna do some sus stuff without bricking ratelimits use sqlite

to change from mysql to sqlite it's p easy:
1. change `DATABASE_URL` to `file:./db.sqlite` instead of the mysql connection url
2. turn this:
    ```prisma
    datasource db {
      provider = "mysql"
      // ...
    }
    ```
    into this:
    ```prisma
    datasource db {
      provider = "sqlite"
      // ...
    }
    ```
3. comment out all `db.Text` annotations bc sqlitle doesn't support them
   (see [this issue](https://github.com/prisma/prisma/issues/9012))
4. run `npx prisma db push`


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

## `db` folder

contains the prisma schema for all our database shenanigans as well as migrations (later)

## `app/api` stuff

the `[trpc]` directory there sure does something, have yet to figure out what :skull:
