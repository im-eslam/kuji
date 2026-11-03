import { useRef, type ReactNode } from "react";
import { useStrings } from "@/shared/i18n";
import { usePath } from "@/shared/router";
import { ErrorBoundary } from "./components/shell/ErrorBoundary";
import { MobileBar } from "./components/shell/MobileBar";
import { Sidebar } from "./components/shell/Sidebar";
import { strings } from "./localization/strings";

const styles = {
  shell: "lg:flex",
  skipLink:
    "text-small fixed start-4 top-4 z-50 -translate-y-24 rounded-full bg-navy px-5 py-3 font-bold text-white transition-transform focus:translate-y-0 focus:outline-2 focus:-outline-offset-4 focus:outline-yellow motion-reduce:transition-none",
  column: "min-w-0 flex-1",
  main: "outline-none",
  page: "mx-auto w-full max-w-5xl px-4 py-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] lg:px-8 lg:py-8",
  content: "animate-reveal-in motion-reduce:animate-none",
};

export function AdminShell({ children }: { children: ReactNode }) {
  const s = useStrings(strings);
  const path = usePath();
  const main = useRef<HTMLElement>(null);

  return (
    <div className={styles.shell}>
      <a
        href="#admin-main"
        onClick={(event) => {
          event.preventDefault();
          main.current?.focus();
        }}
        className={styles.skipLink}
      >
        {s.skipToContent}
      </a>
      <Sidebar />
      <div className={styles.column}>
        <MobileBar />
        <main id="admin-main" ref={main} tabIndex={-1} className={styles.main}>
          <div className={styles.page}>
            <ErrorBoundary resetKey={path}>
              <div key={path} className={styles.content}>
                {children}
              </div>
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
}
