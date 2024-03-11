"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

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
      <Button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
        className="border p-0.5"
      >
        try again i guess
      </Button>
    </div>
  );
}
