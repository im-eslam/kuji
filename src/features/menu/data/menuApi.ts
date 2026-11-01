import { ApiError, getJson } from "@/shared/api";
import { MENU_API, MENU_SCHEMA_VERSION } from "../config";
import type { MenuResponse } from "../types";

export async function fetchMenu(signal?: AbortSignal): Promise<MenuResponse> {
  const menu = await getJson<MenuResponse>(MENU_API, signal);

  if (menu.schemaVersion !== MENU_SCHEMA_VERSION) {
    throw new ApiError(200, `Unsupported menu schema version: ${String(menu.schemaVersion)}`, "INVALID_RESPONSE");
  }

  return menu;
}
