import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";

export default async function accountRedirect() {
  const { userId } = auth();
  return userId ? redirect(`/account/${userId}`) : notFound();
}
