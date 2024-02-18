// page.tsx
import { auth } from "@clerk/nextjs/server";
import { SignInButton } from "@clerk/nextjs";
import { z } from "zod";
import { PostList } from "@/components/PostList";
import { api } from "@/trpc/server";
import styles from './styles.module.css'; // Importing the CSS module

const SortOrder = z.enum(["new", "likes"]).catch("new");

export default async function Browsing({
  searchParams,
}: {
  searchParams: {
    q: string | string[] | undefined;
    sort: string | string[] | undefined;
  };
}) {
  const { userId } = auth(); // This needs to be in a server-side context or within a hook
  const rawQ = searchParams.q;
  const query = Array.isArray(rawQ) ? rawQ.join(" ") : rawQ || '';
  const rawSort = searchParams.sort;
  const sortBy = SortOrder.parse(Array.isArray(rawSort) ? rawSort[0] : rawSort || 'new');

  const res = await api.browse.browse({ query, sortBy });

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>16chan.</h1>
      </header>
      <div className={styles.content}>
        <p className={styles.subtitle}>
          Results for the search query "{query}"
        </p>
        <div className={styles.postList}>
          <PostList initPosts={res} getWhat="search" additional={{ query, sortBy }} />
        </div>
        <p className={styles.sortInfo}>
          These posts should be sorted by {sortBy}
        </p>
        <div className={styles.signInArea}>
          {!userId && (
            <>
              <p>You aren't signed in lol</p>
              <SignInButton className={styles.signInButton}>Do it here</SignInButton>
            </>
          )}
        </div>
        <nav className={styles.navigation}>
          <strong>Links:</strong>
          <ul>
            <li><a href="/">Browser (this page)</a></li>
            <li><a href="/following">Following</a></li>
            <li><a href="/account">Account Page</a></li>
            <li><a href="/post/create">Create Post</a></li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
