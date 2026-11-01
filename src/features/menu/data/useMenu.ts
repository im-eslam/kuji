import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/shared/api";
import type { MenuResponse } from "../types";
import { fetchMenu } from "./menuApi";

export type MenuState =
  | { status: "loading" }
  | { status: "error"; errorCode: string | null }
  | { status: "ready"; menu: MenuResponse };

/** Owns the request lifecycle only. The API response is passed straight to the page. */
export function useMenu(): MenuState & { retry: () => void } {
  const [state, setState] = useState<MenuState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: "loading" });

    fetchMenu(controller.signal)
      .then((menu) => {
        if (!controller.signal.aborted) setState({ status: "ready", menu });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        const code = error instanceof ApiError ? (error.code ?? String(error.status)) : null;
        setState({ status: "error", errorCode: code });
      });

    return () => controller.abort();
  }, [attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  return { ...state, retry };
}
