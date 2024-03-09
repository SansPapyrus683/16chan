# 16chan: if imgur & danbooru made love

upload images, tag images, look at anime girls, what else could you want?

## get started

### easy way

```bash
python run.py
```

that's it. it'll prompt you for the environment variables and run `npm run dev` all by itself

### normal way

1. get the env file from kevin
2. `npm run dev`
3. **webhook setup- not needed since we deployed to vercel for the webhook**
    1. if you want webhooks to work, which are needed for db entries to be created on user signups, you first have
       to [install ngrok](https://ngrok.com/)
    2. get the auth token from kevin so you can host the domain and run this
       ```shell
       ngrok config add-authtoken <AUTH TOKEN HERE>
       ``` 
    3. and then just run this and you chillin (if you use a port other than 3000, put that there instead)
       ```shell
       ngrok http --domain=upright-quail-vaguely.ngrok-free.app 3000
       ```
       if you don't wanna type that out it's also stored as a script- just do `npm run starthook`

## ok how does this actually work

ok let's see how this crappy t3 thing actually works

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
