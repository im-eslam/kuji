import { useEffect, useState } from "react";
import { ApiError, getJson } from "@/shared/api";
import type { MenuResponse } from "../data/types";

type MenuState =
  | { status: "loading" }
  | { status: "error"; isNetworkError: boolean }
  | { status: "ready"; menu: MenuResponse };

export function useMenu() {
  const [state, setState] = useState<MenuState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    getJson<MenuResponse>("/menu", controller.signal)
      .then((menu) => setState({ status: "ready", menu }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        const isNetworkError =
          error instanceof ApiError &&
          (error.code === "NETWORK_ERROR" || error.code === "TIMEOUT");
        setState({ status: "error", isNetworkError });
      });

    return () => controller.abort();
  }, [attempt]);

  function retry() {
    setState({ status: "loading" });
    setAttempt((n) => n + 1);
  }

  return { ...state, retry };
}
