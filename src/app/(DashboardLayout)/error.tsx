"use client";

import { ErrorState } from "@/components/StateFrames/ErrorState";

/** A page that threw while rendering, inside the shell, with a way to retry. */
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return <ErrorState error={error} onRetry={reset} />;
}
