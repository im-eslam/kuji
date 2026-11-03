import { useEffect, useRef, useState } from "react";
import avatar from "@/assets/avatar.jpg";
import wordmark from "@/assets/wordmark.png";
import { ApiError } from "@/shared/api";
import { useStrings } from "@/shared/i18n";
import { LoginForm } from "./components/login/LoginForm";
import { Notice } from "./components/ui/Notice";
import { DEFAULT_RETRY_SECONDS } from "./config";
import { signIn, type SignedOutReason } from "./data/session";
import { strings } from "./localization/strings";

type LoginError = "credentials" | "blocked" | "network" | "server";
type Failure = { error: LoginError } | { lockedFor: number };

const styles = {
  column:
    "mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-8 px-6 py-10 pb-[max(2.5rem,env(safe-area-inset-bottom))]",
  brand: "flex flex-col items-center gap-3",
  avatar:
    "size-[clamp(5rem,24vw,6.5rem)] rounded-full object-cover ring-4 ring-white/70",
  wordmark: "h-[clamp(2.75rem,13vw,3.5rem)] w-auto",
  badge: "text-caption rounded-full bg-navy px-3 py-1 font-bold text-yellow",
  card: "animate-reveal-in motion-reduce:animate-none flex flex-col gap-6 rounded-lg border border-white/70 bg-white/80 p-6",
  title: "text-title text-center font-bold text-balance",
  messages: "flex flex-col gap-3 empty:hidden",
};

function classify(error: unknown): Failure {
  if (!(error instanceof ApiError)) return { error: "network" };
  if (error.status === 429) {
    return { lockedFor: error.retryAfter ?? DEFAULT_RETRY_SECONDS };
  }
  if (error.code === "NETWORK_ERROR" || error.code === "TIMEOUT") {
    return { error: "network" };
  }
  if (error.status === 401) return { error: "credentials" };
  if (error.status === 403) return { error: "blocked" };
  return { error: "server" };
}

export function LoginPage({ reason }: { reason: SignedOutReason }) {
  const s = useStrings(strings);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<LoginError | null>(null);
  const [lockedFor, setLockedFor] = useState<number | null>(null);
  const submitting = useRef(false);

  useEffect(() => {
    if (lockedFor === null) return;
    const timer = window.setTimeout(() => setLockedFor(null), lockedFor * 1000);
    return () => window.clearTimeout(timer);
  }, [lockedFor]);

  const errorMessages: Record<LoginError, string> = {
    credentials: s.errorCredentials,
    blocked: s.errorBlocked,
    network: s.errorNetwork,
    server: s.errorServer,
  };

  async function submit(username: string, password: string) {
    if (submitting.current) return;
    submitting.current = true;
    setIsPending(true);
    setError(null);
    try {
      await signIn(username, password);
    } catch (caught) {
      const failure = classify(caught);
      if ("lockedFor" in failure) setLockedFor(failure.lockedFor);
      else setError(failure.error);
      submitting.current = false;
      setIsPending(false);
    }
  }

  return (
    <div className={styles.column}>
      <div className={styles.brand}>
        <img
          src={avatar}
          alt=""
          width={240}
          height={240}
          fetchPriority="high"
          className={styles.avatar}
        />
        <img
          src={wordmark}
          alt={s.brandName}
          width={190}
          height={112}
          className={styles.wordmark}
        />
        <span className={styles.badge}>{s.adminBadge}</span>
      </div>

      <main className={styles.card}>
        <h1 className={styles.title}>{s.loginTitle}</h1>

        <div className={styles.messages}>
          {reason === "expired" && (
            <Notice tone="info" role="status">
              {s.sessionExpired}
            </Notice>
          )}
          {reason === "logoutFailed" && (
            <Notice tone="info" role="status">
              {s.logoutIncomplete}
            </Notice>
          )}
          {error && (
            <Notice tone="error" role="alert">
              {errorMessages[error]}
            </Notice>
          )}
          {lockedFor !== null && (
            <Notice tone="error" role="alert">
              {s.rateLimited}
            </Notice>
          )}
        </div>

        <LoginForm
          isPending={isPending}
          isLocked={lockedFor !== null}
          focusPassword={error === "credentials"}
          onSubmit={submit}
        />
      </main>
    </div>
  );
}
