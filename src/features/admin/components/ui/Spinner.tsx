import { cx } from "./classes";

export function Spinner({ className = "size-5" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cx(
        "inline-block shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none",
        className,
      )}
    />
  );
}
