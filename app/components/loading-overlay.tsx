"use client";

import { useNavigation } from "@remix-run/react";
import type { ReactNode } from "react";
import { useSpinDelay } from "spin-delay";

export function LoadingOverlay({ children }: { children?: ReactNode }) {
  const navigation = useNavigation();
  const searching = new URLSearchParams(navigation.location?.search).has("q");
  const loading = navigation.state === "loading";
  const showOverlay = useSpinDelay(loading && !searching);

  if (showOverlay) {
    return <div className="opacity-50 transition-opacity">{children}</div>;
  }

  return children;
}
