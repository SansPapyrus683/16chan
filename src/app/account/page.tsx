import { UserButton } from "@clerk/nextjs";
import { api } from "@/trpc/server";

export default async function Account() {
  const posts = await api.user.userPosts();

  return (
    <div>
      this is supposed to be auth protected
      <UserButton />
    </div>
  );
}
