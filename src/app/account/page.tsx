import { notFound, redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";

export default async function accountRedirect() {
  const user = await currentUser();
  return user ? redirect(`/account/${user.username}`) : notFound();
}
