import { useSyncExternalStore, type MouseEvent } from "react";
import { ROUTES } from "./routes";

const listeners = new Set<() => void>();

function currentPath(): string {
  return window.location.pathname.replace(/\/+$/, "") || ROUTES.landing;
}

function notifyListeners() {
  listeners.forEach((notify) => notify());
}

function subscribe(notify: () => void) {
  listeners.add(notify);
  return () => {
    listeners.delete(notify);
  };
}

window.addEventListener("popstate", notifyListeners);

function isModifiedClick(event: MouseEvent<HTMLAnchorElement>): boolean {
  return (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  );
}

function isInternalLink(link: HTMLAnchorElement): boolean {
  const href = link.getAttribute("href");
  return (
    !!href &&
    href.startsWith("/") &&
    !href.startsWith("//") &&
    (!link.target || link.target === "_self") &&
    !link.hasAttribute("download")
  );
}

export function usePath(): string {
  return useSyncExternalStore(subscribe, currentPath);
}

export function navigate(path: string, options: { replace?: boolean } = {}) {
  if (path === currentPath()) return;
  if (options.replace) window.history.replaceState(null, "", path);
  else window.history.pushState(null, "", path);
  window.scrollTo(0, 0);
  notifyListeners();
}

export function handleInternalClick(event: MouseEvent<HTMLAnchorElement>) {
  if (isModifiedClick(event) || !isInternalLink(event.currentTarget)) return;
  event.preventDefault();
  navigate(event.currentTarget.getAttribute("href")!);
}
