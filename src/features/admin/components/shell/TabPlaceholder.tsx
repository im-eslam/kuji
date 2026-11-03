import { useStrings } from "@/shared/i18n";
import { Icon } from "@/shared/icons";
import { TABS, type TabId } from "../../config";
import { strings } from "../../localization/strings";
import { PageHeader } from "./PageHeader";

const styles = {
  card: "flex flex-col items-center gap-4 rounded-lg border border-white/70 bg-white/80 p-8 text-center",
  bubble: "grid size-16 place-items-center rounded-full bg-arctic",
  icon: "size-8",
  hint: "text-small max-w-xs text-navy/65",
  badge: "text-caption rounded-full bg-navy px-3 py-1 font-bold text-yellow",
};

export function TabPlaceholder({ id }: { id: TabId }) {
  const s = useStrings(strings);
  const tab = TABS.find((item) => item.id === id) ?? TABS[0];

  return (
    <>
      <PageHeader title={s.tabs[id]} />
      <div className={styles.card}>
        <span className={styles.bubble}>
          <Icon name={tab.icon} className={styles.icon} />
        </span>
        <p className={styles.hint}>{s.tabHints[id]}</p>
        <span className={styles.badge}>{s.comingSoon}</span>
      </div>
    </>
  );
}
