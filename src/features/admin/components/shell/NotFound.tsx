import { Link } from "react-aria-components";
import { useStrings } from "@/shared/i18n";
import { ADMIN_HOME } from "../../config";
import { strings } from "../../localization/strings";
import { cx, focusRingOnDark } from "../ui/classes";
import { PageHeader } from "./PageHeader";

const styles = {
  link: cx(
    "text-small inline-flex min-h-12 items-center justify-center rounded-full bg-navy px-6 font-bold text-white transition motion-reduce:transition-none data-hovered:bg-navy/90 data-pressed:scale-[0.98] motion-reduce:data-pressed:scale-100",
    focusRingOnDark,
  ),
};

export function NotFound() {
  const s = useStrings(strings);

  return (
    <>
      <PageHeader title={s.notFoundTitle} description={s.notFoundHint} />
      <Link href={ADMIN_HOME} className={styles.link}>
        {s.notFoundAction}
      </Link>
    </>
  );
}
