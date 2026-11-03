import { useEffect, useRef, type ReactNode } from "react";
import { useStrings } from "@/shared/i18n";
import { navigate, usePath } from "@/shared/router";
import { AdminShell } from "./AdminShell";
import { Background } from "./components/Background";
import { NotFound } from "./components/shell/NotFound";
import { TabPlaceholder } from "./components/shell/TabPlaceholder";
import { StatusScreen } from "./components/StatusScreen";
import {
  ADMIN_HOME,
  DEFAULT_TAB_PATH,
  LOGIN_PATH,
  TABS,
  type TabId,
} from "./config";
import { ensureSession, retrySession, useSession } from "./data/session";
import { usePageMeta } from "./hooks/usePageMeta";
import { LoginPage } from "./LoginPage";
import { strings } from "./localization/strings";

function renderTab(id: TabId): ReactNode {
  return <TabPlaceholder id={id} />;
}

export function AdminPage() {
  const s = useStrings(strings);
  const path = usePath();
  const session = useSession();
  const returnTo = useRef<string | null>(null);

  const tab = TABS.find((item) => item.path === path);
  const onLogin = path === LOGIN_PATH;
  const atHome = path === ADMIN_HOME;

  useEffect(() => {
    ensureSession();
  }, []);

  useEffect(() => {
    if (session.status === "signedOut" && !onLogin) {
      if (tab) returnTo.current = tab.path;
      navigate(LOGIN_PATH, { replace: true });
    } else if (session.status === "signedIn" && (onLogin || atHome)) {
      const target = returnTo.current ?? DEFAULT_TAB_PATH;
      returnTo.current = null;
      navigate(target, { replace: true });
    }
  }, [session.status, onLogin, atHome, tab]);

  let title = s.adminBadge;
  let screen: ReactNode;

  if (session.status === "checking") {
    screen = <StatusScreen message={s.checking} />;
  } else if (session.status === "unavailable") {
    screen = (
      <StatusScreen
        message={s.unavailable}
        retryLabel={s.retry}
        onRetry={retrySession}
      />
    );
  } else if (session.status === "signedOut") {
    title = s.loginTitle;
    screen = <LoginPage reason={session.reason} />;
  } else if (onLogin || atHome) {
    screen = <StatusScreen message={s.checking} />;
  } else {
    title = tab ? s.tabs[tab.id] : s.notFoundTitle;
    screen = <AdminShell>{tab ? renderTab(tab.id) : <NotFound />}</AdminShell>;
  }

  usePageMeta(title);

  return (
    <div className="relative isolate min-h-dvh">
      <Background />
      {screen}
    </div>
  );
}
