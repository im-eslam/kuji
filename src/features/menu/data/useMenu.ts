import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/shared/api";
import type { MenuDb } from "../types";
import { fetchMenuDocument } from "./menuApi";
import { parseMenu } from "./parseMenu";

export type MenuState =
  | { status: "loading" }
  | { status: "error"; errorCode: string | null }
  | { status: "ready"; db: MenuDb };

export function useMenu(): MenuState & { retry: () => void } {
  const [state, setState] = useState<MenuState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: "loading" });

    fetchMenuDocument(controller.signal)
      .then((doc) => {
        if (controller.signal.aborted) return;
        setState({ status: "ready", db: parseMenu(doc) });
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
