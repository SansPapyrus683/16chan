"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

// https://nextjs.org/docs/app/building-your-application/routing/error-handling
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div>
      <h2>damit something screwed up</h2>
      <Button onClick={() => reset()}>Try Again</Button>
    </div>
  );
}
