import { getJson } from "@/shared/api";
import { MENU_API } from "../config";
import type { MenuDocument } from "../types";

export function fetchMenuDocument(signal?: AbortSignal): Promise<MenuDocument> {
  return getJson<MenuDocument>(MENU_API, signal);
}
