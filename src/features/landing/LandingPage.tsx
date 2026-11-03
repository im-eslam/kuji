import avatar from "@/assets/avatar.jpg";
import wordmark from "@/assets/wordmark.png";
import { setLocale, useLocale, useStrings } from "@/shared/i18n";
import { ROUTES } from "@/shared/routes";
import { ActionCard } from "./components/ActionCard";
import { Background } from "./components/Background";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { LanguageToggle } from "./components/LanguageToggle";
import { site } from "./data/site";
import { strings } from "./localization/strings";

const styles = {
  page: "relative isolate min-h-dvh",
  container:
    "relative mx-auto flex min-h-dvh w-full max-w-md flex-col gap-8 px-6 pt-6 pb-[max(2.5rem,env(safe-area-inset-bottom))]",
  toggleSlot: "absolute end-6 top-6 z-10",
  nav: "flex flex-1 flex-col gap-6",
  group: "flex flex-col gap-3",
  groupTitle: "text-small text-navy/65 px-1 font-bold",
};

export function LandingPage() {
  const s = useStrings(strings);
  const locale = useLocale();
  const otherLocale = locale === "en" ? "ar" : "en";

  return (
    <div className={styles.page}>
      <Background />

      <div className={styles.container}>
        <div className={styles.toggleSlot}>
          <LanguageToggle
            label={s.languageName}
            ariaLabel={s.switchToLanguage}
            lang={otherLocale}
            onPress={() => setLocale(otherLocale)}
          />
        </div>

        <Header
          brandName={site.brandName}
          avatarSrc={avatar}
          wordmarkSrc={wordmark}
          taglineLead={s.taglineLead}
          taglineEmphasis={s.taglineEmphasis}
        />

        <nav aria-label={site.brandName} className={styles.nav}>
          <div className={styles.group}>
            <ActionCard
              href={ROUTES.menu}
              icon="cup"
              title={s.menuTitle}
              hint={s.menuHint}
              tone="featured"
            />
            <ActionCard
              href={ROUTES.review}
              icon="star"
              title={s.reviewTitle}
              hint={s.reviewHint}
            />
          </div>

          <section className={styles.group}>
            <h2 className={styles.groupTitle}>{s.followUs}</h2>
            <ActionCard
              href={site.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              icon="instagram"
              title={site.instagram.name}
              hint={site.instagram.handle}
              tone="social"
              newTabLabel={s.newTab}
            />
          </section>

          <section className={styles.group}>
            <h2 className={styles.groupTitle}>{s.findUs}</h2>
            {site.branches.map((branch) => (
              <ActionCard
                key={branch.id}
                href={branch.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                icon="pin"
                title={s.branchNames[branch.id]}
                newTabLabel={s.newTab}
              />
            ))}
          </section>
        </nav>

        <Footer
          lead={s.footerLead}
          emphasis={s.footerEmphasis}
          copyright={`© ${new Date().getFullYear()} ${site.brandName}`}
        />
      </div>
    </div>
  );
}
