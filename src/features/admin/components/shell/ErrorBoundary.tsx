import { Component, type ReactNode } from "react";
import { useStrings } from "@/shared/i18n";
import { strings } from "../../localization/strings";
import { Button } from "../ui/Button";

interface ErrorBoundaryProps {
  // Changing this (the current path) clears a previous error.
  resetKey: string;
  children: ReactNode;
}

interface ErrorBoundaryState {
  failed: boolean;
}

const styles = {
  card: "flex flex-col items-start gap-4 rounded-lg border border-white/70 bg-white/80 p-6",
  title: "text-title font-bold text-balance",
  hint: "text-small text-navy/65",
};

function ErrorFallback({ onRetry }: { onRetry: () => void }) {
  const s = useStrings(strings);

  return (
    <div role="alert" className={styles.card}>
      <h1 className={styles.title}>{s.errorTitle}</h1>
      <p className={styles.hint}>{s.errorHint}</p>
      <Button variant="secondary" icon="refresh" onPress={onRetry}>
        {s.retry}
      </Button>
    </div>
  );
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: Error) {
    console.error("Admin section failed to render", error);
  }

  componentDidUpdate(previous: ErrorBoundaryProps) {
    if (this.state.failed && previous.resetKey !== this.props.resetKey) {
      this.setState({ failed: false });
    }
  }

  render() {
    if (this.state.failed) {
      return <ErrorFallback onRetry={() => this.setState({ failed: false })} />;
    }
    return this.props.children;
  }
}
