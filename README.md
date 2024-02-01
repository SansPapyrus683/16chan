# 16chan: danbooru's illegitimate child

upload images, tag images, look at anime girls, what else could you want?

## get started

1. get the env file from kevin

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
