# 16chan: if imgur & danbooru made love

upload images, tag images, look at anime girls, what else could you want?

## get started

1. create a file named `.env` in the root directory of the project
2. copy paste all the text from 
   [this google doc](https://docs.google.com/document/d/1-8259GSPKIUHJbyqNu5lBagW7aZ1LX_7Uyzuh8ftJCM/edit)
   into that file
3. `npm run dev`
4. that's it!

## ok how does this actually work

ok let's see how this t3 thing actually works

for trpc, [this](https://trpc.io/docs/client/nextjs/setup) link seems pretty handy

## root folder

* most of these are just config files
* `postcss.config.cjs` is for postcss which is for tailwind
* all the others should be pretty self-explanatory

## `src` folder

* `env.js` loads in env variables in a convenient manner w/ zod
* `globals.css` loads tailwind and is imported in `app/layout.tsx`
* `middleware.ts` allows us to protect certain url routes
  (some other stuff but that's what we're mainly using it for rn)

### `trpc` folder

* `react.tsx` sets up trpc on _client_ side, provides a component that is used in `app/layout.tsx`
* `server.ts` sets up trpc on _server_ side
* `shared.ts` just some utility functions i suppose

### `server` folder

* `db.ts` initializes the prisma db client from env variables(?)
* **`api` subfolder**
    * `trpc.ts` defines types of procedures, middleware, & context
    * `root.ts` starts off the app router, uses the functions from the `routers` folder
    * the `routers` folder is where the procedure definitions actually are jesus christ

### `app/api` stuff

the `[trpc]` directory there sure does something, have yet to figure out what :skull:

## `prisma` folder

contains the prisma schema for all our database shenanigans as well as migrations (later)
