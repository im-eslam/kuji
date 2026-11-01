import { Fragment } from "react";
import { useLocale, useStrings } from "@/shared/i18n";
import { CategorySection, PairingsSection, SectionDivider, SignaturesSection } from "../components";
import { useMenuState } from "../hooks/useMenuState";
import { strings } from "../strings";

interface Props {
  register: (id: string) => (el: HTMLElement | null) => void;
}

/** The scrollable body: signatures, pairings, then every category, each registered with the scroll-spy. */
export function MenuSections({ register }: Props) {
  const { db, openItem, openOffer } = useMenuState();
  const locale = useLocale();
  const t = useStrings(strings);
  const pick = (text: { en: string; ar: string }) => text[locale];

  return (
    <>
      {db.signatures.length > 0 && (
        <>
          <SignaturesSection
            items={db.signatures}
            title={t.signaturesTitle}
            sub={t.signaturesSub}
            pick={pick}
            onOpen={openItem}
            sectionRef={register("signatures")}
          />
          <SectionDivider />
        </>
      )}
      {db.pairings.length > 0 && (
        <>
          <PairingsSection
            pairings={db.pairings}
            title={t.pairingsTitle}
            sub={t.pairingsSub}
            pick={pick}
            onOpen={openOffer}
            sectionRef={register("pairings")}
          />
          <SectionDivider />
        </>
      )}
      {db.categories.map((category, i) => (
        <Fragment key={category.id}>
          <CategorySection
            category={category}
            pillLabel={pick(category.name)}
            title={pick(category.name)}
            products={db.productsByCategory.get(category.id) ?? []}
            pick={pick}
            onOpen={openItem}
            sectionRef={register(category.id)}
          />
          {i < db.categories.length - 1 && <SectionDivider />}
        </Fragment>
      ))}
    </>
  );
}
