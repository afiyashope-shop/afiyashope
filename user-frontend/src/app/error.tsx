"use client";

import { useEffect } from "react";
import { OfflineState } from "@/components/OfflineState";

type RouteError = Error & { digest?: string };

export default function ErrorPage({
  error,
  reset,
}: {
  error: RouteError;
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Storefront failed to load.", error);
  }, [error]);

  return (
    <OfflineState onRetry={reset} />
  );
}
