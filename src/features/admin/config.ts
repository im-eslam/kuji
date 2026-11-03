import type { IconName } from "@/shared/icons";
import { ROUTES } from "@/shared/routes";

export const ADMIN_HOME = ROUTES.admin;
export const LOGIN_PATH = `${ADMIN_HOME}/login`;

export const API_PATHS = {
  login: "/admin/login",
  logout: "/admin/logout",
  me: "/admin/me",
} as const;

export const LIMITS = { username: 50, password: 200 } as const;

export const DEFAULT_RETRY_SECONDS = 60;

export const TABS = [
  { id: "reviews", icon: "chat", path: `${ADMIN_HOME}/reviews` },
  { id: "menu", icon: "cup", path: `${ADMIN_HOME}/menu` },
  { id: "settings", icon: "settings", path: `${ADMIN_HOME}/settings` },
] as const satisfies readonly { id: string; icon: IconName; path: string }[];

export type TabId = (typeof TABS)[number]["id"];

export const DEFAULT_TAB_PATH = TABS[0].path;
