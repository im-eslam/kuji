import type { ReactNode } from "react";
import { cx } from "./classes";

interface NoticeProps {
  tone: "info" | "error";
  role: "status" | "alert";
  children: ReactNode;
}

const styles = {
  base: "text-small rounded-lg border px-4 py-3 font-bold",
  info: "border-arctic bg-mist text-navy",
  error: "border-error/30 bg-error/10 text-error",
};

export function Notice({ tone, role, children }: NoticeProps) {
  return (
    <div role={role} className={cx(styles.base, styles[tone])}>
      {children}
    </div>
  );
}
