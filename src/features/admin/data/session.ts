import { useSyncExternalStore } from "react";
import { ApiError, getJson, postJson, type ApiSuccess } from "@/shared/api";
import { setLocale, type Locale } from "@/shared/i18n";
import { API_PATHS } from "../config";

export interface AdminUser {
  username: string;
  language: Locale;
}

export type SignedOutReason = "none" | "expired" | "logoutFailed";

export type Session =
  | { status: "checking" }
  | { status: "unavailable" }
  | { status: "signedIn"; user: AdminUser }
  | { status: "signedOut"; reason: SignedOutReason };

const listeners = new Set<() => void>();

let session: Session = { status: "checking" };
let epoch = 0;
let started = false;

function setSession(next: Session) {
  session = next;
  listeners.forEach((notify) => notify());
}

function subscribe(notify: () => void) {
  listeners.add(notify);
  return () => {
    listeners.delete(notify);
  };
}

function getSnapshot(): Session {
  return session;
}

export function useSession(): Session {
  return useSyncExternalStore(subscribe, getSnapshot);
}

export function sessionEpoch(): number {
  return epoch;
}

function readUser(value: unknown): AdminUser | null {
  if (typeof value !== "object" || value === null) return null;
  const { username, language } = value as Record<string, unknown>;
  if (typeof username !== "string") return null;
  if (language !== "en" && language !== "ar") return null;
  return { username, language };
}

function setSignedIn(user: AdminUser) {
  epoch += 1;
  setLocale(user.language);
  setSession({ status: "signedIn", user });
}

async function checkSession() {
  try {
    const data = await getJson<{ user?: unknown }>(API_PATHS.me);
    const user = readUser(data.user);
    if (user) setSignedIn(user);
    else setSession({ status: "unavailable" });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      setSession({ status: "signedOut", reason: "none" });
    } else {
      setSession({ status: "unavailable" });
    }
  }
}

export function ensureSession() {
  if (started) return;
  started = true;
  void checkSession();
}

export function retrySession() {
  setSession({ status: "checking" });
  void checkSession();
}

export async function signIn(username: string, password: string) {
  const data = await postJson<ApiSuccess>(API_PATHS.login, {
    username,
    password,
  });
  const user = readUser(data.user);
  if (!user) {
    throw new ApiError(200, "Invalid server response", "INVALID_RESPONSE");
  }
  setSignedIn(user);
}

export async function signOut() {
  let reason: SignedOutReason = "none";
  try {
    await postJson(API_PATHS.logout, {});
  } catch {
    reason = "logoutFailed";
  }
  setSession({ status: "signedOut", reason });
}

export function expireSession(fromEpoch: number) {
  if (session.status !== "signedIn" || fromEpoch !== epoch) return;
  setSession({ status: "signedOut", reason: "expired" });
}

export function updateUser(user: AdminUser) {
  if (session.status !== "signedIn") return;
  setLocale(user.language);
  setSession({ status: "signedIn", user });
}
