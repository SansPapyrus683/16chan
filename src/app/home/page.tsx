import { UserButton } from "@clerk/nextjs";

export default function Dashboard() {
  return (
    <div>
      this is supposed to be auth protected
      <UserButton />
    </div>
  );
}
