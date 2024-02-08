import { redirect } from "next/navigation";

export default function Search({
  searchParams,
}: {
  searchParams: { q: string | string[] | undefined };
}) {
  const rawQ = searchParams.q;
  if (rawQ === undefined) {
    redirect("/");
  }
  if (Array.isArray(rawQ)) {
    searchParams.q = rawQ[0];
  }
  const query = searchParams.q;
  return <div>search results for the query "{query}"</div>;
}
