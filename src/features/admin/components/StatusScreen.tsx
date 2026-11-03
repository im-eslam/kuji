import { Button } from "./ui/Button";
import { Spinner } from "./ui/Spinner";

interface StatusScreenProps {
  message: string;
  retryLabel?: string;
  onRetry?: () => void;
}

const styles = {
  screen:
    "mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-6 py-10",
  card: "animate-fade-in motion-reduce:animate-none flex flex-col items-center gap-4 rounded-lg border border-white/70 bg-white/80 p-6 text-center",
  message: "text-body font-bold text-balance",
};

export function StatusScreen({
  message,
  retryLabel,
  onRetry,
}: StatusScreenProps) {
  const canRetry = onRetry !== undefined && retryLabel !== undefined;

  return (
    <main className={styles.screen}>
      <div role={canRetry ? "alert" : "status"} className={styles.card}>
        {!canRetry && <Spinner className="size-6" />}
        <p className={styles.message}>{message}</p>
        {canRetry && (
          <Button variant="secondary" icon="refresh" onPress={onRetry}>
            {retryLabel}
          </Button>
        )}
      </div>
    </main>
  );
}
