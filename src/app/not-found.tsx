import Link from "next/link";

export default function NotFound() {
  return (
    <div>
      <h2>oops!</h2>
      <p>we couldn't find the requested resource 😭</p>
      <Link href="/">go to home page?</Link>
    </div>
  );
}
