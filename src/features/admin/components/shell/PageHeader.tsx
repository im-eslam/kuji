import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  // Buttons for the page; they wrap under the title on narrow screens.
  actions?: ReactNode;
}

const styles = {
  header:
    "mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
  text: "flex min-w-0 flex-col gap-1",
  title: "text-title font-bold text-balance",
  description: "text-small text-navy/65",
  actions: "flex flex-wrap items-center gap-2",
};

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.text}>
        <h1 className={styles.title}>{title}</h1>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  );
}
