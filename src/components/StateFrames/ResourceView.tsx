"use client";

import { useCallback, useEffect, useState } from "react";

import { withBasePath } from "@/lib/paths";

import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { LoadingState } from "./LoadingState";

type State<T> =
  | { status: "loading" }
  | { status: "error"; error: unknown }
  | { status: "ready"; data: T[] };

/**
 * Loads a JSON array from an API path in the browser and shows the shared loading, error (with
 * Try again) or empty frame, or the data through `children`.
 */
export function ResourceView<T>({
  path,
  emptyTitle,
  emptyDescription,
  errorTitle,
  children,
}: {
  path: string;
  emptyTitle: string;
  emptyDescription?: string;
  errorTitle?: string;
  children: (items: T[]) => React.ReactNode;
}) {
  const [state, setState] = useState<State<T>>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch(withBasePath(path))
      .then((response) => {
        if (!response.ok) throw new Error(`GET ${path} answered ${response.status}`);
        return response.json() as Promise<T[]>;
      })
      .then((data) => {
        if (!cancelled) setState({ status: "ready", data });
      })
      .catch((error: unknown) => {
        if (!cancelled) setState({ status: "error", error });
      });
    return () => {
      cancelled = true;
    };
  }, [path, attempt]);

  const retry = useCallback(() => {
    setState({ status: "loading" });
    setAttempt((n) => n + 1);
  }, []);

  if (state.status === "loading") return <LoadingState />;
  if (state.status === "error")
    return <ErrorState title={errorTitle} error={state.error} onRetry={retry} />;
  if (state.data.length === 0)
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  return <>{children(state.data)}</>;
}
